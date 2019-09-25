
/**
 * 查看图片
 */
function showImageDialog() {
    var viewer = new Viewer(document.getElementById('viewer'),{
        toolbar:true,
        fullscreen:false,
        zoomRatio:0.5,
        minZoomRatio:0.2,
        maxZoomRatio:2,
        show: function (){  // 动态加载图片后，更新实例
            viewer.update();
        },
        hide:function(){
            viewer.destroy();
        }
        // toolbar:false
    });
    $("#viewer").find("img:eq(0)").click();

}