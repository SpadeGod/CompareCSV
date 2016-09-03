/**
 * Created by lihuibing on 2016/9/1.
 */
$(function () {
    /**
     * 解析源关键字配置
     * @returns {{encoding: (*|jQuery), complete: completeSourceFn}}
     */
    function buildSourceConfig() {
      return {
          encoding: $('#sourceFileEncoding').val(),
          complete: completeSourceFn,
        };
    }

    /**
     * 解析搜索文件配置
     * @returns {{encoding: (*|jQuery), complete: completeSearchFn}}
     */
    function buildSearchConfig() {
      return {
          encoding: $('#searchFileEncoding').val(),
          complete: completeSearchFn,
        };
    }

    /**
     * 比较内容实体
     * @param sourceData 源关键字内容数据
     * @param searchData 搜索内容数据
     * @constructor
     */
    var CompareData = function (sourceData, searchData) {
        this.sourceData = sourceData;
        this.searchData = searchData;
      };
    //解析内容实体
    var datas = new CompareData();

    /**
     * 解析源关键字结束时操作
     * @param results 解析结果
     */
    function completeSourceFn(results) {
      // console.log(results.data);
      datas.sourceData = results.data;

    }


    /**
     * 解析搜索结束时操作
     * @param results 解析结果
     */
    function completeSearchFn(results) {
      // console.log(results.data);
      datas.searchData = results.data;
    }

    /**
     * 选择文件时
     * @param event 事件
     */
    function onFileSelect(event) {
      var file = event.target.files[0];
      var tagName = this.name;
      var reader = new FileReader();
      reader.onload = function (e) {
          var codes = new Uint8Array(e.target.result);
          var encoding = Encoding.detect(codes);
          $('#' + tagName).val(encoding);
        };

      reader.readAsArrayBuffer(file);
    }
    //搜索源关键字tag
    var sourceFileTarget =  document.getElementById('sourceFiles');
    var encodingTarget = new Object();
    encodingTarget.name = 'sourceFileEncoding';
    //源字段增加事件
    attachEvent(sourceFileTarget, 'change', onFileSelect, encodingTarget);
    //搜索增加事件
    var searchFileTarget = document.getElementById('searchFiles');
    encodingTarget = new Object();
    encodingTarget.name = 'searchFileEncoding';
    //搜索字段增加字段
    attachEvent(searchFileTarget, 'change', onFileSelect, encodingTarget);

    /**
     * 处理事件传递参数
     * @param target 需要触发事件的目标
     * @param eventName 事件名词
     * @param handler 触发事件方法
     * @param argsObject 参数
     */
    function attachEvent(target, eventName, handler, argsObject) {
      var eventHandler = handler;
      if (argsObject) {
        eventHandler = function (e) {
            handler.call(argsObject, e);
          };
      }

      target.addEventListener(eventName, eventHandler, false);
    }

    //页面校验
    $('#compareForm').bootstrapValidator();

    $('#submit').click(function () {
        $('#compareForm').data('bootstrapValidator').validate();
        if (!$('#compareForm').data('bootstrapValidator').isValid()) return;
        var sourceConfig = buildSourceConfig();
        var searchConfig = buildSearchConfig();
        var sourceTd = $('#sourceTd').val();
        var searchTd = $('#searchTd').val();
        //解析源文件数据
        $('#sourceFiles').parse({
            config: sourceConfig,
            before: function (file, inputElem) {
                console.log('Parsing file...', file);
              },

            error: function (err, file) {
                console.log('ERROR:', err, file);
              },

            complete: function () {
                console.log('Done with all files');
              },
          });

        //解析搜索文件数据
        $('#searchFiles').parse({
            config: searchConfig,
            before: function (file, inputElem) {
                console.log('Parsing file...', file);
              },

            error: function (err, file) {
                console.log('ERROR:', err, file);
              },

            complete: function () {
                dealData(datas, sourceTd, searchTd);
                // console.log(datas);
                console.log('Done with all files');
              },
          });

      });

    /**
     * 查询字符对象
     * @param lineNum 行号
     * @param searchRow
     * @constructor
     */
    var SearchRowObj = function (lineNum, searchRow) {
        this.lineNum = lineNum;
        this.searchRow = searchRow;
      };

    /**
     * 源字符对象
     * @param sourceWord 源字符
     * @param searchRows 查询列
     * @constructor
     */
    var SourceRowObj = function (sourceWord, searchRows) {
        this.sourceWord = sourceWord;
        this.searchRows = searchRows;
      };

    /**
     * 处理数据
     * @param compareDatas 需要比对的数据
     * @param sourceTd 源字符所在的cvs列
     * @param searchTd 查询字符所在的cvs列
     */
    function dealData(compareDatas, sourceTd, searchTd) {
      if (compareDatas instanceof CompareData) {
        var searchData = compareDatas.searchData;
        var sourceData = compareDatas.sourceData;
        var results = [];
        var sourceRowSet = new Set();
        for (var i = 1; i < sourceData.length; i++) {
          var sourceRow = sourceData[i][sourceTd] + '';
          sourceRowSet.add(sourceRow);
        }

        sourceRowSet.forEach(function (sourceRow) {
            if (sourceRow != '') {
              var searchRowObjs = [];
              for (var j = 1; j < searchData.length; j++) {
                var searchRow = searchData[j][searchTd] + '';
                if (isContains(searchRow, sourceRow)) {
                  var searchRowInfo = new SearchRowObj(j, searchRow);
                  searchRowObjs.push(searchRowInfo);
                }
              }

              var sourceRowObj = new SourceRowObj(sourceRow, searchRowObjs);
              results.push(sourceRowObj);
            }
          });

        printToPage(results);
      }else {
        alert('系统异常');
      }
    }


    /**
     * 打印到页面上
     * @param results 结果
     */
    function printToPage(results) {
      var content = '';
      for (var i = 0; i < results.length; i++) {
        var sourceRowObj = results[i];
        if (sourceRowObj instanceof SourceRowObj) {
          var sourceWord = sourceRowObj.sourceWord;
          var searchRows = sourceRowObj.searchRows;
          if (searchRows instanceof Array && searchRows.length > 0) {
            content += "<p class='text-justify'><font color='red'>关键字：''" + sourceWord + "'' 命中 " + searchRows.length + ' 次</font><br/><br/>';
            content += ' 出现在：第 ';
            for (var j = 0; j < searchRows.length; j++) {
              var searchRow = searchRows[j];
              if (searchRow instanceof SearchRowObj) {
                content += searchRow.lineNum + ',';
                if (j != 0 && j % 20 == 0) content += '<br/>';
              }
            }

            content = content.replace(/,$/gi, '');
            content += ' 行<br/><br/>';
            content += "<font color='#008b8b'> = = = = = = = = = = = = = 我是华丽的分割线 0.0 = = = = = = = = = = = = = =</font></p><br/><br/><br/><br/>";
          }
        }
      }

      $('#result').html(content == '' ? results.length + '条关键字都没有命中！' : content);
    }

    /**
     * 是否包含
     * @param str 源字符
     * @param substr 子字符
     * @returns {boolean} 结果
     */
    function isContains(str, substr) {
      return str.indexOf(substr) >= 0;
    }

  });
