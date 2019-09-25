/**
 * 导出Excel
 * 
 * @param funcId
 *            功能号
 * @param params
 *            参数（JSON）
 * @param fields
 *            表头（JSON）
 * @param fileName
 *            Excel文件名称，默认为export.xls
 */
function exportToExcel(funcId, params, fields, fileName, type) {
	var token = hait.getToken();
	if (token == null || token.length == 0) {
		alert("您没有登录，无法导出，请检查！");
		return;
	}
	if (params == null) {
		params = {};
	}
	if (fields == null) {
		fields = [];
	}
	if (fields.length == 0) {
		alert("没有表头信息，无法导出，请检查！");
		return;
	}
	fileName = fileName == null ? "" : fileName;

	// 判断当前界面是否存在Excel导出表单
	var excelExportForm = document.getElementById("excel-export-form");
	if (excelExportForm == null) {
		// 创建表单
		excelExportForm = document.createElement('form');
		excelExportForm.action = "/wanchun/export/excel.do";
		excelExportForm.id = "excel-export-form";
		excelExportForm.method = "post";
		excelExportForm.style = "display:none";
		excelExportForm.target = "_blank";
		// 创建type输入框
		var typeInput = document.createElement('input');
		typeInput.name = "type";
		typeInput.type = "text";
		excelExportForm.appendChild(typeInput);
		// 创建token输入框
		var tokenInput = document.createElement('input');
		tokenInput.name = "token";
		tokenInput.type = "text";
		excelExportForm.appendChild(tokenInput);
		// 创建funcId输入框
		var funcIdInput = document.createElement('input');
		funcIdInput.name = "func-id";
		funcIdInput.type = "text";
		excelExportForm.appendChild(funcIdInput);
		// 创建fileName输入框
		var fileNameInput = document.createElement('input');
		fileNameInput.name = "file-name";
		fileNameInput.type = "text";
		excelExportForm.appendChild(fileNameInput);
		// 创建params输入框
		var paramsInput = document.createElement('textarea');
		paramsInput.name = "params";
		excelExportForm.appendChild(paramsInput);
		// 创建fields输入框
		var fieldsInput = document.createElement('textarea');
		fieldsInput.name = "fields";
		excelExportForm.appendChild(fieldsInput);
		document.body.appendChild(excelExportForm);
	}
	excelExportForm.elements["type"].value = type;
	excelExportForm.elements["token"].value = token;
	excelExportForm.elements["func-id"].value = funcId;
	excelExportForm.elements["file-name"].value = fileName;
	excelExportForm.elements["params"].value = JSON.stringify(params);
	excelExportForm.elements["fields"].value = JSON.stringify(fields);
	excelExportForm.submit();
}