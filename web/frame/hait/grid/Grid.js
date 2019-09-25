/**
 * 表格组件
 *
 * @author pandong
 * @date 2013-03-16下午16:04:01
 * @Copyright(c) yunlaila.com.cn
 */

hait.namespace("hait.grid");

hait.grid.Grid = function () {

    /**
     * 所有列信息，此项必须在初始化时配置 自动转换时，如果没有配置，那么将按照顺序自动编号，例如field0,field1...
     */
    this.columns = null;

    /**
     * 表头，如果为空，那么自动生成
     */
    this.header = null;

    /**
     * 是否复选
     */
    this.multiple = true;

    /**
     * 样式设置
     */
    this.style = null;

    /**
     * 每页数据最大限制
     */
    this.limit = 10;

    /**
     * 数据来源方式local,func
     */
    this.mode = "local";

    /**
     * 当前所有数据
     */
    this.data = [];

    /**
     * 目标服务器
     */
    this.server = "DEFAULT_SERVER";

    /**
     * 当mode为func时需要的参数
     */
    this.funcId = null; // 请求功能号
    this.params = new Object(); // 保存请求参数，因为在翻页时，这些信息必须存在
    this.auto = true; // 初始化后自动获取数据
    this.statFuncId = null; // 统计功能号

    /**
     * 当mode为url时需要的参数
     */
    this.url = null;

    /**
     * 表格底部的按钮组
     */
    this.buttons = [];

    /**
     * 是否显示分页条
     */
    this.pagination = true;

    /**
     * 分页条的位置
     */
    this.paginationPlace = "center";

    /**
     * 是否支持点击表头排序
     */
    this.titleSort = false;

    /**
     * 排序参数名称
     */
    this.sortParamName = "table_order_by";

    /**
     * 锁定行数
     */
    this.lockCount = 0;
    this.lockLeftWidth = null;
    this.lockRightWidth = null;

    /**
     * 事件
     */
    this.onrowclick = null;// 当行被点击的时候执行的事件
    this.onrowdblclick = null; // 当行被双击的时候执行的事件
    this.onrefresh = null;// 完成刷新后执行的事件
    this.onload = null;// 完成本身的创建后的调用的方法

    /**
     * 私有属性
     */
    this._curPage = 1; // 当前页数
    this._maxPage = 0; // 最大页数
    this._start = 0; // 其实行
    this._count = 0; // 当前数据行数
    this._total = 0; // 总数据量
    this._localData = []; // 全部原始数据
    this._isStatistics = false; // 是否存在统计列
    this._dateStatistics = null; // 统计行数据
    this._isScroll = false; // 数据区是否存在滚动
    this._isLargeDataArea = false; // 数据区是否过大
    this._checkboxWidth = 6; // 复选框的宽度，默认为6%
    this._sortField = null; // 排序列，默认为空
    this._sortType = "desc"; // 排序方式，默认为倒序
    this._leftContainer = null; // 左边容器
    this._rightContainer = null; // 右边容器
};

// 继承于hait.base.Component对象
hait.grid.Grid.inherit(hait.base.Component);

/**
 * 自动转换的方法
 *
 * @param obj
 */
hait.grid.Grid.prototype.convert = function (obj) {
    this.father(hait.base.Component, "convert", obj);
    var _this = this;
    this.mode = this.obj.attr("mode") ? this.obj.attr("mode") : "local";
    this.server = this.obj.attr("server") ? this.obj.attr("server") : "DEFAULT_SERVER";
    this.multiple = this.obj.attr("multiple") ? true : false;
    this.limit = this.obj.attr("limit") ? parseInt(this.obj.attr("limit")) : 12;
    this.style = this.obj.attr("style") ? this.obj.attr("style") : null;
    this.pagination = this.obj.attr("pagination") && this.obj.attr("pagination") == "false" ? false : true;
    this.paginationPlace = this.obj.attr("pagination-place") && this.obj.attr("pagination-place").length > 0 ? this.obj.attr("pagination-place") : center;
    this.titleSort = this.obj.attr("title-sort") ? true : false;
    this.sortParamName = this.obj.attr("sort-param-name") ? this.obj.attr("sort-param-name") : "table_order_by";
    this.lockCount = this.obj.attr("lock-count") ? parseInt(this.obj.attr("lock-count")) : 0;
    this.lockLeftWidth = this.obj.attr("lock-left-width") ? this.obj.attr("lock-left-width") : null;
    this.lockRightWidth = this.obj.attr("lock-right-width") ? this.obj.attr("lock-right-width") : null;

    // 获取事件
    this.onrowclick = this.obj.attr("onrowclick") ? this.obj.attr("onrowclick") : null;
    this.onrowdblclick = this.obj.attr("onrowdblclick") ? this.obj.attr("onrowdblclick") : null;
    this.onrefresh = this.obj.attr("onrefresh") ? this.obj.attr("onrefresh") : null;
    this.onload = this.obj.attr("onload") ? this.obj.attr("onload") : null;

    // 初始化远程获取数据的必要参数
    if (this.mode == "func") {
        this.funcId = this.obj.attr("func-id") ? this.obj.attr("func-id") : null; // 功能号
        this.params = this.obj.attr("params") ? hait.parseParam(this.obj.attr("params")) : new Object(); // 请求参数
        this.auto = this.obj.attr("auto") && this.obj.attr("auto") == "false" ? false : true; // 初始化后自动获取数据
        this.statFuncId = this.obj.attr("stat-func-id") ? this.obj.attr("stat-func-id") : null; // 统计功能号
    } else if (this.mode == "url") {
        this.url = this.obj.attr("url") ? this.obj.attr("url") : null; // 功能号
        this.params = this.obj.attr("params") ? hait.parseParam(this.obj.attr("params")) : new Object(); // 请求参数
        this.auto = this.obj.attr("auto") && this.obj.attr("auto") == "false" ? false : true; // 初始化后自动获取数据
    }

    // 开始解析其中的columns
    this.columns = [];
    this.header = "";

    this.obj.find("tr").each(function () {
        // 获取th项目，这些都可能是标题
        var titleHeads = $(this).find("th");
        // 如果不是标题行，那么不进行任何处理
        if (titleHeads.size() <= 0) {
            return;
        }
        // 解析列元素
        titleHeads.each(function (i) {
            // 如果没有设置field，那么不处理
            if ($(this).attr("field") == null) {
                return;
            }
            var column = new Object();
            // 初始化基本属性
            column.text = $(this).html();
            column.field = $(this).attr("field") ? $(this).attr("field") : "field" + i;
            // 计算宽度,仅支持百分比和像素
            column.width = $(this).attr("width") ? $(this).attr("width") : null;

            // 查询一下现有的字段列表中，如果有重复字段且存在宽度，那么宽度自动设置为一样
            for (var i = 0; i < _this.columns.length; i++) {
                var curColumn = _this.columns[i];
                if (curColumn.field == column.field && curColumn.width) {
                    column.width = curColumn.width;
                }
            }

            column.statistics = $(this).attr("statistics") ? $(this).attr("statistics") : null; // 统计方式：sum,avg
            column.format = $(this).attr("format") ? $(this).attr("format") : null; // 格式化方式:字典,字符串,时间
            column.dict = $(this).attr("dict") ? $(this).attr("dict") : null; // 字典代码
            column.search = $(this).attr("search") ? $(this).attr("search") : null; // 点击查询列,format为dict时有效
            column.options = $(this).attr("options") ? $(this).attr("options") : null; // 自定义选项内容
            column.onwrite = $(this).attr("onwrite") ? $(this).attr("onwrite") : null; // 字段渲染事件
            _this.columns.push(column);
        });
    });

    // 如果类型为local，那么里面的tr作为内容存在，需要转换成data
    if (this.mode == "local") {
        this._localData = new Array();
        this.obj.find("tr").each(function () {
            // 获取th项目，这些都可能是标题
            var titleHeads = $(this).find("th");
            // 如果是标题行，那么不进行任何处理
            if (titleHeads.size() > 0) {
                return;
            }
            var row = {};
            $(this).find("td").each(function (i) {
                // 获取列描述信息
                var column = _this.columns[i];
                row[column.field] = $(this).html();
            });
            // 将所有数据保存在原始数据中
            _this._localData.push(row);
        });
    }

    // 如果存在按钮组,就解析出来
    if (this.obj.attr("buttons")) {
        var buttons = $("#" + this.obj.attr("buttons"));
        buttons.children().each(function () {
            // 获得名称
            var buttonName = $(this).text();
            // 获得事件
            var buttonEvent = this.onclick;

            _this.buttons.push({
                name: buttonName,
                onclick: buttonEvent
            });
        });
        // 数据获取完之后,删除
        buttons.remove();
    }

    // 绘制表格
    this.draw();
};

/**
 * 绘制该表格对象
 */
hait.grid.Grid.prototype.draw = function () {

    // 调用父级的同名方法
    this.father(hait.base.Component, "draw");

    var _this = this;

    var container = $('<div class="hait-table-border"></div>');

    // 如果不存在obj对象，那么进行初始化
    if (this.obj != null) {
        this.obj.before(container);
        this.obj.remove();
    }

    this.obj = container;
    this.obj.attr("id", this.id);

    // 如果存在样式设置，那么加入该样式
    if (this.style) {
        this.obj.attr("style", this.style);
    }

    this.obj.append('<div class="lock-left"></div>');
    this.obj.append('<div class="lock-right"><div></div></div>');

    this._leftContainer = this.obj.find(".lock-left");
    this._rightContainer = this.obj.find(".lock-right > div:first");

    // 计算左右宽度，如果没有锁定列，左边宽度为0
    var lockLeftWidth = 0;
    var lockRightWidth = 100;

    if (this.lockCount > 0) {
        lockLeftWidth = 20;
        lockRightWidth = 80;
        var tableCssWidth = "100%";
        var styles = this.style.split(";");
        for (var i = 0; i < styles.length; i++) {
            var curStyle = styles[i];
            var curStyles = curStyle.split(":");
            if (curStyles[0] == "width") {
                tableCssWidth = curStyles[1];
                break;
            }
        }
        if (this.lockLeftWidth != null) {
            if (this.lockLeftWidth.indexOf("px") >= 0 && tableCssWidth.indexOf("px") >= 0) {
                var curLockLeftWidth = parseInt(this.lockLeftWidth.replace("px", ""));
                var curTableCssWidth = parseInt(tableCssWidth.replace("px", ""));
                if (curLockLeftWidth < curTableCssWidth) {
                    lockLeftWidth = Math.ceil(curLockLeftWidth / curTableCssWidth * 100);
                    lockRightWidth = 100 - lockLeftWidth;
                }
            }
            if (this.lockLeftWidth.indexOf("%") >= 0 && tableCssWidth.indexOf("%") >= 0) {
                var curLockLeftWidth = parseInt(this.lockLeftWidth.replace("%", ""));
                var curTableCssWidth = parseInt(tableCssWidth.replace("%", ""));
                if (curLockLeftWidth < curTableCssWidth) {
                    lockLeftWidth = curLockLeftWidth;
                    lockRightWidth = 100 - lockLeftWidth;
                }
            }
            if (this.lockLeftWidth.indexOf("px") >= 0 && tableCssWidth.indexOf("%") >= 0) {
                var curLockLeftWidth = parseInt(this.lockLeftWidth.replace("px", ""));
                var curTableCssWidth = this.obj.width();
                if (curLockLeftWidth < curTableCssWidth) {
                    lockLeftWidth = Math.ceil(curLockLeftWidth / curTableCssWidth * 100);
                    lockRightWidth = 100 - lockLeftWidth;
                }
            }
        }
        lockRightWidth -= 0.1;
        this._rightContainer.css("width", this.lockRightWidth);
        this.obj.css("min-width", "1000px");
    }
    this._leftContainer.css("width", lockLeftWidth + "%");
    this.obj.find(".lock-right").css("width", lockRightWidth + "%");
    if (lockLeftWidth == 0) {
        this._leftContainer.hide();
        this._rightContainer.parent().css("border-left", "0px");
    }

    // 如果this.data存在数据，那么直接设置给_localData
    if (this.data.length > 0) {
        this._localData = this.data;
    }

    // 初始化列宽度
    this._initColumnWidth();

    // 判断是否存在统计行
    for (var i = 0; i < this.columns.length; i++) {
        // 只要有一列需要统计，那么统计标志就是true
        if (this.columns[i].statistics) {
            this._isStatistics = true;
            break;
        }
    }

    // 首先清空现在对象中的所有东西
    this._leftContainer.empty();
    this._rightContainer.empty();

    // 初始化表头
    var tableLeftHead = $('<div class="hait-table-title"></div>');
    tableLeftHead.append('<table cellspacing="0" cellpadding="0" border="0" class="hait-table"><thead></thead></table>');

    var tableRightHead = tableLeftHead.clone();

    // 开始生成表头
    if (this.header == null || this.header.length == 0) {
        var tableHeadTr = $("<tr></tr>");

        if (this.multiple) {
            var tableHeadTrTh = $("<th class='checkbox'></th>");
            tableHeadTrTh.attr("width", this._checkboxWidth + "%");
            tableHeadTr.append(tableHeadTrTh);
        }

        // 初始化表头具体项目
        for (var i = 0; i < this.lockCount; i++) {
            var column = this.columns[i];
            var tableHeadTrTh = $("<th field=\"" + column.field + "\">" + column.text + "</th>");
            if (column.width) {
                tableHeadTrTh.attr("width", column.width + "%");
            }
            tableHeadTr.append(tableHeadTrTh);
        }

        if (this.lockCount > 0) {
            tableLeftHead.find("thead").append(tableHeadTr);
            tableHeadTr = $("<tr></tr>");
        }

        // 初始化表头具体项目
        for (var i = this.lockCount; i < this.columns.length; i++) {
            var column = this.columns[i];
            var tableHeadTrTh = $("<th field=\"" + column.field + "\">" + column.text + "</th>");
            if (column.width) {
                tableHeadTrTh.attr("width", column.width + "%");
            }
            tableHeadTr.append(tableHeadTrTh);
        }
        tableRightHead.find("thead").append(tableHeadTr);
    } else {
        var curHeader = $(this.header);

        // 初始化预设的表头内部每列的宽度
        curHeader.each(function () {
            var index = 0;
            $(this).find("th").each(function () {
                var colspan = $(this).attr("colspan") ? parseInt($(this).attr("colspan")) : 1;
                var curWidth = 0;
                for (var i = 0; i < colspan; i++) {
                    curWidth += _this.columns[index].width;
                    index++;
                }
                $(this).attr("width", curWidth + "%");
            });
        });

        if (this.lockCount > 0) {
            curHeader.each(function () {
                var curTr = $("<tr></tr>");
                $(this).find("th").each(function (index) {
                    if (index >= _this.lockCount) {
                        return;
                    }
                    curTr.append($(this));
                });
                tableLeftHead.find("thead").append(curTr);
            });
        }

        // 将预设的表头设置进去
        tableRightHead.find("thead").append(curHeader);

        if (this.multiple) {
            var tableHeadTrTh = $("<th class='checkbox'></th>");
            tableHeadTrTh.attr("width", this._checkboxWidth + "%");
            var checkboxHead = this.lockCount > 0 ? tableLeftHead : tableRightHead;
            if (checkboxHead.find("tr").size() > 1) {
                tableHeadTrTh.attr("rowspan", tableRightHead.find("tr").size());
            }
            checkboxHead.find("tr:first").prepend(tableHeadTrTh);
        }
    }

    // 如果需要表头点击排序，那么对表头增加事件
    if (this.titleSort) {
        var titleSortClick = function () {
            var fieldName = $(this).attr("field");
            // 如果字段名称为空，那么不处理
            if (fieldName == null || fieldName.length == 0) {
                return;
            }
            // 获得当前的排序方式
            var curClass = $(this).attr("class");
            _this._sortField = fieldName;
            _this._sortType = curClass != null && curClass.indexOf("sort-desc") >= 0 ? "asc" : "desc";
            // 清除当前所有排序样式
            _this.obj.find(".sort-asc").removeClass("sort-asc");
            _this.obj.find(".sort-desc").removeClass("sort-desc");
            // 设置当前样式
            $(this).addClass("sort-" + _this._sortType);
            // 刷新表格数据
            _this.refresh(false);
        };
        tableLeftHead.find("th").click(titleSortClick);
        tableRightHead.find("th").click(titleSortClick);
    }

    // 根据情况添加复选框
    if (this.multiple) {
        var tableHead = this.lockCount > 0 ? tableLeftHead : tableRightHead;
        var tableHeadTrTh = tableHead.find("th.checkbox");
        var mainCheckBox = $('<input type="checkbox"/>');
        mainCheckBox.click(function () {
            // 让下面的所有复选框设置为选择或者不选
            var curChecked = this.checked;
            _this.obj.find("input[type=checkbox]").each(function () {
                this.checked = curChecked;
            });
        });
        tableHeadTrTh.append(mainCheckBox);
    }

    // 将表头放置到顶部
    this._leftContainer.append(tableLeftHead);
    this._rightContainer.append(tableRightHead);
    this.obj.append('<div class="cls"></div>');

    // 初始化获取数据所需要的一些必要参数
    this._curPage = 1;
    this._maxPage = 0;

    // 执行获取数据操作
    if (this.auto) {
        this._getData();
    }

    // draw方法执行完毕，则表示该对象已经load完毕
    if (this.onload) {
        this.trigger(this.onload, this);
    }
};

/**
 * 刷新表格
 *
 * @param isReset
 *            是否重置，默认true
 */
hait.grid.Grid.prototype.refresh = function (isReset) {
    // 如果没有传递这个参数，那么默认为true
    isReset = isReset == null ? true : isReset;
    if (isReset) {
        this._curPage = 1;
    }

    // 初始化一些必要数据
    this.params.start = (this._curPage - 1) * this.limit;
    this.params.limit = this.limit;

    // 如果设置了排序，那么根据排序方式进行排序处理
    if (this.titleSort && this._sortField != null && this._sortField.length > 0) {
        this.params[this.sortParamName] = this._sortField + " " + this._sortType;
    }

    // 调用方法获取数据
    this._getData();
};

/**
 * 读取当前选中行的值
 */
hait.grid.Grid.prototype.getSelected = function () {
    if (this.multiple) {
        var selected = new Array();
        this.obj.find("input[type=checkbox][name=" + this.id + "_checkbox]").each(function () {
            if (this.checked) {
                selected.push($(this).data("item"));
            }
        });
        return selected;
    } else {
        return this.obj.find("tr.selected").data("item");
    }
};

/**
 * 设置选中行
 *
 * @param condition
 *            条件，可以是id=1，也可以是行数
 */
hait.grid.Grid.prototype.setSelected = function (condition) {
    // 如果传入数据为空，那么就不做任何处理
    if (condition == null || condition.length == 0) {
        return;
    }

    var tableBody = this.obj.find(".hait-table-data");
    var selectedIndex = -1;

    // 判断是否为数字，如果是，那么传入的行数行数
    var isIndex = !isNaN(condition);
    if (isIndex) {
        selectedIndex = parseInt(condition);
    } else {
        // 暂时仅仅支持一个参数
        var conditions = condition.split("=");
        if (condition == null || condition.length == 0 || conditions.length != 2) {
            alert("暂时不支持多个参数");
            return;
        }
        var key = conditions[0];
        var val = conditions[1];

        // 循环判断当前值是否为匹配的值
        for (var i = 0; i < this.data.length; i++) {
            // 判断哪些内容是需要保留下来的
            if (this.data[i][key] == val) {
                selectedIndex = i;
                break;
            }
        }
    }

    // 如果选中行数为-1，那么就不做任何处理
    if (selectedIndex == -1) {
        return;
    }

    // 设置选中行
    var tableBodyTr = tableBody.find("tr:eq(" + selectedIndex + ")");
    tableBody.find(".selected").removeClass("selected");
    tableBodyTr.addClass("selected");

    // 如果是复选框，那么设置复选框按钮为选中
    if (this.multiple) {
        tableBodyTr.find("input[type=checkbox]")[0].checked = true;
    }
};

/**
 * 设置全选
 *
 * @param checked
 */
hait.grid.Grid.prototype.setAllChecked = function (checked) {
    this.obj.find("input[type=checkbox]").each(function () {
        this.checked = checked;
    });
};

/**
 * 向后翻
 */
hait.grid.Grid.prototype.pageNext = function () {
    if (this._curPage >= this._maxPage || this._maxPage == 0) {
        this.log.warn("已经是最后一页了!");
        return;
    }
    this._curPage++;
    this.refresh(false);
};
/**
 * 向前翻
 */
hait.grid.Grid.prototype.pagePrev = function () {
    if (this._curPage == 1) {
        this.log.warn("已经是第一页了!");
        return;
    }
    this._curPage--;
    this.refresh(false);
};
hait.grid.Grid.prototype.pageJump = function (page) {
    if (page < 1 || page > this._maxPage || isNaN(page)) {
        this.log.warn("跳转页数不正确,请检查!");
        return;
    }
    this._curPage = parseInt(page);
    this.refresh(false);
};

/**
 * 设置本地数据，仅针对mode=local时有效
 */
hait.grid.Grid.prototype.setLocalData = function (localData) {
    if (this.mode != "local") {
        alert("表格数据模式不是local，不允许直接设置数据");
        return;
    }
    // 重置本地数据
    this._localData = localData;
    // 刷新
    this.refresh();
};

/**
 * 获取本地数据
 */
hait.grid.Grid.prototype.getLocalData = function (condition) {
    // 如果没有条件，那么直接返回所有的本地数据
    if (condition == null || condition.length == 0) {
        return this._localData;
    }

    // 暂时仅仅支持一个参数
    var conditions = condition.split("=");
    if (condition == null || condition.length == 0 || conditions.length != 2) {
        alert("暂时不支持多个参数");
        return;
    }
    var key = conditions[0];
    var val = conditions[1];

    var selectedLocalData = [];
    // 循环判断当前值是否为输入的值
    for (var i = 0; i < this._localData.length; i++) {
        // 判断哪些内容是需要返回的
        if (this._localData[i][key].indexOf(val) >= 0) {
            selectedLocalData.push(this._localData[i]);
        }
    }

    // 返回这些数据
    return selectedLocalData;
};

/**
 * 清除本地数据
 */
hait.grid.Grid.prototype.clearLocalData = function () {
    this._localData = [];
    // 刷新
    this.refresh();
};

/**
 * 添加一条数据到表格中，仅针对mode=local时有效
 *
 * @param item
 */
hait.grid.Grid.prototype.insertItem = function (item) {
    if (this.mode != "local") {
        alert("表格数据模式不是local，不允许直接设置数据");
        return;
    }

    // 如果传入数据为空，那么不进行任何操作
    if (item == null) {
        return;
    }

    // 如果本地数据存储器内容为空，那么初始化
    if (this._localData == null) {
        this._localData = [];
    }

    // 为data增加数据
    this._localData.push(item);

    // 刷新表格，不重置
    this.refresh(true);
};

/**
 * 根据键和值更新对应数据，仅针对mode=local时有效
 *
 * @param condition
 *            条件
 * @param item
 *            修改的对象
 */
hait.grid.Grid.prototype.updateItem = function (condition, item) {
    // 暂时仅仅支持一个参数
    var conditions = condition.split("=");
    if (condition == null || condition.length == 0 || conditions.length != 2) {
        alert("暂时不支持多个参数");
        return;
    }
    var key = conditions[0];
    var val = conditions[1];

    // 循环判断当前值是否为输入的值
    for (var i = 0; i < this._localData.length; i++) {
        // 判断哪些内容是需要保留下来的
        if (this._localData[i][key] == val) {
            // 将需要修改的内容进行回写
            for (var itemKey in item) {
                this._localData[i][itemKey] = item[itemKey];
            }
            break;
        }
    }
    // 刷新表格，不重置
    this.refresh(true);
};

/**
 * 根据键和值删除里面符合条件的内容，仅针对mode=local时有效
 *
 * @param condition
 *            条件
 */
hait.grid.Grid.prototype.deleteItem = function (condition) {
    // 暂时仅仅支持一个参数
    var conditions = condition.split("=");
    if (condition == null || condition.length == 0 || conditions.length != 2) {
        alert("暂时不支持多个参数");
        return;
    }
    var key = conditions[0];
    var val = conditions[1];

    var newLocalData = [];
    // 循环判断当前值是否为输入的值
    for (var i = 0; i < this._localData.length; i++) {
        // 判断哪些内容是需要保留下来的
        if (this._localData[i][key].indexOf(val) == -1) {
            newLocalData.push(this._localData[i]);
        }
    }

    // 更新本地数据
    this._localData = newLocalData;
    // 刷新表格，不重置
    this.refresh(true);
};

/**
 * 将当前数据导出为excel
 */
hait.grid.Grid.prototype.toExcel = function (title) {
    var _this = this;
    // 开始本地整合数据
    var excelTable = $("<table></table>");
    // 获取头部
    var excelTableHead = this.obj.find(".hait-table-title > table");
    // 获得内容
    var excelTableBody = this.obj.find(".hait-table-data > table");
    // 组装新的表格
    excelTable.append(excelTableHead.html());
    excelTable.append(excelTableBody.html());

    // 如果存在复选，那么删除所有复选框
    if (this.multiple) {
        excelTable.find(".checkbox").remove();
    }

    // 解析新的表格，去掉无用属性
    excelTable.find("th,td").each(function () {
        // 如果存在title，直接去掉
        if ($(this).attr("title")) {
            $(this).removeAttr("title");
        }

        // 如果存在field，直接去掉
        if ($(this).attr("field")) {
            $(this).removeAttr("field");
        }

        // 如果存在statistics，直接去掉
        if ($(this).attr("statistics")) {
            $(this).removeAttr("statistics");
        }

        // 如果存在style，直接去掉
        if ($(this).attr("style")) {
            $(this).removeAttr("style");
        }

        // 如果存在百分比，那么计算成像素，便于后台计算
        if ($(this).attr("width")) {
            var tableWidth = _this.obj.width();
            var curWidth = $(this).attr("width");
            curWidth = parseInt(curWidth.substring(0, curWidth.indexOf("%")));
            curWidth = Math.ceil(curWidth * tableWidth / 100.00);
            $(this).attr("width", curWidth + "px");
        }

        // 将内部值转换为text属性，便于后台接受
        var text = $(this).text();
        // 清除前后空格
        text = $.trim(text);
        $(this).attr("text", text);
    });

    // 拼装请求参数，后台接收xml，所以这里进行xml拼装
    var requestXml = '<?xml version="1.0" encoding="UTF-8"?>';
    requestXml += excelTable[0].outerHTML;

    // 去除其中所有的空格，因为这个会导致xml解析错误
    requestXml = requestXml.replace(/&nbsp;/gi, "");

    // 跳转到远程数据
    var form = $("<form ></form>");
    $(document.body).append(form);
    // 设置form元素一些常用的属性
    form.attr("style", "display:none");
    form.attr("method", "post");
    form.attr("target", "_blank");
    form.attr("action", EXPORT_EXCEL_URL);

    // 根据情况添加标题
    if (title != null && title.length > 0) {
        var titleInput = $("<input/>");
        titleInput.attr("name", "title");
        titleInput.val(title);
        form.append(titleInput);
    }

    var contentInput = $("<input/>");
    contentInput.attr("name", "table");
    contentInput.val(requestXml);
    form.append(contentInput);

    // 提交表单
    form[0].submit();
};

/**
 * 获取数据
 */
hait.grid.Grid.prototype._getData = function () {
    var _this = this;
    // 这里的数据来源可能是两个地方
    if (this.mode == "local") {
        // 如果来源本地，直接从date中获取数据
        this.data = new Array();
        // 根据分页信息获取本次该显示的信息
        this._total = this._localData.length;
        // 计算开始行数
        this._start = (this._curPage - 1) * this.limit;
        // 计算剩余没有显示的所有信息行
        var leaveCount = this._localData.length - this._start;
        // 计算当前行数
        this._count = leaveCount > this.limit ? this.limit : leaveCount;
        // 计算总页数
        this._maxPage = Math.ceil(parseFloat(this._total) / this.limit);
        // 从原始数据中获取当前需要展示的数据
        for (var i = this._start; i < this._start + this._count; i++) {
            this.data.push(this._localData[i]);
        }

        // 显示数据
        this._fillData();
    } else if (this.mode == "func") {
        // 如果来源服务器，那么初始化参数，并从服务器获取信息
        this.params = this.params ? this.params : new Object();
        this._start = (this._curPage - 1) * this.limit;
        this.params.start = this._start;
        this.params.limit = this.limit;
        this.params.funcId = this.funcId ? this.funcId : null;
        if (this.params.operate == null) {
            this.params.operate = "query";
        }

        // 通过远程访问获取数据
        request({
            server: _this.server,
            data: [_this.params],
            func: function (data) {
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
                var data = new Array();
                for (var i = 0; i < items.length; i++) {
                    // 根据页面配置XML读取需要的信息
                    var item = items[i];
                    // 根据配置的列信息进行读取
                    var curDate = {};
                    // 将该对象的所有子项作为内容进行添加
                    for (var fieldName in item) {
                        var fieldValue = item[fieldName];
                        curDate[fieldName] = fieldValue;
                    }

                    data.push(curDate);
                }
                _this.data = data;

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
        $.post(_this.url, _this.params, function (data) {
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
            var data = new Array();
            for (var i = 0; i < items.length; i++) {
                // 根据页面配置XML读取需要的信息
                var item = items[i];
                // 根据配置的列信息进行读取
                var curDate = {};
                // 将该对象的所有子项作为内容进行添加
                for (var fieldName in item) {
                    var fieldValue = item[fieldName];
                    curDate[fieldName] = fieldValue;
                }

                data.push(curDate);
            }
            _this.data = data;
            // 显示数据
            _this._fillData();
        });
    }
};

/**
 * 统一的填充数据的方法
 */
hait.grid.Grid.prototype._fillData = function () {
    var _this = this;

    var tableData = this.obj.find(".hait-table-data");

    // 清除里面可能存在的“没有数据”的显示
    var tableEmpty = this.obj.find(".hait-table-empty");
    if (tableEmpty.size() > 0) {
        tableEmpty.remove();
    }

    // 初始化是否滚动
    this._isScroll = false;
    // 初始化是否显示区域过大
    this._isLargeDataArea = false;

    // 如果没有，则新创建
    if (tableData.size() == 0) {
        // 添加表格数据
        var curTableData = $('<div class="hait-table-data"><table cellspacing="0" cellpadding="0" border="0" class="hait-table"><tbody></tbody></table></div>');

        // 将表格数据添加到主对象中
        this._leftContainer.append(curTableData);
        this._rightContainer.append(curTableData.clone());
        this._leftContainer.find(".hait-table-data").css("overflow", "hidden");
        this._rightContainer.find(".hait-table-data").scroll(function () {
            var curScrollTop = $(this).scrollTop();
            _this._leftContainer.find(".hait-table-data").scrollTop(curScrollTop);
        });
        this.obj.append('<div class="cls"></div>');
        // 重新获取
        tableData = this.obj.find(".hait-table-data");
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
            // 如果是像素，那么这里比外围少57像素（底部）+ 33（每一行头）
            var differHeight = 0;

            // 如果没有分页栏，这里要减去57
            if (_this.pagination) {
                differHeight += 57;
            }
            // 如果没有统计栏，这里要减去33
            if (_this._isStatistics) {
                differHeight += 33;
            }

            var headTrCount = this.obj.find(".hait-table-title").find("tr").size();
            differHeight += headTrCount * 33;

            // 如果没有数据，那么多减33
            if (this.data == null || this.data.length == 0) {
                differHeight += 33;
            }

            var tableDataHeight = parseInt(styleHeight) - differHeight;
            tableData.css("height", tableDataHeight + "px");

            // 计算标题是否向左缩进
            var curLength = this.data.length;

            if (curLength * 33 > tableDataHeight) {
                this._isScroll = true;
            }

            if (curLength * 33 < tableDataHeight) {
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
    var leftTableBodyContent = this._getDateToHtml(0, this.lockCount, this.lockCount > 0 ? true : false);
    var rightTableBodyContent = this._getDateToHtml(this.lockCount, 0, this.lockCount > 0 ? false : true);

    tableBody.eq(0).append(leftTableBodyContent);
    tableBody.eq(1).append(rightTableBodyContent);

    // 配置行点击事件
    tableBody.find("tr").click(function (event) {

        tableBody.find(".selected").removeClass("selected");
        tableData.find("tr:eq(" + $(this).index() + ")").addClass("selected");

        // 如果配置了点击回调事件，那么调用
        if (_this.onrowclick) {
            _this.trigger(_this.onrowclick, _this.data[$(this).index()]);
        }
        // 执行完毕后，立即停止事件运行，以免冒泡执行
        event.stopPropagation();
    });

    tableBody.find("tr").dblclick(function () {
        // 如果配置了点击回调事件，那么调用
        if (_this.onrowdblclick) {
            _this.trigger(_this.onrowdblclick, _this.data[$(this).index()]);
        }
        // 执行完毕后，立即停止事件运行，以免冒泡执行
        event.stopPropagation();
    });

    for (var i = 0; i < this.data.length; i++) {
        var item = this.data[i];
        var tableBodyTr = tableBody.find("tr:eq(" + i + ")");
        // 将当前json信息，保存在该行tr对象中，便于操作
        if (this.multiple) {
            tableBodyTr.data("item", item);
            tableBodyTr.find("input[type=checkbox]").data("item", item);
        } else {
            tableBodyTr.data("item", item);
        }

    }

    // 如果没有数据，则显示没有数据
    if (this.data == null || this.data.length == 0) {
        // 将没有数据的显示添加到主对象中
        tableData.before('<div class="hait-table-empty">没有任何数据</div>');
        tableData.before('<div class="cls"></div>');
    }

    // 如果存在统计列，那么在这里增加
    if (this._isStatistics) {
        this._getStatisticsDate();
    }

    // 如果需要显示分页条，那么就进行填充分页条
    if (this.pagination) {
        this._fillPagination();
    }

    // 根据情况设置显示效果
    var isWin = navigator.userAgent.indexOf("Win32") >= 0 || navigator.userAgent.indexOf("Windows") >= 0;
    var showType = window.localStorage.getItem("showType");
    showType = showType ? showType : "1"; // 如果没有值，那么为1
    var scrollPaddingRight = isWin ? "16px" : "14px";
    var showTypeColor = showType == "1" ? "#e0e6eb" : "#9c9c9c";

    // 设置统计顶部边框颜色
    this._rightContainer.find(".hait-table-statistics").css("border-top", "1px solid " + showTypeColor);

    // 如果存在滚动，那么调整界面显示
    if (this._isScroll) {
        this._rightContainer.find(".hait-table-title > table").css("border-right", "1px solid " + showTypeColor);
        this._rightContainer.find(".hait-table-title").css("padding-right", scrollPaddingRight);
    } else {
        this._rightContainer.find(".hait-table-title > table").css("border-right", "0px");
        this._rightContainer.find(".hait-table-title").css("padding-right", "0px");
    }

    if (this._isStatistics) {
        this.obj.find(".hait-table-bottom").css("border-top", "0px");
    }

    // 如果数据显示区域过大，那么最后一行增加下边线
    if (this._isLargeDataArea) {
        tableBody.find("tr:last > td").css("border-bottom", "1px solid " + showTypeColor);
    }

    // 调用刷新完成事件
    if (this.onrefresh) {
        this.onrefresh();
    }
};

hait.grid.Grid.prototype._getDateToHtml = function (start, limit, isAddCheckbox) {
    limit = limit == 0 ? this.columns.length : limit;
    var _this = this;
    var tableBodyContent = "";
    for (var i = 0; i < this.data.length; i++) {
        var item = this.data[i];

        // 拼装HTML
        var tableBodyTr = "<tr>";

        // 如果设置了，复选，那么增加复选按钮
        if (this.multiple && isAddCheckbox) {
            var tableBodyTrTd = "<td class='checkbox'";
            tableBodyTrTd += "width='" + this._checkboxWidth + "%'";
            tableBodyTrTd += ">";
            tableBodyTrTd += "<input type=\"checkbox\" name=\"" + this.id + "_checkbox\"";
            // 如果返回数据中，存在参数checked且值不为空或者false，那么进行默认设置
            if (item.checked != null && item.checked.length > 0 && item.checked != "false") {
                tableBodyTrTd += " checked";
            }
            tableBodyTrTd += "/>";
            tableBodyTrTd += "</td>";
            tableBodyTr += tableBodyTrTd;
        }

        // 根据配置的列信息进行读取
        for (var j = start; j < this.columns.length; j++) {
            if (j >= limit) {
                continue;
            }
            var fieldName = this.columns[j].field;
            var fieldValue = item[fieldName];
            // 如果存在回调函数，那么执行回调函数
            if (this.columns[j].onwrite) {
                fieldValue = this.trigger(this.columns[j].onwrite, fieldValue, item, fieldName);
            }
            // 确保值不是null
            fieldValue = fieldValue != null ? fieldValue : "";

            // 如果配置了format,那么对目标数据进行格式化
            if (this.columns[j].format) {
                var format = this.columns[j].format;
                if (format == "seq") {
                    // 如果是序列，那么直接输出当前序号
                    fieldValue = (_this._curPage - 1) * _this.limit + (i + 1);
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
            if (this.columns[j].dict != null) {
                // 从缓存中获取对应数据
                if (!window.dict) {
                    hait.initDict();
                }
                options = window.dict.get(this.columns[j].dict);
            }
            // 如果配置了本地值，那么直接使用本地值，类似test1=1,test2=2,test3=3
            if (this.columns[j].options) {
                var datas = this.columns[j].options.split(",");
                options = [];
                for (var k = 0; k < datas.length; k++) {
                    var data = datas[k].split("=");
                    options.push({
                        text: data[0],
                        val: data[1]
                    });
                }
            }

            // 如果存在options的值,那么获取其中的值
            if (options) {
                for (var k = 0; k < options.length; k++) {
                    if (options[k].val == fieldValue) {
                        fieldValue = options[k].text;
                    }
                }
            }

            // 最后将结果值写入
            var tableBodyTrTd = "<td";

            // 如果内容中没有标签，那么则需要进行鼠标悬停显示
            if (typeof fieldValue == "number") {
                tableBodyTrTd += " title='" + fieldValue + "'";
            }
            if (typeof fieldValue == "string" && fieldValue.indexOf("<") == -1) {
                tableBodyTrTd += " title='" + fieldValue + "'";
            }

            // 如果是第一行，设置宽度
            if (i == 0) {
                tableBodyTrTd += " width='" + this.columns[j].width + "%'";
            }

            tableBodyTrTd += ">" + fieldValue + "</td>";
            tableBodyTr += tableBodyTrTd;
        }
        tableBodyTr += "</tr>";

        // 将这行添加进入
        tableBodyContent += tableBodyTr;
    }
    return tableBodyContent;
}

/**
 * 获得统计行数据
 */
hait.grid.Grid.prototype._getStatisticsDate = function () {
    var _this = this;

    // 确保统计区域一定存在
    var tableStatistics = this.obj.find(".hait-table-statistics");
    if (tableStatistics.size() == 0) {
        var curTableData = $('<div class="hait-table-statistics"></div>');
        this._leftContainer.append(curTableData);
        this._rightContainer.append(curTableData.clone());
    }

    // 重置统计行数据
    this._dateStatistics = {};
    if (this.statFuncId != null && this.statFuncId.length > 0) {
        // 克隆当前的表格请求参数
        var statFuncParams = $.parseJSON(JSON.stringify(_this.params));
        statFuncParams["funcId"] = this.statFuncId;

        // 通过远程获取统计数据
        request({
            server: _this.server,
            data: [statFuncParams],
            func: function (data) {
                var resultData = data.responses[0];

                // 如果失败,直接显示错误提示即可
                if (resultData.flag < 0) {
                    alert(resultData.message);
                    return;
                }

                // 获取统计行数据（只有一行）
                _this._dateStatistics = resultData.items && resultData.items[0] ? resultData.items[0] : {};
                // 显示数据
                _this._fillStatisticsHtml();
            }
        });
        return;
    }

    for (var i = 1; i < this.columns.length; i++) {
        var column = this.columns[i];
        if (column.statistics) {
            // 如果存在统计，那么在这里进行计算
            var result = 0;
            var isFloat = false;
            for (var j = 0; j < _this.data.length; j++) {
                var fieldValue = _this.data[j][column.field];
                // 为空或者不是数据，不参与统计
                if (fieldValue == null || fieldValue.length == 0 || isNaN(fieldValue)) {
                    continue;
                }
                // 将内容转成字符串
                fieldValue = fieldValue + "";

                // 如果是小数，那么使用小数方式叠加
                if (fieldValue.indexOf(".") >= 0) {
                    fieldValue = parseFloat(fieldValue);
                    isFloat = true;
                } else {
                    fieldValue = parseInt(fieldValue);
                }

                result += fieldValue;
            }

            // 如果是统计平均数，那么进行计算
            if (column.statistics == "avg") {
                result = result * 1.00 / _this.data.length;
                isFloat = true;
            }

            // 如果是小数，自动四舍五入到小数点后两位
            if (isFloat) {
                result = result.toFixed(2);
            }
            // 将这个统计数据保存起来
            _this._dateStatistics[column.field] = result;
        }
    }
    // 填入统计html
    this._fillStatisticsHtml();
};

/**
 * 填充统计数据
 */
hait.grid.Grid.prototype._fillStatisticsHtml = function () {
    var _this = this;
    // 清空统计内容
    var tableStatistics = this.obj.find(".hait-table-statistics");
    tableStatistics.empty();
    tableStatistics.append('<table cellspacing="0" cellpadding="0" border="0" class="hait-table"><tbody></tbody></table>');

    var tableBodyTr = $("<tr></tr>");

    if (this.multiple) {
        var tableBodyTrTd = $("<td class='checkbox'>&nbsp;</td>");
        tableBodyTrTd.attr("width", this._checkboxWidth + "%");
        tableBodyTr.append(tableBodyTrTd);
    }

    // 第一个位置放一个描述，也就是说，第一列不能作为统计列
    tableBodyTr.append("<td width='" + this.columns[0].width + "%'>统计</td>");

    // 根据配置的列信息进行读取
    for (var i = 1; i < this.lockCount; i++) {
        var column = this.columns[i];
        var tableBodyTrTd = null;
        var result = _this._dateStatistics[column.field];
        if (column.statistics && result) {
            tableBodyTrTd = $("<td title='" + result + "'>" + result + "</td>");
        } else {
            tableBodyTrTd = $("<td>&nbsp;</td>");
        }
        if (column.width) {
            tableBodyTrTd.attr("width", column.width + "%");
        }
        // 如果是第一行，设置宽度
        if (this.data.length == 0) {
            tableBodyTrTd.attr("width", this.columns[i].width + "%");
        }
        tableBodyTr.append(tableBodyTrTd);
    }

    if (this.lockCount > 0) {
        tableStatistics.eq(0).find("tbody").append(tableBodyTr);
        tableBodyTr = $("<tr></tr>");
    }

    // 根据配置的列信息进行读取
    var startIndex = this.lockCount > 0 ? this.lockCount : 1;
    for (var i = startIndex; i < this.columns.length; i++) {
        var column = this.columns[i];
        var tableBodyTrTd = null;
        var result = _this._dateStatistics[column.field];
        if (column.statistics && result) {
            tableBodyTrTd = $("<td title='" + result + "'>" + result + "</td>");
        } else {
            tableBodyTrTd = $("<td>&nbsp;</td>");
        }
        if (column.width) {
            tableBodyTrTd.attr("width", column.width + "%");
        }
        // 如果是第一行，设置宽度
        if (this.data.length == 0) {
            tableBodyTrTd.attr("width", this.columns[i].width + "%");
        }
        tableBodyTr.append(tableBodyTrTd);
    }

    if (!this.pagination) {
        tableStatistics.find("td").css("border-bottom", "0px");
    }

    // 将这行添加到底部窗口
    tableStatistics.eq(1).find("tbody").append(tableBodyTr);

    // 根据情况设置显示效果
    var isWin = navigator.userAgent.indexOf("Win32") >= 0 || navigator.userAgent.indexOf("Windows") >= 0;
    var showType = window.localStorage.getItem("showType");
    showType = showType ? showType : "1"; // 如果没有值，那么为1
    var scrollPaddingRight = isWin ? "16px" : "14px";
    var showTypeColor = showType == "1" ? "#e0e6eb" : "#9c9c9c";

    // 设置统计顶部边框颜色
    this.obj.find(".hait-table-statistics").css("border-top", "1px solid " + showTypeColor);

    // 如果存在滚动，那么调整界面显示
    if (this._isScroll) {
        this._rightContainer.find(".hait-table-statistics > table").css("border-right", "1px solid " + showTypeColor);
        this._rightContainer.find(".hait-table-statistics").css("padding-right", scrollPaddingRight);
    } else {
        this._rightContainer.find(".hait-table-statistics > table").css("border-right", "0px");
        this._rightContainer.find(".hait-table-statistics").css("padding-right", "0px");
    }
};

/**
 * 填充分页数据
 */
hait.grid.Grid.prototype._fillPagination = function () {
    var _this = this;
    // 开始输出表格底部
    var tableFoot = this.obj.find(".hait-table-bottom");

    if (tableFoot.size() == 0) {
        tableFoot = $('<div class="hait-table-bottom"></div>');
        this.obj.append(tableFoot);
    }

    // 清空内容
    tableFoot.empty();

    // 加入按钮组
    tableFoot.append('<div class="button-bar fl"></div>');
    if (this.buttons.length > 0) {
        var buttonBar = tableFoot.find(".button-bar");
        for (var i = 0; i < this.buttons.length; i++) {
            var buttonData = this.buttons[i];
            var buttonBarBtn = $('<button class="hait-button">' + buttonData.name + '</button>');
            if (buttonData.onclick) {
                buttonBarBtn.click(buttonData.onclick);
            }
            buttonBar.append(buttonBarBtn);
        }
    }

    // 拼装分页容器
    var pagination = $('<div class="pagination-bar"></div>');

    // 根据页面设置来设置显示位置
    if (this.paginationPlace == 'left') {
        pagination.addClass("fl");
    }
    if(this.paginationPlace == 'right'){
        pagination.addClass("fr");
    }
    if(this.paginationPlace == 'center'){
        pagination.addClass("fc");
    }

    // 添加分页描述
    var paginationInfoContext = "<div class=\"pagination-info\">";
    paginationInfoContext += "共 " + this._total + " 条";
    paginationInfoContext += "</div>";
    pagination.append(paginationInfoContext);
    hait.register("hait.form.field.SelectField");
    var select = new hait.form.field.SelectField();
    select.setParam({
        defaultValue: this.limit,
        options: [{
            text: "10条/页",
            val: "10"
        }, {
            text: "20条/页",
            val: "20"
        }, {
            text: "30条/页",
            val: "30"
        }, {
            text: "40条/页",
            val: "40"
        }]
    });
    select.draw();
    select.obj[0].style.width = "90px";
    select.obj[0].style.float = "left";
    pagination.append(select.obj);

    // 计算要显示的页数
    var showPageNumbers = [];
    var maxShowNumber = 5;
    if (this._maxPage <= maxShowNumber) {
        // 所有都显示
        for (var i = 1; i <= this._maxPage; i++) {
            showPageNumbers.push(i);
        }
    } else {
        // 页数过多进行拆分
        if (this._curPage < maxShowNumber) {
            for (var i = 1; i < maxShowNumber; i++) {
                showPageNumbers.push(i);
            }
            showPageNumbers.push("...");
            showPageNumbers.push(this._maxPage);
        } else if (this._curPage > this._maxPage - maxShowNumber + 2) {
            showPageNumbers.push(1);
            showPageNumbers.push("...");
            for (var i = this._maxPage - maxShowNumber + 2; i <= this._maxPage; i++) {
                showPageNumbers.push(i);
            }
        } else {
            showPageNumbers.push(1);
            showPageNumbers.push("...");
            showPageNumbers.push(this._curPage - 1);
            showPageNumbers.push(this._curPage);
            showPageNumbers.push(this._curPage + 1);
            showPageNumbers.push("...");
            showPageNumbers.push(this._maxPage);
        }
    }

    // 添加分页数字列表
    var leftUrl = HOST_URL + "/frame/hait/css/images/left.png";
    var leftNoUrl = HOST_URL + "/frame/hait/css/images/left-no.png";
    var rightUrl = HOST_URL + "/frame/hait/css/images/right.png";
    var rightNoUrl = HOST_URL + "/frame/hait/css/images/right-no.png";
    var paginationNumbers = $('<ul class="pagination-num"></ul>');
    paginationNumbers.append('<li name="prevBtn"><img src="' + leftNoUrl + ' "></li>');
    for (var i = 0; i < showPageNumbers.length; i++) {
        var paginationNumber = $('<li>' + showPageNumbers[i] + '</li>');

        if (showPageNumbers[i] == "...") {
            paginationNumber.attr("class", "disabled");
            paginationNumbers.append(paginationNumber);
            continue;
        }

        if (this._curPage == showPageNumbers[i]) {
            paginationNumber.attr("class", "selected");
        }
        paginationNumber.click(function () {
            var pageNumber = $(this).text();
            _this.pageJump(pageNumber);
        });

        paginationNumbers.append(paginationNumber);
    }
    paginationNumbers.append('<li name="nextBtn"><img src="' + rightUrl + ' "></li>');
    pagination.append(paginationNumbers);

    // 添加分页查询框
    pagination.append('<span class="limit-text">前往</span></input><input id="gridLimitPage" type="text" class="pagination-input"/> <span class="limit-text">页</span>');

    // 为上一次添加点击事件
    var prevBtn = paginationNumbers.find("li[name=prevBtn]");
    if (this._curPage == 1) {
        prevBtn.html("<img src=\"" + leftNoUrl + "\">");
    } else {
        prevBtn.html("<img src=\"" + leftUrl + "\">");
        prevBtn.click(function () {
            _this.pagePrev();
        });
    }

    // 为下一页增加点击时间
    var nextBtn = paginationNumbers.find("li[name=nextBtn]");
    if (this._curPage == this._maxPage) {
        nextBtn.html("<img src=\"" + rightNoUrl + "\">");
    } else {
        nextBtn.html("<img src=\"" + rightUrl + "\">");
        nextBtn.click(function () {
            _this.pageNext();
        });
    }

    var jumpBtn = pagination.find(".pagination-input");
    jumpBtn.on("input propertychange", function () {
        this.value=this.value.replace(/\D/g,'');
    });
    jumpBtn.keyup(function(){
        if(event.keyCode == 13) {
            var jumpNumber = jumpBtn.val();
            _this.pageJump(jumpNumber);
        }
    });

    // 将分页条添加到td中
    tableFoot.append(pagination);



    console.log(this.id);
    var targetGridId = this.id;
    var showText = $("#" + this.id).find(".hait-select .select-show-text");
    showText.removeClass("select-show-text");
    showText.addClass("select-limit");
    showText.parent().css("margin-top", "2px");
    var selectItems = $("#" + this.id).find(".hait-select .select-items");
    selectItems.css("top", "-124px");

    $("#" + this.id).find(".select-items li").click(function(){
        var limit = $(this).attr("val");
        var targetGrid = hait.getCompById(targetGridId);
        targetGrid.limit = limit;
        targetGrid.params = {};
        targetGrid.params.start = 0;
        targetGrid.params.limit = limit;
        targetGrid.refresh();
    });
};

function changeLimit(){

}

/**
 * 初始化每列宽度
 */
hait.grid.Grid.prototype._initColumnWidth = function () {
    var tableWidth = this.lockCount > 0 ? parseInt(this.lockRightWidth) : this.obj.width();

    // 由于在实际绘制时，列宽度采用的百分比，所以这里会先将所有设置了宽度为固定像素的列，统一换算为百分比
    for (var i = 0; i < this.columns.length; i++) {
        if (this.columns[i].width == null) {
            continue;
        }
        var curWidth = this.columns[i].width;
        if (curWidth.indexOf("%") >= 0) {
            // 百分比模式
            curWidth = curWidth.substring(0, curWidth.indexOf("%"));
            curWidth = parseFloat(curWidth);
        } else if (curWidth.indexOf("px") >= 0) {
            // 固定像素模式
            curWidth = curWidth.substring(0, curWidth.indexOf("px"));
            curWidth = parseInt(curWidth);
            curWidth = Math.round(curWidth / tableWidth * 10000) / 100;
        } else {
            // 没有按规则设置，都清空
            curWidth = null;
        }
        this.columns[i].width = curWidth;
    }

    // 计算复选框宽度
    if (this.obj.width() > 0) {
        var curCheckboxWidth = Math.round(35 / tableWidth * 10000) / 100;
        if (curCheckboxWidth < this._checkboxWidth) {
            this._checkboxWidth = curCheckboxWidth;
        }
    }

    // 计算每列宽度
    var defaultWidth = 100;
    if (this.multiple) {
        defaultWidth -= this._checkboxWidth;
    }
    var defaultWidthCount = this.columns.length;
    for (var i = 0; i < this.columns.length; i++) {
        if (this.columns[i].width) {
            defaultWidth -= this.columns[i].width;
            defaultWidthCount--;
        }
    }

    if (defaultWidth < 0) {
        // 如果宽度为负数了，那么表示设置有问题，所有列宽度平分
        defaultWidthCount = this.columns.length;
        defaultWidth = 100 / defaultWidthCount;
        defaultWidth = Math.round(defaultWidth * 100) / 100; // 取小数点后两位
        for (var i = 0; i < this.columns.length; i++) {
            this.columns[i].width = defaultWidth;
        }
    } else if (defaultWidth > 0) {
        // 如果宽度有剩余的，那么没有设置宽度的列宽度平分
        defaultWidth = defaultWidth / defaultWidthCount;
        defaultWidth = Math.round(defaultWidth * 100) / 100; // 取小数点后两位
        for (var i = 0; i < this.columns.length; i++) {
            if (this.columns[i].width == null) {
                this.columns[i].width = defaultWidth;
            }
        }
    }
};