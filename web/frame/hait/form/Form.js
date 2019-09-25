/**
 * 表单组件
 *
 * @author pandong
 * @date 2013-03-03 下午21:45:01
 * @Copyright(c) yunlaila.com.cn
 */

hait.namespace("hait.form");

/**
 * 表单对象的构造方法
 */
hait.form.Form = function () {
	
	/**
     * 目标服务器
     */
    this.server = "DEFAULT_SERVER";

    /**
     * 事件
     */
    this.onafterload = null; //load数据完成后执行的方法
    this.onaftersubmit = null;//提交完成后执行的方法


    /**
     * 私有属性
     */
    this._elements = [];//存放全部的表单对象
};

// 继承于hait.base.Component对象
hait.form.Form.inherit(hait.base.Component);

/**
 * 初始化表单
 *
 * @param obj
 */
hait.form.Form.prototype.convert = function (obj) {
    this.father(hait.base.Component, "convert", obj);

    this.server = this.obj.attr("server") ? this.obj.attr("server") : "DEFAULT_SERVER";
    
    // 初始化特殊参数
    this.onafterload = this.obj.attr("onafterload") ? this.obj.attr("onafterload") : null;
    this.onaftersubmit = this.obj.attr("onaftersubmit") ? this.obj.attr("onaftersubmit") : null;

    // 绘制该对象
    this.draw();

    // 先将表单隐藏
    this.obj.hide();

    // 首先将表单元素都先保存出来，因为再初始化之中可能会产生多余的元素
    var elements = [];
    for (var i = 0; i < this.obj[0].elements.length; i++) {
        elements.push(this.obj[0].elements[i]);
    }

    // 将表单对象的所有元素进行初始化
    for (var i = 0; i < elements.length; i++) {
        var element = $(elements[i]);
        if (element.attr("hait-type") == null) {
            // 没有这个属性就不转换
            continue;
        }

        // 根据hait_type将dom对象转换成form需要的对象
        var haitType = element.attr("hait-type");
        hait.register(haitType);
        // 初始化该对象
        var fieldElement = eval("new " + haitType + "();");
        // 转换这个对象
        fieldElement.convert(element);
        // 设置隐含对象
        fieldElement.form = this;
        this._elements.push(fieldElement);
    }

    // 让表单无法提交，因为将使用ajax提交
    this.obj[0].onsubmit = function () {
        return false;
    };

    // 展示该表单
    this.obj.fadeIn("fast");
};

/**
 * 使用draw方式生成表单对象
 *
 * @returns
 */
hait.form.Form.prototype.draw = function () {

    // 调用父级的同名方法
    this.father(hait.base.Component, "draw");

    // 如果obj为空，那么创建基础内容
    if (this.obj == null) {
        this.obj = $("<form action='#' id='form_" + this.id + "'></form>");
        this.obj.append("<table></table>");
    }

    // 开始初始化核心元素的样式和属性
    this.obj.attr("method", "post");
    var table = this.obj.find("table:first");

    // 如果没有找到元素，那么直接返回
    if (table.size() == 0) {
        return this.obj;
    }

    table.attr("border", "0");

    // 返回即可
    return this.obj;
};

/**
 * 根据funcId和参数load表单数据
 */
hait.form.Form.prototype.load = function (funcId, params, method) {

    var _this = this;
    // 首先检测内部form对象是否进行了初始化
    if (this.obj == null) {
        // 如果为空，那么证明还没有对表单进行初始化
        this.log.warn("表单对象还没有进行初始化");
        return;
    }

    // 初始化请求参数
    if (params == null) {
        params = {};
    }

    // 初始化功能号必须存在，否则就什么也不做
    if (funcId == null || funcId.length == 0) {
        return;
    } else {
        params.funcId = funcId;
    }

    // 根据功能号和参数，读取相应信息，并放置对应位置
    request({
    	server : _this.server,
        data: [params],
        func: function (data) {
            var formData = data.responses[0].items[0];
            for (var i = 0; i < _this._elements.length; i++) {
                var inputName = _this._elements[i].name;
                // 读取返回的这个元素的值
                var inputValue = formData[inputName];
                if (inputValue == null) {
                	inputValue = "";
                }
                // 如果找到了，就将这个值放置对表单对象中
                _this._elements[i].setValue(inputValue);
                
                // 针对有显示值字段的组件，进行相关赋值操作
                if(_this._elements[i].displayName) {
                	var displayValue = formData[_this._elements[i].displayName];
                	var isHaveDisplayValueMethon = _this._elements[i].setDisplayValue ? true : false;
                	// 如果有展示值，又存在设置展示值的方法，那么进行展示值设置
                    if(displayValue && isHaveDisplayValueMethon){
                    	_this._elements[i].setDisplayValue(displayValue);
                    };
                }   
            }
            // 如果设置了回调方法，那么进行调用
            if(method){
            	method(formData);
            }
            // 执行完成事件
            if (_this.onafterload) {
                _this.trigger(_this.onafterload, formData);
            }
        }
    });
};

/**
 * 进行表单验证
 *
 * @returns {Boolean}
 */
hait.form.Form.prototype.validate = function () {

    // 首先验证是否可以为空
    for (var i = 0; i < this._elements.length; i++) {
        var element = this._elements[i];
        // 如果没有设置required属性，那么跳过该项
        if (!element.required) {
            continue;
        }
        var elementVal = element.getValue();
        if (elementVal == null || elementVal.length == 0) {
            // 使用公用的信息演出窗口进行提示，暂时使用alert代替
        	var nameText = element.nameText ? element.nameText : element.name;
            alert(nameText + "不能为空！");
            return false;
        }
    }

    // 然后调用各自的方法进行验证
    for (var i = 0; i < this._elements.length; i++) {
        var element = this._elements[i];
        // 如果设置了disabled属性，那么跳过该项
        if (element.disabled) {
            continue;
        }
        if (!element.validate()) {
            // 使用公用的信息演出窗口进行提示，暂时使用alert代替
        	var nameText = element.nameText ? element.nameText : element.name;
            alert(nameText + "验证不通过，" + element.patternMessage);
            return false;
        }
    }
    return true;
};

/**
 * 根据传入的功能号和参数提交到数据层
 *
 * @param funcId
 * @param params
 * @param method
 *            提交完成后执行的方法，如果没有，按默认方式执行
 */
hait.form.Form.prototype.submit = function (funcId, params, method) {
    var _this = this;
    // 首先检测内部form对象是否进行了初始化
    if (this.obj == null) {
        // 如果为空，那么进行初始化
        alert("表单还没有初始化，请核实!");
        return;
    }

    // 首先让表单进行内部验证，确保符合标准
    if (!this.validate()) {
        // 如果自动验证失败，那么就返回，什么也不做
        return;
    }

    // 初始化提交参数对象
    var paramsForm = {};

    if (funcId == null || funcId.length == 0) {
        hait.log.warn("提交功能号不能为空");
        return false;
    } else {
        paramsForm.funcId = funcId;
    }

    // 从表单度读取数据
    for (var i = 0; i < this._elements.length; i++) {
        // 如果该控件设置了禁用，那么不能够参与提交操作
        if (this._elements[i].disabled) {
            continue;
        }
        var fieldValue = this._elements[i].getValue();
        // 如果值为“自动编号”，那么就忽略
        if (fieldValue == "自动编号") {
            continue;
        }
        paramsForm[this._elements[i].name] = fieldValue;
    }
    
    // 如果外部提交的参数不为空，那么就并进来
    if (params != null) {
    	for(var prop in params){
    		paramsForm[prop] = params[prop];
    	}
    }

    // 提交表单
    request({
    	server : _this.server,
        data: [paramsForm],
        func: function (data) {
            var response = data.responses[0];
            if (method) {
                method(response);
            } else {
                // 根据情况进行提示，目前仅仅显示这个结果即可
                alert(response.flag > 0 ? "保存成功" : response.message);
            }
            
            // 执行完成事件
            if (_this.onaftersubmit) {
                _this.trigger(_this.onaftersubmit, response);
            }
        }
    });
};

/**
 * 重置表单数据
 */
hait.form.Form.prototype.reset = function () {
    this.obj[0].reset();
    // 然后再执行各个元素的reset方法
    for (var i = 0; i < this._elements.length; i++) {
        this._elements[i].reset();
    }
};

/**
 * 为表单中的某元素赋值
 *
 * @param fieldName
 * @param fieldValue
 */
hait.form.Form.prototype.setValue = function (fieldName, fieldValue) {
    for (var i = 0; i < this._elements.length; i++) {
        var inputName = this._elements[i].name;
        if (fieldName == inputName) {
            this._elements[i].setValue(fieldValue);
        }
    }
};

/**
 * 从表单中读取某元素的值
 *
 * @param fieldName
 * @returns
 */
hait.form.Form.prototype.getValue = function (fieldName) {
    if (fieldName == null) {
        // 如果fieldName为空，那么表示需要返回的全部的数据
        var resultJson = {};
        for (var i = 0; i < this._elements.length; i++) {
            var name = this._elements[i].name;
            var val = this._elements[i].getValue();
            resultJson[name] = val;
        }
        return resultJson;
    } else {
        // 如果存在，那么返回对应的值
        for (var i = 0; i < this._elements.length; i++) {
            var inputName = this._elements[i].name;
            if (fieldName == inputName) {
                return this._elements[i].getValue();
            }
        }
    }
};

/**
 * 获取某元素对象
 *
 * @param fieldName
 * @returns
 */
hait.form.Form.prototype.getElement = function (fieldName) {
    for (var i = 0; i < this._elements.length; i++) {
        var inputName = this._elements[i].name;
        if (fieldName == inputName) {
            return this._elements[i];
        }
    }
};