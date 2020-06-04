class InteractionHandle{
	constructor(map,DataHandle) {
	    this.map = map;
		this.dataHandle = DataHandle;
		let source = new ol.source.Vector();
		this.vector = new ol.layer.Vector({
			source: source,
			style:new ol.style.Style({
				fill: new ol.style.Fill({
					color: 'rgba(255, 255, 255, 0.2)'
				}),
				stroke: new ol.style.Stroke({
					color: '#ff0000',
					width: 2
				}),
				image: new ol.style.Circle({
					radius: 7,
					fill: new ol.style.Fill({
						color: '#ffcc33'
					})
				})
			})
		});
		this.map.addOverlay(this.vector);
		
		var modify = new ol.interaction.Modify({
			source: source
		});
		this.map.addInteraction(modify);
		this.source = source;
		
	}

	/**
	 * 创建draw
	 * @param {drawType.<String>} 绘制交互类型
	 * @return void
	 */
	addInteractions(drawType='Point') {
		let self = this;
		let source = this.source;
		let commStyle = new CommonStyle();
		let draw = new ol.interaction.Draw({
			source: source,
			type: drawType
		});
		
		//添加 interaction
		this.map.addInteraction(draw);
		let snap = new ol.interaction.Snap({
			source: source
		});
		
		//添加 snap
		this.map.addInteraction(snap);
		let eventhandle = new EventHandle(this.map);
		let idNum;
		draw.on('drawend',function(e){
			let draw_point_arr = [];
			let chekableNodeIds=[];
			// 判断绘制的图形区域是否包含指定的坐标点
			State.corrdinateArr_global.forEach((item, index) => {
			  let bool = e.feature.getGeometry().intersectsCoordinate([item.lon, item.lat])
			  // console.log(bool)
			  if(bool) {
			    draw_point_arr.push(item)
	
				chekableNodeIds.push(State.recordTreeQuee[item.nodeId]);
				// 存一下父节点
				chekableNodeIds.push(State.recordTreeQuee[item.pId]);
			  }
			})
			// draw_point_arr.length>0?self.dataHandle.create_features_by_arrobj(draw_point_arr):'';
			draw_point_arr.length>0?self.tableLoad(draw_point_arr):'';

			 $('#tree').treeview('checkNode',[chekableNodeIds,{silent:true}]);
			 
			idNum=State.drawFeatureAll.length+1;
			e.feature.setId(idNum);
			e.feature.set('type',drawType);
			State.drawFeatureAll.push({idNum:idNum,type:drawType});
			// 绘制不同样式
			e.feature.setStyle(function(e) {
				return commStyle.styleFunctionDefault(drawType,this);
			})	
			State.selectedObj = '';
			State.selectedObj =	e.feature;//赋值便于新增操作，不然要二次点击才能获取id
			self.removeInteractions();// 清除画笔
		});
		State.draw = draw;
		State.snap = snap;
	//	return [draw, snap];
	}
	
	// 框选将数据加载到table 
	tableLoad(draw_point_arr){
		
		let html_join ;
		let officer_total=0;
		let Sergeant_total =0;
		let warrior_total=0;
		let persion_total=0;
		draw_point_arr.forEach(item =>{
			// 计算总人数
			let totalArm = item.officer+item.warrior+item.Sergeant;
			officer_total+=item.officer;
			Sergeant_total+=item.Sergeant;
			warrior_total+=item.warrior;
			totalArm = this._toThousands(totalArm);
			
			html_join += `<tr><td>${item.text}</td>\
			<td>${item.officer}</td>\
			<td>${item.Sergeant}</td>\
			<td>${item.warrior}</td>\
			<td>${totalArm}</td>\
			<td>${item.arms}</td>\
			<td>${item.lon}</td>\
			<td >${item.lat}</td>\
			<td><button type='button' class='btn btn-default  btn-xs' data-coordinates = '${item.coordinates}' >定位</button></td></tr>`
		})
		$("#detail_table tbody").children().remove();
		
		// 最后增加一行 汇总
		persion_total = officer_total+Sergeant_total+warrior_total;
		officer_total = this._toThousands(officer_total);
		Sergeant_total = this._toThousands(Sergeant_total);
		warrior_total = this._toThousands(warrior_total);
		persion_total = this._toThousands(persion_total);
		html_join += `<tr><td>汇总</td>\
		<td>${officer_total}</td>\
		<td>${Sergeant_total}</td>\
		<td>${warrior_total}</td>\
		<td>${persion_total}</td>\
		<td></td>\
		<td></td>\
		<td ></td>\
		<td></td></tr>`;
		$("#detail_table tbody").append(html_join);
		// 显示table 列表
		$(".table-field").show();
		$(".btn_oper_table").hide();
	}
	_toThousands(num) {
		return (num || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
	 } 
	removeInteractions() {
		this.map.removeInteraction(State.draw);
		this.map.removeInteraction(State.snap);
	}
	removeVector(){
		this.map.removeOverlay(this.vector);
	}
	addVector(){
		if(this.vector)this.map.addOverlay(this.vector);
	}
	removeFeatureAllBySelf(){
		this.vector.getSource().clear()
	}
	getVector(){
		return this.vector;
	}
}