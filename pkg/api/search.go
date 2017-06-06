package api

import (
	"strconv"

	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/metrics"
	"github.com/grafana/grafana/pkg/middleware"
	m "github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/services/search"
)

func Search(c *middleware.Context) {
	query := c.Query("query")
	tags := c.QueryStrings("tag")
	starred := c.Query("starred")
	limit := c.QueryInt("limit")

	if limit == 0 {
		limit = 1000
	}

	dbids := make([]int, 0)
	for _, id := range c.QueryStrings("dashboardIds") {
		dashboardId, err := strconv.Atoi(id)
		if err == nil {
			dbids = append(dbids, dashboardId)
		}
	}

	searchQuery := search.Query{
		Title:        query,
		Tags:         tags,
		UserId:       c.UserId,
		Limit:        limit,
		IsStarred:    starred == "true",
		OrgId:        c.OrgId,
		DashboardIds: dbids,
	}

	err := bus.Dispatch(&searchQuery)
	if err != nil {
		c.JsonApiErr(500, "Search failed", err)
		return
	}

	prefsQuery := m.GetPreferencesWithDefaultsQuery{OrgId: c.OrgId, UserId: c.UserId}
	if err := bus.Dispatch(&prefsQuery); err != nil {
		c.JsonApiErr(500, "Failed to get preferences", err)
	}

	dashboards := search.HitList{}
	if prefsQuery.Result.HomeDashboardId != 0 {
		for _, hit := range searchQuery.Result {
			if prefsQuery.Result.HomeDashboardId != hit.Id {
				dashboards = append(dashboards, hit)
			}
		}
	} else {
		dashboards = searchQuery.Result
	}

	c.TimeRequest(metrics.M_Api_Dashboard_Search)
	c.JSON(200, dashboards)
}
