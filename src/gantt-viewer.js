
class GanttViewer{
    constructor(dom_id){
        this.dom_id = dom_id;
    }

    // データをもとに描画
    data(cur_data){
        // 日付のmin/maxを取得
        let min_dt = d3.min(cur_data.map(d => new Date(d['start_dt'])));
        let max_dt = d3.max(cur_data.map(d => new Date(d['end_dt'])));
        let graph_min_dt = new Date();
        let graph_max_dt = new Date();
        graph_min_dt.setDate(min_dt.getDate() - min_dt.getDay() + 1);   // １つ前の月曜日を取得
        graph_max_dt.setDate(max_dt.getDate() + (7-max_dt.getDay()) + 1);   // 次の月曜日を取得
        // min～maxの週の数
        let week_num = ((graph_max_dt.getTime() - graph_min_dt.getTime())/(24*60*60*1000)) / 7;

        // 描画 -------------
        // 設定
        const padding_left = 120;
        const padding_right = 10;
        const padding_top = 20;
        const padding_bottom = 10;
        const one_line_height = 50;

        // 全体設定
        let dom = d3.select(this.dom_id);
        let svg_width = dom.node().clientWidth;
        let svg_height = one_line_height * cur_data.length + padding_top + padding_bottom;
        let svg = dom
            .append("svg")
            .attr("width", svg_width)
            .attr("height", svg_height);
        
        // 軸スケールを定義
        const xScale = d3
            .scaleTime()
            .domain([graph_min_dt, graph_max_dt])
            .range([padding_left, svg_width-padding_right]);
        const yScale = d3
            .scaleLinear()
            .domain([0, cur_data.length+1])
            .range([padding_top, svg_height-padding_bottom]);

        // x軸を表示
        const axisx = d3
            .axisTop(xScale)
            .ticks(week_num)  // １週間ごとに目盛り
            .tickFormat(d3.timeFormat("%-m/%-d"));
        svg
            .append("g")
            .attr("class", "axis axis-x")
            .attr("transform", "translate(0,"+(padding_top)+")")
            .call(axisx);

        // y軸を表示
        const axisy = d3
            .axisLeft(yScale)
            .ticks(cur_data.length);
        let y = svg
            .append("g")
            .attr("class", "axis axis-y")
            .attr("transform", "translate("+(padding_left)+",0)")
            .call(axisy);
    }
}

