package dtos

type Prefs struct {
	Theme           string `json:"theme"`
	HomeDashboardId int64  `json:"homeDashboardId"`
	Timezone        string `json:"timezone"`
}

type UpdatePrefsCmd struct {
	UserId          int64  `json:"userId"`
	OrgId           int64  `json:"orgId"`
	Theme           string `json:"theme"`
	HomeDashboardId int64  `json:"homeDashboardId"`
	Timezone        string `json:"timezone"`
}
