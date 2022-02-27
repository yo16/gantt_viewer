/*
gantt-viewer
Copyright (c) 2022 yo16
Released under the MIT license
*/

var COLOR_PALETTE = ['#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F', '#EDC948', '#B07AA1', '#FF9DA7', '#9C755F', '#BAB0AC'];


class GanttViewer{
    constructor(dom_id){
        this.dom_id = dom_id;
    }

    // データをもとに描画
    data(original_data, today_dt=new Date()){
        // 日付のmin/maxを取得
        let min_dt = d3.min(original_data.map(d => new Date(d['start_dt'])));
        let max_dt = d3.max(original_data.map(d => new Date(d['end_dt'])));
        let graph_min_dt = min_dt;
        let graph_max_dt = max_dt;
        graph_min_dt.setDate(min_dt.getDate() - min_dt.getDay() - 6);   // 前の週の月曜日を取得
        graph_max_dt.setDate(max_dt.getDate() + (7-max_dt.getDay()) + 1);   // 次の月曜日を取得
        // min～maxの週の数
        let week_num = ((graph_max_dt.getTime() - graph_min_dt.getTime())/(24*60*60*1000)) / 7;

        // データ前処理
        // [
        //      [ [開始日, 1], [開始日の次の日, 1], [次の日, 1], ... ,[終了日, 1] ],
        //      [ [開始日, 2], [開始日の次の日, 2], [次の日, 2], ... ,[終了日, 2] ],
        //       ...
        // の形にする
        let data = [];
        for(let i=0; i<original_data.length; i++){
            let line_data = [];
            let start_dt = new Date(original_data[i]['start_dt']);
            let end_dt = new Date(original_data[i]['end_dt']);
            for(
                let dt=start_dt;
                dt<=end_dt;
                dt.setDate(dt.getDate()+1)
            ){
                line_data.push([new Date(dt.getTime()), i+1]);
            }
            data.push(line_data);
        }

        // 描画 -------------
        // 設定
        const padding_left = 250;
        const padding_right = 10;
        const padding_top = 20;
        const padding_bottom = 10;
        const one_line_height = 60;     // １行の高さ
        const one_line_width = 30;      // 線の太さ

        // 全体設定
        let dom = d3.select(this.dom_id);
        let svg_width = dom.node().clientWidth;
        let svg_height = one_line_height * original_data.length + padding_top + padding_bottom;
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
            .domain([0.5, original_data.length+0.5])
            .range([padding_top, svg_height-padding_bottom]);

        // 背景の縞模様を描画
        this.draw_background(svg, original_data, yScale, one_line_height);

        // 軸を描画
        this.draw_axis(svg, xScale, yScale, week_num, padding_top, padding_left);

        // 今日を描画
        this.draw_today(svg, today_dt, xScale, padding_top);
        
        // 線を描画
        this.draw_lines(svg, data, original_data, xScale, yScale, one_line_width);

        // 説明を描画
        this.draw_items(svg, original_data, yScale, one_line_height, padding_left);
    }


    // 背景を描画
    draw_background(svg, original_data, yScale, one_line_height){
        /*
        let cur_data = [];
        // 1行おきに間引く
        for(let i=1; i<original_data.length; i+=2){
            cur_data.push(i+1);
        }

        // 描画
        svg
            .selectAll("rect.background-stripe")
            .data(cur_data)
            .enter()
            .append("rect")
            .attr("class", "background-stripe")
            .attr("x", "0")
            .attr("y", function(d){ return yScale(d)-(one_line_height/2);})
            .attr("width", svg.node().clientWidth)
            .attr("height", one_line_height)
            .attr("fill", "#f3f3f3");
        */
        // 全部の行に細い線を描く
        svg
            .selectAll("rect.background-line")
            .data(original_data)
            .enter()
            .append("line")
            .attr("class", "background-line")
            .attr("x1", 0)
            .attr("y1", function(d,i){ return yScale(i+1); })
            .attr("x2", svg.node().clientWidth)
            .attr("y2", function(d,i){ return yScale(i+1); })
            .attr("stroke-width", 3)
            .attr("stroke", "#f6f6f3");
    }

    
    // 軸を描画
    draw_axis(svg, xScale, yScale, week_num, padding_top, padding_left){
        // x軸を描画
        const axisx = d3
            .axisTop(xScale)
            .ticks(week_num)  // １週間ごとに目盛り
            .tickFormat(d3.timeFormat("%-m/%-d"));
        svg
            .append("g")
            .attr("class", "axis axis-x")
            .attr("transform", "translate(0,"+(padding_top)+")")
            .call(axisx);
        /*
        // y軸を描画
        const axisy = d3
            .axisLeft(yScale)
            .ticks(5);
        let y = svg
            .append("g")
            .attr("class", "axis axis-y")
            .attr("transform", "translate("+(padding_left)+",0)")
            .call(axisy);
        */
    }


    // 今日の線を描画
    draw_today(svg, today_dt, xScale, padding_top){
        // 設定
        const box_padding = -10; // 長方形の上辺の位置
        const width = 40;       // 長方形の幅
        const height_box = 10;  // 日付を描く長方形の高さ
        const height_tri = 5;  // 三角形の高さ
        const today_color = "#c66";
        
        // 位置計算
        let x = xScale(today_dt);
        let box_y = padding_top + box_padding;
        let points = [
            [x, box_y + height_box + height_tri],
            [x-width/2, box_y + height_box],
            [x-width/2, box_y],
            [x+width/2, box_y],
            [x+width/2, box_y + height_box]
        ];
        
        svg
            .append("polygon")
            .attr("class", "today_dt_box")
            .datum(points)
            .attr("points",function(d){
                return d.map(p => p.join(",")).join(" ")
            })
            .attr("fill", today_color)
            .attr("stroke", today_color)
            .attr("stroke-width", "6")
            .attr("stroke-linejoin", "round")
        ;
        // 日にち
        svg
            .append("text")
            .attr("class", "today_dt_text")
            .attr("x", x)
            .attr("y", box_y + height_box)
            .attr("text-anchor", "middle")
            .text((today_dt.getMonth()+1) + "/" + today_dt.getDate())
            .attr("font-size", height_box+"pt")
            .attr("fill", "#eee")
        ;
        // 線
        svg
            .append("line")
            .attr("x1", x)
            .attr("y1", box_y + height_box)
            .attr("x2", x)
            .attr("y2", svg.node().clientHeight)
            .attr("stroke", today_color)
            .attr("stroke-width", 2)

    }


    // 線を描画
    draw_lines(svg, data, original_data, xScale, yScale, one_line_width){
        // データを折れ線で描画
        for(let i=0; i<data.length; i++){
            // 色が指定されている場合はする
            let color = COLOR_PALETTE[0];
            if(original_data[i].hasOwnProperty("color")){
                color = original_data[i]["color"];
            }

            svg
                .append("path")
                .datum(data[i])
                .attr("class", "line"+(i+1))
                .attr("fill", "none")
                .attr("stroke", color)
                .attr("stroke-width", one_line_width)
                .attr("stroke-linecap", "round")
                .attr("d", d3.line()
                    .x(function(d){ return xScale(d[0]); })
                    .y(function(d){ return yScale(d[1]); })
                );
        }

        // 点も描画
        for(let i=0; i<data.length; i++){
            svg
                .selectAll("circle.line-point"+(i+1))
                .data(data[i])
                .enter()
                .append("circle")
                .attr("class", "line-point"+(i+1))
                .attr("cx", function(d){ return xScale(d[0]); })
                .attr("cy", function(d){ return yScale(d[1]); })
                .attr("fill", "rgba(255,255,255,0.4)")
                .attr("r", 4);
        }
        
        // 開始日と終了日を描画
        let dt2str = function(dt){
            return (dt.getMonth()+1) + "/" + dt.getDate();
        }
        let min_dts = [];
        let max_dts = [];
        for(let i=0; i<data.length; i++){
            let min_dt = d3.min(data[i].map(d => d[0]));
            let max_dt = d3.max(data[i].map(d => d[0]));
            // minの左にminの日にちを、maxの右にmaxの日にちを描く
            // 同じ場合はmaxのみ
            if(min_dt<max_dt){
                min_dts.push([new Date(min_dt.getTime()), i+1]);
            }
            max_dts.push([new Date(max_dt.getTime()), i+1]);
        }
        let box_width = 50;
        let box_height = 26;
        svg
            .selectAll("rect.line-point-startdt-background")
            .data(min_dts)
            .enter()
            .append("rect")
            .attr("class", "line-point-startdt-background")
            .attr("x", function(d){ return xScale(d[0])-19-box_width; })
            .attr("y", function(d){ return yScale(d[1])-box_height/2; })
            .attr("width", box_width)
            .attr("height", box_height)
            .attr("fill", "rgba(255,255,255,0.8)")
        ;
        svg
            .selectAll("rect.line-point-enddt-background")
            .data(max_dts)
            .enter()
            .append("rect")
            .attr("class", "line-point-enddt-background")
            .attr("x", function(d){ return xScale(d[0])+19; })
            .attr("y", function(d){ return yScale(d[1])-box_height/2; })
            .attr("width", box_width)
            .attr("height", box_height)
            .attr("fill", "rgba(255,255,255,0.8)")
        ;
        svg
            .selectAll("text.line-point-start")
            .data(min_dts)
            .enter()
            .append("text")
            .attr("class", "line-point-dt")
            .attr("class", "line-point-start-dt")
            .attr("x", function(d){ return xScale(d[0])-19; })
            .attr("y", function(d){ return yScale(d[1])+7; })
            .attr("text-anchor", "end")
            .text(function(d){ return dt2str(d[0]) })
            .attr("fill", "rgba(0,0,0,0.7)")
        ;
        svg
            .selectAll("text.line-point-end")
            .data(max_dts)
            .enter()
            .append("text")
            .attr("class", "line-point-dt")
            .attr("class", "line-point-end-dt")
            .attr("x", function(d){ return xScale(d[0])+19; })
            .attr("y", function(d){ return yScale(d[1])+7; })
            .text(function(d){ return dt2str(d[0]) })
            .attr("fill", "rgba(0,0,0,0.8)")
        ;
    }


    // 説明書きを描画
    draw_items(svg, original_data, yScale, one_line_height, graph_padding_left){
        const padding_left = 5;
        const padding_vertical = 5;

        // テキストを書くbox
        svg
            .selectAll("rect.comment-box")
            .data(original_data)
            .enter()
            .append("rect")
            .attr("class", "comment-box")
            .attr("x", padding_left)
            .attr("y", function(d, i){ return yScale(i+1)-(one_line_height/2)+padding_vertical; })
            .attr("width", graph_padding_left-padding_left)
            .attr("height", one_line_height-padding_vertical*2)
            .attr("fill", "#fff")
            .attr("stroke", "#ddd")
            .attr("stroke-width", "2")
            .attr("rx", "5");
        
        // 色サンプル
        let circle_r = 15;
        let circle_left_padding = 8;
        svg
            .selectAll("circle.comment-sample")
            .data(original_data)
            .enter()
            .append("circle")
            .attr("class", "comment-sample")
            .attr("cx", padding_left + circle_r + circle_left_padding)
            .attr("cy", function(d, i){ return yScale(i+1)})
            .attr("r", circle_r)
            .attr("fill", function(d, i){
                if(original_data[i].hasOwnProperty("color")){
                    return original_data[i]["color"];
                }
                return COLOR_PALETTE[0];
            });
        
        // テキスト
        svg
            .selectAll("text.comment-text-main")
            .data(original_data)
            .enter()
            .append("text")
            .attr("class", "comment-text comment-text-main")
            .attr("x", padding_left + circle_r*2 + circle_left_padding*2)
            .attr("y", function(d, i){ return yScale(i+1); })
            .text(function(d, i){
                let s = original_data[i]["title"];
                if( s.length>11 ){ s = s.substr(0,11)+"..."; }
                return s;
            })
            .attr("fill", "#000");
        // 詳細
        svg
            .selectAll("text.comment-text-detail")
            .data(original_data)
            .enter()
            .append("text")
            .attr("class", "comment-text comment-text-detail")
            .attr("x", padding_left + circle_r*2 + circle_left_padding*2)
            .attr("y", function(d, i){ return yScale(i+1)+16; })
            .text(function(d, i){
                let s = original_data[i]["detail"];
                if( s.length>19 ){ s = s.substr(0,19)+"..."; }
                return s;
            })
            .attr("font-size", "60%")
            .attr("fill", "#666");

    }
}

