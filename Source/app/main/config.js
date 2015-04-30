define(function() {
    'use strict';
    var share = angular.module('share', []);
    var HOST = 'https://app.penetrace.com';
    var originHost = window.location.protocol + "//" + window.location.host + "/";
    var HOST_URL = originHost.indexOf('localhost') == -1 ? originHost : 'https://beta.penetrace.com';
    share.constant('PUBLISHED', false);
    share.constant('HOST', HOST_URL);
    share.constant('HOST_URL', HOST_URL);
    share.constant('API', 'api');
    share.constant('VERSION', 'v1');
    share.value('language', 'EN');
    share.constant('LANGUAGE_DEFAULT', 'EN');

    share.constant('ROUTE_APP', {
        //TODO: app
        'dragFilter': ['dashboard/dashboard', 'Shared'],
        'dashboard': ['dashboard/dashboard', 'Tracker', 'Shared'],
        'brands': ['trendMonitor/edit/tmEdit', 'Tracker', 'Shared'],
        'brands.trendMonitor': ['trendMonitor/edit/tmEdit', 'Tracker', 'Shared'],
        'brands.trendMonitor.edit': ['trendMonitor/edit/tmEdit', 'Trakcer', 'Shared'],
        'brands.trendMonitor.edit.newchart': ['trendMonitor/edit/tmEdit', 'Tracker', 'Shared'],
        'brands.trendMonitor.edit.newtopic': ['trendMonitor/edit/tmEdit', 'Tracker', 'Shared'],
        'brands.trendMonitor.edit.topic': ['trendMonitor/edit/tmEdit', 'Tracker', 'Shared'],
        'brands.trendMonitor.edit.topicPPT': ['trendMonitor/edit/tmEdit', 'Tracker', 'Shared'],
        'brands.trendMonitor.edit.topicNoPage': ['trendMonitor/edit/tmEdit', 'Tracker', 'Shared'],
        'brands.trendMonitor.edit.graph': ['trendMonitor/edit/tmEdit', 'Tracker', 'Shared'],
        'brands.trendMonitor.edit.reload': ['trendMonitor/edit/tmEdit', 'Tracker', 'Shared'],
        'offline': ['trendMonitor/edit/tmEdit', 'Tracker', 'Shared'],
        'offlineGraphId': ['trendMonitor/edit/tmEdit', 'Tracker', 'Shared'],
        'fullScreen': ['trendMonitor/edit/tmEdit', 'Tracker', 'Shared'],
        'reportSettings': ['trendMonitor/edit/tmEdit', 'Tracker', 'Shared'],
        'blank': ['trendMonitor/blank/tmBlank', 'Shared'],
        //TODO: public
        '/login': ['account/login/acLogin', 'Penetrace.Login'],
        '/new-password': ['account/newPassword/acNewPassword', 'Penetrace.Login'],
        '/register': ['account/register/acRegister', 'Tracker'],
        '/sign-up-done': ['account/register/signUpDone/acReSignUpDone', 'Penetrace.Login'],
        '/new-password-is-sent': ['account/newPassword/newPasswordIsSent/acNpIsSent', 'Penetrace.Login']
    });
    share.constant('LANGUAGE_HELPER_URL', {
        'blank': 'Texts/List?path=',
        'Penetrace.Login': 'Texts/List?path=Penetrace.Login',
        'TrendMonitor': 'Texts/List?path=TrendMonitor',
        'Tracker': 'Texts/List?path=Tracker',
        'TrackerFilter': 'Texts/List?path=Tracker',
        'Shared': 'Texts/List?path=Shared',
        'Report': ''
    });
    share.value('timestamp', {});
    share.value('languageHelperUrl', {});
    share.value('resourceUrl', {});
    share.constant('RESOURCE_URL', {
        graphsMove: 'TrendMonitors/Graphs/Move/',
        navigation: 'UI/Navigation/',
        activityOwnerNavigation: 'UI/ActivityOwnerNavigation/',
        authorization: 'Authorization/Logon',
        commentList: 'Comments/List',
        campaignIcon: 'TrendMonitors/Campaigns/',
        listChartTitle: 'TrendMonitors/TrendMonitor/',
        graph: 'TrendMonitors/Graphs/Graph/',
        trendMonitorsGraph: 'TrendMonitors/Graphs/Graph/',
        distribution: 'TrendMonitors/GraphDistribution/',
        users: 'Users/ListByActivityOwner/',
        archives: 'TrendMonitorReports/ListByTrendMonitor/',
        saveReportUrl: 'TrendMonitorReports/Save/',
        sendReportUrl: 'TrendMonitorReports/Send/',
        editReportUrl: 'TrendMonitorReports/TrendMonitorReport/',
        deleteReportUrl: 'TrendMonitorReports/Delete/',
        addComment: 'Comments/Add',
        editComment: 'Comments/Save/',
        deleteComment: 'Comments/Delete/',
        effectData: 'stubData/effectData.js',
        offlineReport: 'stubData/offline.js',
        salesData: HOST + '/PenetraceMVC/Tracker.aspx/SalesData',
        deleteGraph: 'TrendMonitors/Graphs/Delete',
        editGraphSetting: '/TrendMonitors/Graphs/Save/',
        tags: 'Tags/TagsPrEnterprise/',
        saveTopic: 'TrendMonitors/Topics/Save/',
        filterByTracker: 'TrendMonitors/Filters/ListByTrackerSurvey/',
        searchForQuestionsInTracker: '/TrendMonitors/Questions/',
        searchForQuestionAnswersInTracker: '/TrendMonitors/Answers/',
        saveTrackerFilter: '/TrendMonitors/Filters/Save/',
        getTrackerFilter: '/TrendMonitors/Filters/Filter/',
        getTrackerGridData: '/TrendMonitors/Data',
        getTrackerSingleData: '/TrendMonitors/Data',
        getWhereFilterIsIn: '/TrendMonitors/Filters/Usage/',
        newTopic: 'TrendMonitors/Topics/New/',
        clearCache: '/Cache/ClearAll',
        copyTopic: 'TrendMonitors/Topics/Copy/',
        deleteTopic: 'TrendMonitors/Topics/Delete/',
        copyGraph: '/TrendMonitors/Graphs/Copy',
        groupFilter: '/TrendMonitors/FilterGroups/FilterGroup/',
        saveGroupFilter: '/TrendMonitors/FilterGroups/Save/',
        groupsFilter: 'TrendMonitors/FilterGroups/ListByTrackerSurvey/',
        deleteGroupFilter: '/TrendMonitors/FilterGroups/Delete/',
        deleteFilter: '/TrendMonitors/Filters/Delete/',
        saveVisibleFilterGroups: 'TrendMonitors/Topics/SaveVisibleFilterGroups/',
        getTopic: '/TrendMonitors/Topics/Topic/',
        saveOrder: 'TrendMonitors/Topics/SaveSortOrder/'
    });
    share.constant('accountUrl', {
        register: "#register",
        newPassword: "#new-password",
    });
    share.constant('locationRoute', {
        'app': 'index.html#/',
        'public': 'public.html#/'
    });
    share.constant('HISTOGRAM_TYPE', {
        Date: 'Day',
        Month: 'Month',
        Week: 'Week',
        Quarter: 'Quarter',
        HalfYear: 'Half Year',
        Year: 'Year',
        Hour: 'Hour',
        Standard: 'standard',
        Simple: 'simple',
        Compact: 'compact',
        width100: 'width100',
        width50: 'width50'
    });
    share.constant('MODE_CHART', {
        offline: -1,
        newChart: '-2',
        viewMode: -3
    });
    share.constant('PUBLIC_URL', {
        register: "#register",
        newPassword: "#new-password",
    });
    share.constant('APP_ROUTE_URL', {
        app: 'index.html#/',
        fullScreen: '#/home/brand-home/trend-monitors/trend-monitor/full-screen',
        edit: '#/home/brand-home/trend-monitors/trend-monitor/edit',
        'public': 'public.html#/login'
    });
    share.constant('LOCAL_STORAGE', {
        storageTopic: 'topic',
        storageGraph: 'graph'
    });
    share.constant('DATE', {
        original: 'Original',
        day: 'Day',
        month: 'Month',
        week: 'Week',
        quarter: 'Quarter',
        halfYear: 'Half Year',
        halfYearValue: 'halfyear',
        year: 'Year',
        hour: 'Hour',
        dayLength: 1,
        weekLength: 7,
        monthLength: 30,
        quarterLength: 90,
        halfYearLength: 180,
        yearLength: 360,
        hourLength: 3600,
        dailyData: 'Daily Data',
        weeklyData: 'Weekly Data',
        monthlyData: 'Monthly Data',
        quarterlyData: 'Quarterly Data',
        yearlyData: 'Yearly Data',
        halfYearData: 'Half Year Data',
        hourlyData: 'Hourly Data',
        dayTimeStamp: 86400000,
        weekTimeStamp: 604800000,
        monthTimeStamp: 2592000000,
        quarterTimeStamp: 7776000000,
        halfYearTimeStamp: 15768000000,
        yearTimeStamp: 31536000000,
        hourTimeStamp: 3600000,
        dayNum: 1,
        dayOfWeek: 7,
        dayOfMonth: 30,
        dayOfQuarter: 90,
        dayOfHalfYear: 180,
        dayOfYear: 360,
        formatUrl: 'DD.MM.YYYY',
        formatNorway: 'DD.MM.YYYY',
        formatEN: 'MM/DD/YYYY',
        formatDenmark: 'DD/MM/YYYY',
        formatSweden: 'YYYY-MM-DD',
        Norway: 'NO',
        English: 'EN',
        Denmark: 'DK',
        Sweden: 'SV'
    });

    share.constant('CANCULATION', {
        sum: 'sum',
        average: 'average',
        min: 'min',
        max: 'max',
        median: 'median',
        range: 'range',
        variance: 'variance',
        stdDev: 'std .dev'
    });


    share.constant('ACCUMULATION', {
        noAccumulation: 'no accumulation',
        startToDate: 'start-to-date',
        YTD: 'YTD',
        MTD: 'MTD'
    });


    share.constant('DISPLAYRESULT', {
        positive: 'positive',
        neutral: 'neutral',
        negative: 'negative'
    });

    share.constant('CHARTTYPE', {
        bubble: 'bubble',
        columnsStacked: 'columnsStacked',
        KPI: 'kpi',
        bar: 'bar',
        pie: 'pie',
        spline: 'spline',
        spider: 'spider',
        barStacked: 'barsstacked',
        trend: 'trend',
        funnel: 'funnel',
        column: 'column',
        columns: 'columns',
        line: 'line',
        area: 'area',
        heatmap: 'heatmap',
        width100: 'width100',
        width50: 'width50',
        col14: 'col-md-14',
        col10: 'col-md-10',
        col24: 'col-md-24',
        col12: 'col-md-12',
        standard: 'standard',
        simple: 'simple',
        compact: 'compact',
        trackerSeries: 1,
        effectSeries: 2,
        graph: 'graph',
        left: 'left',
        right: 'right',
        center: 'center',
        leftAxis: 1,
        rightAxis: 2,
        themePenetrace: 'Penetrace',
        themeGray: 'Gray',
        themColdWarm: 'ColdWarm',
        firstHalfYear: '1. Half year ',
        secondHalfYear: '2. Half year '
    });
    share.constant('COMMENT_TYPE', {
        Article: 'Article',
        Activity: 'Activity',
        TrendMonitor: 'TrendMonitor',
        Graph: 'Graph',
        CommentOnComment: 'CommentOnComment'
    });
    share.constant('GRAPH_VIEW_TYPE', {
        listMode: 1,
        listWithMenuMode: 2,
        gridMode: 3,
        firstWideMode: 4,
        mixMode: 5,
        firstHalfMode: 6,
        view: 'view',
        edit: 'edit',
        viewEdit: 'viewEdit'
    });
    share.constant('TOPIC_TYPE', {
        list: 1,
        listMenu: 2,
        row2: 3,
        list122: 4,
        list121: 5,
        list211: 6,
        1: 'list',
        2: 'listMenu',
        3: 'row2',
        4: 'list122',
        5: 'list121',
        6: 'list211'
    });

    share.constant('HISTOGRAM_SORTING', {
        original: 0,
        highToLow: 1,
        lowToHigh: 2,
        az: 3,
        za: 4
    });
});
