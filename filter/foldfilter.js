/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Fold filer map 
* 	@constructor
*	@requires ol.filter
*	@extends {ol.filter.Base}
*	@param {ol.filter.foldOptions}
*		- fold {Array<int>} number of fold (horizontal and vertical)
*		- margin {Number} margin in px, default 8
*		- padding {Number} padding in px, default 8
*		- fsize {integer|Array<integer>} fold size in px, default 8,10
*/
ol.filter.Fold = function(options)
{	options = options || {};
	ol.filter.Base.call(this, options);
	
	this.set("fold", options.fold || [8,4]);
	this.set("margin", options.margin || 8);
	this.set("padding", options.padding || 8);
	if (typeof options.fsize == "number") options.fsize = [options.fsize,options.fsize];
	this.set("fsize", options.fsize || [8,10]);
}
ol.inherits(ol.filter.Fold, ol.filter.Base);

ol.filter.Fold.prototype.drawLine_ = function(ctx, d, m)
{	var canvas = ctx.canvas;
	var fold = this.get("fold");
	var w = canvas.width;
	var h = canvas.height;

	ctx.beginPath();
	ctx.moveTo ( m, m );
	for (var i=1; i<=fold[0]; i++)
	{	x = i*w/fold[0] - (i==fold[0] ? m : 0);
		y =  d[1]*(i%2) +m;
		ctx.lineTo ( x, y );
	}
	for (var i=1; i<=fold[1]; i++)
	{	x = w - d[0]*(i%2) - m;
		y = i*h/fold[1] - (i==fold[1] ? d[0]*(fold[0]%2) + m : 0);
		ctx.lineTo ( x, y );
	}
	for (var i=fold[0]; i>0; i--)
	{	x = i*w/fold[0] - (i==fold[0] ? d[0]*(fold[1]%2) + m : 0);
		y = h - d[1]*(i%2) -m;
		ctx.lineTo ( x, y );
	}
	for (var i=fold[1]; i>0; i--)
	{	x = d[0]*(i%2) + m;
		y = i*h/fold[1] - (i==fold[1] ? m : 0);
		ctx.lineTo ( x, y );
	}
	ctx.closePath();
}

ol.filter.Fold.prototype.precompose = function(e)
{	var ctx = e.context;
	var canvas = ctx.canvas;

	var fold = this.get("fold");
	var w = canvas.width;
	var h = canvas.height;
	
	ctx.save();
		ctx.shadowColor = "rgba(0,0,0,0.3)";
		ctx.shadowBlur = 8;
		ctx.shadowOffsetX = 2;
		ctx.shadowOffsetY = 3;
		this.drawLine_(ctx, this.get("fsize"), this.get("margin"));
		ctx.fillStyle="#fff";
		ctx.fill();
		ctx.strokeStyle = "rgba(0,0,0,0.1)";
		ctx.stroke();
	ctx.restore();

	ctx.save();
	this.drawLine_(ctx, this.get("fsize"), this.get("margin") + this.get("padding"));
	ctx.clip();

}

ol.filter.Fold.prototype.postcompose = function(e)
{	var ctx = e.context;
	var canvas = ctx.canvas;

	ctx.restore();
	ctx.save();
		this.drawLine_(ctx, this.get("fsize"), this.get("margin"));
		ctx.clip();
		
		var fold = this.get("fold");
		var w = canvas.width/fold[0];
		var h = canvas.height/fold[1];

		var grd = ctx.createRadialGradient(5*w/8,5*w/8,w/4,w/2,w/2,w);
		grd.addColorStop(0,"transparent");
		grd.addColorStop(1,"rgba(0,0,0,0.2)");
		ctx.fillStyle = grd;
		ctx.scale (1,h/w);
		for (var i=0; i<fold[0]; i++) for (var j=0; j<fold[1]; j++)
		{	ctx.save()
			ctx.translate(i*w, j*w);
			ctx.fillRect(0,0,w,w);
			ctx.restore()
		}
	ctx.restore();
}
