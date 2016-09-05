/**
 * Created by lihuibing on 16/9/4.
 */
let LabelComponent = React.createClass({
    render:function () {
        return (
            <label htmlFor={this.props.name} className="col-sm-4 control-label">{this.props.children.toString()}</label>
        );
    }
});

let EncodingComponent = React.createClass({
    render: function () {
        return (
            <div className="form-group">
                <LabelComponent name = {this.props.name}>{this.props.children.toString()}</LabelComponent>
                <div className="col-sm-3">
                    <input type="text" name={this.props.name} id={this.props.name} className="form-control" data-bv-notempty="true" data-bv-notempty-message={this.props.checkmessage} />
                </div>
            </div>
        );
    }
});

let ColumnComponent = React.createClass({
    render:function () {
        return(
            <div className="form-group">
                <LabelComponent name = {this.props.name}>{this.props.children.toString()}</LabelComponent>
                <div className="col-sm-3">
                    <input type="number" name={this.props.name} id={this.props.name} className="form-control" data-bv-notempty="true" data-bv-notempty-message={this.props.checkmessage}/>
                </div>
            </div>
        );
    }
});

let FileComponent = React.createClass({
    handleFileSelect:function (e) {
        let encodingTagName = this.props.encodingTagName;
        let file = event.target.files[0];
        let reader = new FileReader();
        reader.onload = function (e) {
            let codes = new Uint8Array(e.target.result);
            let encoding = Encoding.detect(codes);
            $('#' + encodingTagName).val(encoding);
        };
        reader.readAsArrayBuffer(file);
    },
    render:function () {
        return (
            <div className="form-group">
                <LabelComponent name={this.props.filename}>{this.props.children.toString()}</LabelComponent>
                <div className="col-sm-3">
                    <input type="file" name={this.props.filename} id={this.props.filename} multiple=""
                           onChange={this.handleFileSelect}
                           data-bv-notempty="true" data-bv-notempty-message={this.props.checkmessage} />
                </div>
            </div>
        );
    }
});

let ResultListComponent = React.createClass({
    render: function () {
        return (
            <p>{this.props.sourceTd}</p>
        );
    }
});

let FileCompareComponent = React.createClass({
    render:function () {
        return (
            <div className="form-group">
                <div className="col-sm-offset-4 col-lg-12">
                    <button className="btn btn-info btn-lg" type="button" onClick={this.props.onHandlerCompare}>{this.props.children.toString()}</button>
                </div>
            </div>
        );
    }
});

let FormComponent = React.createClass({
    getInitialState:function () {
        return {sourceTd: '', searchTd: ''};
    },
    handlerCompare:function () {
        let formId = this.props.formId;
        $('#'+formId).bootstrapValidator();
        $('#compareForm').data('bootstrapValidator').validate();
        if (!$('#compareForm').data('bootstrapValidator').isValid()) return;
        var sourceTd = $('#sourceTd').val();
        var searchTd = $('#searchTd').val();
        var sourceData;
        var searchData;
        $('#sourceFiles').parse({
            config: {
                encoding: $('#sourceFileEncoding').val(),
                complete: function (results) {
                    sourceData = results.data;
                }
            },
            complete:function () {
                console.log(sourceData);
            }
        });
        $('#searchFiles').parse({
            config: {
                encoding: $('#searchFileEncoding').val(),
                complete: function (results) {
                    searchData = results.data;
                }
            },
            complete:function () {
                this.setState({sourceData:sourceData,searchData:searchData,sourceTd:sourceTd,searchTd:searchTd});
            }.bind(this)
        });

    },
    render:function () {
        return (
            <div role="form" className="form-horizontal">
                <form id={this.props.formId} role="form"
                      data-bv-message="校验不通过"
                      data-bv-feedbackicons-valid="glyphicon glyphicon-ok"
                      data-bv-feedbackicons-invalid="glyphicon glyphicon-remove"
                      data-bv-feedbackicons-validating="glyphicon glyphicon-refresh">
                    <FileComponent filename="sourceFiles" checkmessage = "关键字csv文件不能为空" encodingTagName ="sourceFileEncoding">请选择关键字csv文件：</FileComponent>
                    <EncodingComponent name="sourceFileEncoding" checkmessage="关键字csv文件编码格式不能为空">请输入关键字csv文件编码格式：</EncodingComponent>
                    <ColumnComponent name="sourceTd" checkmessage="关键字所在的列数不能为空">请选择关键字所在的列数：</ColumnComponent>
                    <FileComponent filename="searchFiles" checkmessage = "关键字csv文件不能为空" encodingTagName ="searchFileEncoding">请选择需要查询的csv文件：</FileComponent>
                    <EncodingComponent name="searchFileEncoding" checkmessage="需要查询的csv文件编码格式不能为空">请输入需要查询的csv文件编码格式：</EncodingComponent>
                    <ColumnComponent name="searchTd" checkmessage="搜索关键字所在的列数不能为空">请选择搜索关键字所在的列数：</ColumnComponent>
                    <FileCompareComponent onHandlerCompare = {this.handlerCompare} >处理</FileCompareComponent>
                    <ResultListComponent sourceTd = {this.state.sourceTd} />
                </form>
            </div>
        );
    }
});

ReactDOM.render(
    <FormComponent formId = "compareForm"/>,
    document.getElementById("content")
);