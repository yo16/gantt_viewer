# gantt_viewer
- ガントチャートを表示するだけ。
- オブジェクトを作るのは別で、静的前提。

# Screen Shot
![gantt_viewer](https://user-images.githubusercontent.com/33010998/155871531-afa37b5c-38ef-4f68-ba44-ed0d639566d6.PNG)

# Usage
## Json形式のデータを作って、呼び出す
```HTML:sample.html
<body>
	<div id="gantt1"></div>
</body>
```

```JavaScript:(sample.htmlの中のJavaScript)
document.addEventListener("DOMContentLoaded", function(event){
    // データを作る
    let gantt_datas = [
        {
            "title":"タスク1あいうえおかきくけこ", 
            "detail":"細かいことはいろいろありますがタスク１です。", 
            "start_dt":"2022/2/1", 
            "end_dt":"2022/2/25"
        },
        {
            "title":"task2abcdefg", 
            "detail":"細かいことはいろいろありますがタスク２です。", 
            "start_dt":"2022/2/7", 
            "end_dt":"2022/2/10"
        },
        {
            "title":"タスク3", 
            "detail":"細かいことはいろいろありますがタスク３です。", 
            "start_dt":"2022/2/14", 
            "end_dt":"2022/2/18"
        },
        {
            "title":"タスク4", 
            "detail":"細かいことはいろいろありますがタスク４です。", 
            "start_dt":"2022/2/21", 
            "end_dt":"2022/2/25", 
            "color":"#f00"
        },
        {
            "title":"タスク5", 
            "detail":"細かいことはいろいろありますがタスク５です。", 
            "start_dt":"2022/2/28", 
            "end_dt":"2022/2/28", 
            "color":"#0f0"
        },
    ];

    // 呼び出す
    let gv = new GanttViewer("#gantt1");
    gv.data(gantt_datas, day=new Date(2022,1,16));	// monthは0スタート
});
```
