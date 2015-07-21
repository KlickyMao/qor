package publish

import (
	"fmt"

	"github.com/jinzhu/gorm"
)

func isDraftMode(scope *gorm.Scope) bool {
	if draftMode, ok := scope.Get("publish:draft_mode"); ok {
		if isDraft, ok := draftMode.(bool); ok && isDraft {
			return true
		}
	}
	return false
}

func setTableAndPublishStatus(ensureDraftMode bool) func(*gorm.Scope) {
	return func(scope *gorm.Scope) {
		if isPublishableModel(scope.Value) {
			scope.InstanceSet("publish:supported_model", true)

			if ensureDraftMode {
				scope.Set("publish:force_draft_mode", true)
				scope.Search.Table(draftTableName(scope.TableName()))
			}
		}
	}
}

func setPublishStatusColumnToDirty(scope *gorm.Scope) {
	if isPublishableModel(scope.Value) && isDraftMode(scope) {
		scope.SetColumn("PublishStatus", DIRTY)
	}
}

// only set publish status to dirty if there are updates
func updateDraftTablePublishStatusToDirty(scope *gorm.Scope) {
	if isPublishableModel(scope.Value) && isDraftMode(scope) {
		if t, ok := scope.DB().Get("publish:updating_publish_status"); !ok || !t.(bool) {
			if scope.DB().RowsAffected > 0 {
				scope.DB().Set("publish:updating_publish_status", true).Where("publish_status = ?", PUBLISHED).UpdateColumn("publish_status", DIRTY)
			}
		}
	}
}

func getModeAndNewScope(scope *gorm.Scope) (isProduction bool, clone *gorm.Scope) {
	if draftMode, ok := scope.Get("publish:draft_mode"); !ok || !draftMode.(bool) {
		if _, ok := scope.InstanceGet("publish:supported_model"); ok {
			table := originalTableName(scope.TableName())
			clone := scope.New(scope.Value)
			clone.Search.Table(table)
			return true, clone
		}
	}
	return false, nil
}

func syncToProductionAfterCreate(scope *gorm.Scope) {
	if ok, clone := getModeAndNewScope(scope); ok {
		gorm.Create(clone)
	}
}

func syncToProductionAfterUpdate(scope *gorm.Scope) {
	if ok, clone := getModeAndNewScope(scope); ok {
		if updateAttrs, ok := scope.InstanceGet("gorm:update_attrs"); ok {
			table := originalTableName(scope.TableName())
			clone.Search = scope.Search
			clone.Search.Table(table)
			clone.InstanceSet("gorm:update_attrs", updateAttrs)
		}
		gorm.Update(clone)
	}
}

func syncToProductionAfterDelete(scope *gorm.Scope) {
	if ok, clone := getModeAndNewScope(scope); ok {
		gorm.Delete(clone)
	}
}

func deleteScope(scope *gorm.Scope) {
	if !scope.HasError() {
		_, supportedModel := scope.InstanceGet("publish:supported_model")
		isDraftMode, ok := scope.Get("publish:draft_mode")

		if supportedModel && (ok && isDraftMode.(bool)) {
			scope.Raw(
				fmt.Sprintf("UPDATE %v SET deleted_at=%v, publish_status=%v %v",
					scope.QuotedTableName(),
					scope.AddToVars(gorm.NowFunc()),
					scope.AddToVars(DIRTY),
					scope.CombinedConditionSql(),
				))
			scope.Exec()
		} else {
			gorm.Delete(scope)
		}
	}
}
