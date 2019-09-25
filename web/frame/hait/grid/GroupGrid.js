/**
 * 分组表格组件
 * 
 * @author pandong
 * @date 2016-11-16下午16:04:01
 * @Copyright(c) yunlaila.com.cn
 */

hait.namespace("hait.grid");
hait.register("hait.grid.Grid");

hait.grid.GroupGrid = function() {

	/**
	 * 设置分组字段名称
	 */
	this.groupField = "text";
};

// 继承于hait.base.Component对象
hait.grid.GroupGrid.inherit(hait.grid.Grid);

/**
 * 自动转换的方法
 * 
 * @param obj
 */
hait.grid.GroupGrid.prototype.convert = function(obj) {

	this.groupField = $(obj).attr("group-field") ? $(obj).attr("group-field") : "text";
	
	this.father(hait.grid.Grid, "convert", obj);
};

/**
 * 获取数据
 */
hait.grid.GroupGrid.prototype._getData = function() {
	var _this = this;
	// 目前数据仅支持从func
	if (this.mode == "func") {
		// 如果来源服务器，那么初始化参数，并从服务器获取信息
		this.params = this.params ? this.params : new Object();
		this.params.funcId = this.funcId ? this.funcId : null;
		this._start = (this._curPage - 1) * this.limit;
		this.params.start = this._start;
		this.params.limit = this.limit;

		// 通过远程访问获取数据
		request({
			server : _this.server,
			data : [ _this.params ],
			func : function(data) {
				var resultData = data.responses[0];

				// 如果失败,直接显示错误提示即可
				if (resultData.flag < 0) {
					alert(resultData.message);
					return;
				}

				var items = null;
				if (resultData.items && resultData.items.length > 0) {
					// 解析其中的数据
					_this._total = resultData.total;
					_this._count = resultData.count;
					items = resultData.items;
				} else {
					// 如果没有查到任何数据，就清空数据
					_this._total = 0;
					_this._count = 0;
					items = [];
				}
				
				// 计算总页数
				_this._maxPage = Math.ceil(parseFloat(_this._total) / _this.limit);
				_this.data = items;

				// 显示数据
				_this._fillData();
			}
		});
	} else if (this.mode == "url") {
		// 如果来源服务器，那么初始化参数，并从服务器获取信息
		this.params = this.params ? this.params : new Object();
		this._start = (this._curPage - 1) * this.limit;
		this.params.start = this._start;
		this.params.limit = this.limit;

		// 通过远程访问获取数据
		$.post(_this.url, _this.params, function(data) {
			var resultData = data.responses[0];

			// 如果失败,直接显示错误提示即可
			if (resultData.flag < 0) {
				alert(resultData.message);
				return;
			}

			var items = null;
			if (resultData.items && resultData.items.length > 0) {
				// 解析其中的数据
				_this._total = resultData.total;
				_this._count = resultData.count;
				items = resultData.items;
			} else {
				// 如果没有查到任何数据，就清空数据
				_this._total = 0;
				_this._count = 0;
				items = [];
			}
			
			// 计算总页数
			_this._maxPage = Math.ceil(parseFloat(_this._total) / _this.limit);
			_this.data = items;
			// 显示数据
			_this._fillData();
		});
	}
};

/**
 * 统一的填充数据的方法
 */
hait.grid.GroupGrid.prototype._fillData = function() {
	var _this = this;

	var tableData = this.obj.find(".hait-table-data");

	// 清除里面可能存在的“没有数据”的显示
	var tableEmpty = this.obj.find(".hait-table-empty");
	if (tableEmpty.size() > 0) {
		tableEmpty.remove();
	}

	// 如果没有，则新创建
	if (tableData.size() == 0) {
		// 添加表格数据
		tableData = $('<div class="hait-table-data"><table cellspacing="0" cellpadding="0" border="0" class="hait-table">'
				+ '<tbody></tbody></table></div>');

		// 将表格数据添加到主对象中
		this.obj.append(tableData);
		this.obj.append('<div class="cls"></div>');
	}

	// 获取高度设置
	var styleHeight = null;

	if (_this.style) {
		var styleParams = _this.style.split(";");
		for (var i = 0; i < styleParams.length; i++) {
			var styleParam = styleParams[i];
			if (styleParam.indexOf("height") >= 0) {
				styleHeight = styleParam.split(":")[1];
			}
		}
	}

	if (styleHeight != null && styleHeight.length > 0) {
		if (styleHeight.indexOf("%") >= 0) {
			// 如果是百分比，那么清除外围的宽度，直接将百分比设置在这里
			this.obj.css("height", "auto");
			tableData.css("height", styleHeight);
		} else if (styleHeight.indexOf("px") >= 0) {
			// 如果是像素，那么这里比外围少60像素（底部）+ 34（每一行头）
			var differHeight = 60;
			var headTrCount = this.obj.find(".hait-table-title").find("tr").size();
			differHeight += headTrCount * 34;

			// 如果没有数据，那么多减33
			if (this.data == null || this.data.length == 0) {
				differHeight += 33;
			}

			var tableDataHeight = parseInt(styleHeight) - differHeight;
			tableData.css("height", tableDataHeight + "px");
			// 计算标题是否向左缩进
			if (this.data.length * 41 > tableDataHeight) {
				this._isScroll = true;
			}

			if (this.data.length * 41 < tableDataHeight) {
				this._isLargeDataArea = true;
			}
		} else {
			// 如果是这种情况，那么直接清除高度
			this.obj.css("height", "auto");
		}
	}

	// 准备写到页面，首先清空当前表格
	var tableBody = tableData.find("tbody");
	tableBody.empty();

	// 该方法被调用时，数据肯定已经获取，并且需要显示的数据也已经放置在data中
	for (var i = 0; i < this.data.length; i++) {
		var item = this.data[i];

		// 获取分组名称
		var groupFieldText = item[this.groupField];
		var groupTableBodyTr = $("<tr></tr>");
		groupTableBodyTr.data("group", "group" + i);
		groupTableBodyTr.click(function(){
			var groupItem = $(this).data("group");
			$("tr[group=" + groupItem + "]").toggle();
		});
		
		// 如果设置了，复选，那么增加一个占位符，否则宽度会计算错误
		if (this.multiple) {
			var tableBodyTrTd = $("<td class='group'>&nbsp;</td>");
			tableBodyTrTd.attr("width", this._checkboxWidth + "%");
			groupTableBodyTr.append(tableBodyTrTd);
		}
		

		for (var j = 0; j < this.columns.length; j++) {
			var groupTableBodyTd = $("<td class='group'></td>");
			groupTableBodyTd.attr("width", this.columns[j].width + "%");
			groupTableBodyTd.html(j == 0 ? groupFieldText : "&nbsp;");
			groupTableBodyTr.append(groupTableBodyTd);
		}

		tableBody.append(groupTableBodyTr);
		
		// 获取实际的数据
		var childrens = item.items;
		for (var j = 0; j < childrens.length; j++) {
			var children = childrens[j];
			var tableBodyTr = $("<tr></tr>");
			tableBodyTr.attr("group", "group" + i);

			// 如果设置了，复选，那么增加复选按钮
			if (this.multiple) {
				var tableBodyTrTd = $("<td class='checkbox'></td>");
				tableBodyTrTd.attr("width", this._checkboxWidth + "%");
				var rowCheckBox = $('<input type="checkbox" name="' + this.id + '_checkbox"/>');
				// 如果返回数据中，存在参数checked且值不为空或者false，那么进行默认设置
				if(children.checked != null && children.checked.length > 0 && children.checked != "false"){
					rowCheckBox[0].checked = true;
				}
				tableBodyTrTd.append(rowCheckBox);
				tableBodyTr.append(tableBodyTrTd);
			}

			// 配置行点击事件
			tableBodyTr.click(function(event) {

				tableBody.find(".selected").removeClass("selected");
				$(this).addClass("selected");

				// 如果配置了点击回调事件，那么调用
				if (_this.onrowclick) {
					_this.trigger(_this.onrowclick, _this.data[$(this).index()]);
				}
				// 执行完毕后，立即停止事件运行，以免冒泡执行
				event.stopPropagation();
			});

			tableBodyTr.dblclick(function() {
				// 如果配置了点击回调事件，那么调用
				if (_this.onrowdblclick) {
					_this.trigger(_this.onrowdblclick, _this.data[$(this).index()]);
				}
				// 执行完毕后，立即停止事件运行，以免冒泡执行
				event.stopPropagation();
			});

			// 根据配置的列信息进行读取
			for (var k = 0; k < this.columns.length; k++) {
				var fieldName = this.columns[k].field;
				var fieldValue = children[fieldName] ? children[fieldName] : null;
				// 如果存在回调函数，那么执行回调函数
				if (this.columns[k].onwrite) {
					fieldValue = this.trigger(this.columns[k].onwrite, fieldValue, children);
				}
				// 确保值不是null
				fieldValue = fieldValue ? fieldValue : "";

				// 如果配置了format,那么对目标数据进行格式化
				if (this.columns[k].format) {
					var format = this.columns[k].format;
					if (format == "seq") {
						// 如果是序列，那么直接输出当前序号
						fieldValue = j + 1;
					} else if (format.indexOf("s") == 0) {
						// 首字母为S开头，那么表示对字符串进行截取
						var stringLength = parseInt(format.substring(1));
						if (fieldValue.length > stringLength) {
							fieldValue = fieldValue.substring(0, stringLength) + "...";
						}
					} else if (format == "date") {
						fieldValue = fieldValue.substring(0, 10);
					} else if (format == "datetime") {
						fieldValue = fieldValue.substring(0, 19);
					}
				}

				var options = null;

				// 如果是数据字典就直接从缓存中获取即可
				if (this.columns[k].dict != null) {
					// 从缓存中获取对应数据
					if (!window.dict) {
						hait.initDict();
					}
					options = window.dict.get(this.columns[k].dict);
				}
				// 如果配置了本地值，那么直接使用本地值，类似test1=1,test2=2,test3=3
				if (this.columns[k].options) {
					var datas = this.columns[k].options.split(",");
					options = [];
					for (var l = 0; l < datas.length; l++) {
						var data = datas[l].split("=");
						options.push({
							text : data[0],
							val : data[1]
						});
					}
				}

				// 如果存在options的值,那么获取其中的值
				if (options) {
					for (var l = 0; l < options.length; l++) {
						if (options[l].val == fieldValue) {
							fieldValue = options[l].text;
						}
					}
				}

				// 最后将结果值写入
				var tableBodyTrTd = $("<td>" + fieldValue + "</td>");

				// 如果内容中没有标签，那么则需要进行鼠标悬停显示
				if (typeof fieldValue == "number") {
					tableBodyTrTd.attr("title", fieldValue);
				}
				if (typeof fieldValue == "string" && fieldValue.indexOf("<") == -1) {
					tableBodyTrTd.attr("title", fieldValue);
				}

				tableBodyTr.append(tableBodyTrTd);
			}

			// 将当前json信息，保存在该行tr对象中，便于操作
			if (this.multiple) {
				tableBodyTr.find("input[type=checkbox]").data("item", children);
			}
			tableBodyTr.data("item", children);

			// 将这行添加进入
			tableBody.append(tableBodyTr);

		}

	}

	// 如果没有数据，则显示没有数据
	if (this.data == null || this.data.length == 0) {
		// 将没有数据的显示添加到主对象中
		tableData.before('<div class="hait-table-empty">没有任何数据</div>');
		tableData.before('<div class="cls"></div>');
	}
	
	// 如果需要显示分页条，那么就进行填充分页条
	if (this.pagination) {
		this._fillPagination();
	}

	// 调用刷新完成事件
	if (this.onrefresh) {
		this.onrefresh();
	}
};