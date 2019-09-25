/**
 * ImageUploadField对象，标准的文件上传组件
 * 
 * @author pandong
 * @date 2016-10-26 下午18:44:47
 * @Copyright(c) yunlaila.com.cn
 */

hait.namespace("hait.form.field");

hait.register("hait.form.Field");
hait.addHead(BASE_PATH + "/frame/plugins/jquery/jquery.base64.js");

/**
 * ImageUploadField对象构造方法
 */
hait.form.field.ImageUploadField = function() {

	/**
	 * 上传文件总数限制
	 */
	this.limit = null;

	/**
	 * 图片用途，重要参数，用于确定是否唯一，有效期、存放位置等多种属性
	 */
	this.purpose = null;

	/**
	 * 文件名称，设置后，上传的文件会以此命名
	 */
	this.fileName = null;

	/**
	 * 私有属性
	 */
	this._form = null; // 表单组件
	this._file = null; // 系统上传组件
	this._select = null; // 图片选择按钮
	this._title = null; // 上传标题
	this._images = null; // 所有图片列表

};

// 继承于hait.form.Field对象
hait.form.field.ImageUploadField.inherit(hait.form.Field);

/**
 * 通过原始Element对象转换
 * 
 * @param obj
 */
hait.form.field.ImageUploadField.prototype.convert = function(obj) {

	// 调用父级方法convert
	this.father(hait.form.Field, "convert", obj);

	// 获取本身的特殊属性
	this.limit = this.obj.attr("limit") ? parseInt(this.obj.attr("limit")) : 1;
	this.fileName = this.obj.attr("file-name") ? this.obj.attr("file-name") : null;
	this.purpose = this.obj.attr("purpose") ? this.obj.attr("purpose") : null;

	// 转换绘制方法
	this.draw();
};

/**
 * 直接创建的方法
 */
hait.form.field.ImageUploadField.prototype.draw = function() {

	// 调用父级方法convert
	this.father(hait.form.Field, "draw");

	var _this = this;

	// 创建总容器
	var container = $("<div id='" + _this.id + "' class='hait-upload-container'></div>");

	// 如果this.obj不为空，删除自己
	if (this.obj) {
		this.obj.after(container);
		this.obj.remove();
	}

	this.obj = container;

	// 创建所有相关对象
	this._select = $('<input type="button" class="hait-button fl" value="上传照片"/>');
	this._title = $('<div class="title">&nbsp;</div>');
	this._images = $('<div class="upload-images"></div>');
	this._form = $('<form name="' + _this.id + '_form" method="post" enctype="multipart/form-data"></form>');
	this._file = $("<input type=\"file\" name=\"" + _this.id + "_file\" accept=\"image/jpeg,image/x-png,image/gif\"/>");
	this._form.css("display", "none");

	// 开始进行界面拼装
	this.obj.append(this._select);
	this.obj.append("<div class='cls'/>");
	if (this.limit > 1) {
		this.obj.append(this._title);
	}
	this.obj.append(this._images);
	this._form.append(this._file);
	$(document.body).append(this._form);

	// 获取表单中的上传组件，当它的值变化时，直接将内容进行提交
	this._file.change(function() {
		_this._select.val("正在上传...");
		// 进行上传操作
		var reader = new FileReader();
		var file = document.forms[_this.id + "_form"][_this.id + "_file"].files[0];
		if (file == null) {
			_this._select.val("上传照片");
			return;
		}
		reader.name = file.name;
		reader.type = file.type;
		reader.onloadend = function() {
			_this._select.val("上传照片");
			if (reader.error) {
				alert("文件上传失败，原因可能是:" + reader.error);
				return;
			}

			var base64Str = $.base64.btoa(reader.result);
//			// 获取token数据
//			var token = hait.cookie.get("token");
//			if (token == null || token.length == 0) {
//				token = window.localStorage["token"];
//			}

//			// 定义文件名称
//			var imageName = null;
//			if (_this.fileName && _this.limit && _this.limit > 1) {
//				var isHaveDefaultImage = _this._images.find(".default-image").size() > 0 ? true : false;
//				var uploadImageCount = _this._images.find(".upload-image").size();
//				if (isHaveDefaultImage) {
//					uploadImageCount--;
//				}
//				imageName = _this.fileName + "-" + uploadImageCount;
//			}
			var resourceSuffix = "JPG";
			if(reader.type.indexOf("png")) {
				resourceSuffix = "PNG";
			}
			request({
				url : FILE_UPLOAD_URL,
				data:[{
					funcId : "hex_resource_uploadBase64ImageFunction",
					resource_type : _this.purpose,
					resource_note : "凭证",
					resource_suffix : resourceSuffix,
					base64_content : base64Str
				}],
				func:function(data){
					// 上传完成后，清空表单中的内容
					_this._form[0].reset();
					var response = data.responses[0];
					if (response.flag <= 0) {
						alert("文件上传失败，原因可能是：" + response.message);
						return;
					}
					_this._addImage(response);
				}
			});
			
//			$.post(FILE_UPLOAD_URL, {
//				token : token,
//				purpose : _this.purpose,
//				image_type : reader.type,
//				image_name : imageName,
//				base64_content : base64Str
//			}, function(data) {
//				// 上传完成后，清空表单中的内容
//				_this._form[0].reset();
//				var response = data.responses[0];
//				if (response.flag <= 0) {
//					alert("文件上传失败，原因可能是：" + response.message);
//					return;
//				}
//				_this._addImage(response);
//			}, "json");
		};
		reader.readAsBinaryString(file);
	});

	// 选择按钮点击后，触发上传组件
	this._select.click(function() {
		// 判断图片用途是否设置，如果没有直接不允许上传
		if (_this.purpose == null || _this.purpose.length == 0) {
			alert("您没有设置图片用途，请检查!");
			return;
		}

		if ($(this).val() == "正在上传...") {
			return false;
		}
		var count = _this._images.find(".upload-image").size();
		// 如果发现默认图片，那么数量减少，因为这个一会要删除
		if (_this._images.find(".default-image").size() > 0) {
			count--;
		}
		if (count >= _this.limit) {
			return;
		}
		_this._file.click();
	});

	// 重置标题
	this._resetTitle();

	// 完毕后，如果设置了初始化值，那么就相应设置
	if (this.defaultValue) {
		this.setValue(this.defaultValue);
	}

	if (this.readonly) {
		this.setReadonly(this.readonly);
	}

	if (this.disabled) {
		this.setDisabled(this.disabled);
	}
};

/**
 * 实现getValue操作
 */
hait.form.field.ImageUploadField.prototype.getValue = function() {
	var urls = "";
	this._images.find(".upload-image").each(function() {
		urls += $(this).data("url") + ",";
	});
	if (urls.length > 0) {
		urls = urls.deleteLastComma();
	}
	return urls;
};

/**
 * 实现setValue操作
 * 
 * @param val
 */
hait.form.field.ImageUploadField.prototype.setValue = function(val) {
	this._images.empty();
	if (val == null || val.length == 0) {
		this._resetTitle();
		return;
	}
	var urls = val.split(",");
	for (var i = 0; i != urls.length; i++) {
		var image = {
			flag : 1,
			message : urls[i]
		};
		this._addImage(image);
	}
	this._resetTitle();
};

hait.form.field.ImageUploadField.prototype.setDisabled = function(isDisabled) {
	this.father(hait.form.Field, "setDisabled", isDisabled);
	if (this.disabled) {
		this.obj.attr("disabled", true);
		this._select.attr("disabled", true);
		this._select.hide();
		this._title.hide();
		this._images.find(".icon-black-close").hide();
	} else {
		this.obj.removeAttr("disabled");
		this._select.removeAttr("disabled");
		this._select.show();
		this._title.show();
		this._images.find(".icon-black-close").show();
	}
};

hait.form.field.ImageUploadField.prototype.setReadonly = function(isReadonly) {
	this.father(hait.form.Field, "setReadonly", isReadonly);
	if (this.readonly) {
		this.obj.attr("disabled", true);
		this._select.hide();
		this._title.hide();
		this._images.find(".icon-black-close").hide();
	} else {
		this.obj.removeAttr("disabled");
		this._select.removeAttr("disabled");
		this._select.show();
		this._title.show();
		this._images.find(".icon-black-close").show();
	}
};

hait.form.field.ImageUploadField.prototype.reset = function() {
	this._images.empty();
	this._resetTitle();
};

/**
 * 添加图片对象
 * 
 * @param flag
 * @param url
 */
hait.form.field.ImageUploadField.prototype._addImage = function(response) {
	var _this = this;
	var url = response.message;

	// 如果发现存在默认图片，那么需要删除
	if (_this._images.find(".default-image").size() > 0) {
		_this._images.find(".default-image").remove();
	}

	var uploadImage = $('<div class="upload-image"><div class="icon icon-black-close"></div></div>');
	// 保存数据，以备后面查询
	uploadImage.data("url", url);
	uploadImage.append("<img src='" + url + "'/>");
	
	if(this.disabled || this.readonly) {
		uploadImage.find(".icon-black-close").hide();
	}

	// 添加图片点击事件
	uploadImage.find("img").click(function() {
		// 打开图片链接
		var fileUrl = $(this).parent().data("url");
		window.open(fileUrl);
	});

	// 添加删除按钮事件
	uploadImage.find(".icon-black-close").click(function() {
		if (!window.confirm("您确定要删除该图片吗？")) {
			return false;
		}
		var imageObj = $(this).parent();
		var fileUrl = imageObj.data("url");
		
		request({
			url : FILE_UPLOAD_URL,
			data:[{
				funcId : "hex_resource_deleteResourceByURLFunction",
				resource_url : fileUrl
			}],
			func:function(data){
				var response = data.responses[0];
				if (response.flag <= 0) {
					alert("文件删除失败，原因可能是：" + response.message);
					return;
				}
				imageObj.remove();
				_this._resetTitle();
			}
		});
		
//		// 获取token数据
//		var token = hait.cookie.get("token");
//		if (token == null || token.length == 0) {
//			token = window.localStorage["token"];
//		}
//		$.post(FILE_DELETE_URL, {
//			token : token,
//			outer_url : fileUrl
//		}, function(data) {
//			var response = data.responses[0];
//			if (response.flag <= 0) {
//				alert("文件删除失败，原因可能是：" + response.message);
//				return;
//			}
//			imageObj.remove();
//			_this._resetTitle();
//		}, "json");
	});

	this._images.append(uploadImage);
	this._resetTitle();
};

/**
 * 重置标题信息
 */
hait.form.field.ImageUploadField.prototype._resetTitle = function() {
	if (this._title == null) {
		return;
	}
	var count = this._images.find(".upload-image").size();

	// 如果没有图片了，那么添加默认图片占位
	if (count == 0) {
		this._images.append('<div class="upload-image default-image"><div class="text">暂无图片</div></div>');
	}

	// 如果有更多的图片，其中存在默认图，那么需要将有效图片数量间减少1
	if (count > 0 && this._images.find(".default_image").size() > 0) {
		count--;
	}

	var title = "";
	if (count == 0) {
		title = "您可以上传" + this.limit + "个文件";
	} else {
		title = '您已上传了<b><font color="red">' + count + '</font></b>个文件，还能上传<b><font color="red">' + (this.limit - count) + '</font></b>个文件';
	}
	this._title.empty();
	this._title.append(title);
};