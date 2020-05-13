function Swipe(obj){
	this.id = obj.id;
	this.cas = document.getElementById(this.id);
	this.context = this.cas.getContext("2d");
	this._w = obj._w;
	this._h = obj._h;
	this.radius = obj.r;
	this.posX = 0;
	this.posY = 0;
	this.isMouseDown = false;
	this.mask = obj.mask;
	this.coverType = obj.coverType;
	this.percent = obj.percent;
	this.callback = obj.callback;
	//先调用初始化方法
	this.init();
	this.addEvent();
}
// 设置canvas的图形组合方式，并填充指定的颜色
Swipe.prototype.init = function(){
	this.cas.width = this._w;
	this.cas.height = this._h;
	//如果coverType是颜色
	if(this.coverType === "color"){
		this.context.fillStyle=this.mask;
		this.context.fillRect(0,0,this._w,this._h);
		this.context.globalCompositeOperation = "destination-out";
	}
	//如果coverType是图片
	if(this.coverType === "img"){
		var img01 = new Image();
		img01.src = this.mask;
		var that = this;
		img01.onload = function(){
			that.context.drawImage(img01,0,0,img01.width,img01.height,0,0,that._w,that._h);
			that.context.globalCompositeOperation = "destination-out";
		};
	}
	
};
//添加自定义监听事件
Swipe.prototype.addEvent = function(){
	var that = this;
	//判断是移动端还是pc端

	//判断是pc端还是移动端
	this.device = (/android|webos|iPhone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));
	this.clickEvent = this.device?"touchstart":"mousedown";
	this.moveEvent = this.device?"touchmove":"mousemove";
	this.upEvent = this.device?"touchend":"mouseup";
	this.cas.addEventListener(this.clickEvent,function(evt){
		that.offsetTop = getAllOffset(that.cas).allTop;
		that.offsetLeft = getAllOffset(that.cas).allLeft;
		that.scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
		var event = evt || window.event;
		that.posX = that.device?event.touches[0].clientX-that.offsetLeft:event.clientX-that.offsetLeft;
		that.posY = that.device?event.touches[0].clientY-that.offsetTop+that.scrollTop:event.clientY-that.offsetTop+that.scrollTop;
		that.drawArc(that.posX,that.posY);
		that.isMouseDown = true; //鼠标按下
	});
	this.cas.addEventListener(this.moveEvent,function(evt){
		if( !that.isMouseDown ){
			return false;
		}else{
			var event = evt || window.event;
			var x2 = that.device?event.touches[0].clientX-that.offsetLeft:event.clientX-that.offsetLeft;
			var y2 = that.device?event.touches[0].clientY-that.offsetTop+that.scrollTop:event.clientY-that.offsetTop+that.scrollTop;
			// 调用canvas画线，将鼠标移动时坐标作为lineTo()参数传入。注意上一次点击时的坐标点作为画线的起始坐标
			that.drawLine(that.context,that.posX,that.posY,x2,y2,that.r);
			//鼠标边移动边画线，因此需要把上一次移动的点作为下一次画线的起始点
			that.posX = that.device?event.touches[0].clientX-that.offsetLeft:event.clientX-that.offsetLeft;
			that.posY = that.device?event.touches[0].clientY-that.offsetTop+that.scrollTop:event.clientY-that.offsetTop+that.scrollTop;
		}
	});
	this.cas.addEventListener(this.upEvent,function(evt){
		that.isMouseDown = false; //鼠标未按下
		//检测透明点的个数
		var n = that.getPercentage(that.context,that._w,that._h);
		if( n > that.percent ){
			that.callback.call(null,n);
			alert("擦除完成");
			that.context.clearRect(0,0,that._w,that._h);
		}
	});
};
Swipe.prototype.drawLine = function(context,x1,y1,x2,y2,r){
	context.beginPath();
	context.moveTo(x1,y1);
	context.lineTo(x2,y2);
	context.lineWidth = this.radius*2;
	context.lineCap = "round";
	context.stroke();
};
Swipe.prototype.getPercentage = function(context,_w,_h){
	var img1 = context.getImageData(0,0,_w,_h);
	var x= 0;
	for(var i=0;i<img1.data.length;i+=4){
		if (img1.data[i+3]===0){
			x++;
		}
	}
	return (x/(_w*_h))*100;
};
Swipe.prototype.drawArc = function(x1,y1){
// 画圆，圆心坐标为鼠标的坐标
 this.context.save();
 this.context.beginPath();
 this.context.arc(x1,y1,this.radius,0,2*Math.PI);
 this.context.fillStyle = "red";
 this.context.fill();
 this.context.stroke();
 this.context.restore();
};
function getAllOffset(obj){
	var Top = 0;
	var Left = 0;
	while(obj){
		Top+=obj.offsetTop+obj.clientTop;
		Left+=obj.offsetLeft+obj.clientLeft;
		obj=obj.offsetParent;
	}
	return {"allTop":Top,"allLeft":Left};
}
