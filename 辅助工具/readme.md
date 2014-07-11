#代码压缩使用
把js或css文件拖动到程序图标上即可。在同目录下生成*.min.js 或*.min.css.文件已经存在的，则覆盖掉。

压缩基于Yahoo.Yui.Compressor2.4 for .Net .使用默认压缩条件，主要如下：
> JavaScriptCompressor js = new JavaScriptCompressor(); 
> js.Compress(strContent);
> CssCompressor css = new CssCompressor();
> css.Compress(strContent);

#生成表头工具
打开文件后，按ctrl+k,弹出对话框。先选择表头的单元格，点击按钮生成表头的格式。
这个格式可以用在autoTable中。

 
