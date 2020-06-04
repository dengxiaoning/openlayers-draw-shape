function EventHandle(map) {
	this.map = map;
}
EventHandle.prototype = {
	createMask() {
		var popup = new ol.Overlay({
			element: document.getElementById('popup1'),
			positioning: 'bottom-center',
			stopEvent: false,
			offset: [0, -20],
			autoPan:true
		});
		return popup;
	},
	mapSingleClick(popup) {
		var me = this;
		let commStyle = new CommonStyle();
		//地图单击事件
		this.map.on('click', function(evt) {		
			var element = popup.getElement();
			var pixel = map.getEventPixel(evt.originalEvent);
			var featureObj = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
				return {
					feature: feature,
					layer: layer
				};
			});

			if (State.redraw) {
				$(element).popover('destroy');
				if (featureObj) {
					me.makePopupAndShow(featureObj.feature, popup);
				}
			}
		});
	},
	makePopupAndShow(feature, popup) {
	
		var element = popup.getElement();
		var coordinate = feature.getGeometry();
		coordinate = coordinate.A;

		let type = feature.get('type');
		let idNum = feature.getId();

		if(type && type !== 'undefined' && idNum && idNum !== 'undefined'){
			State.selectedObj = '';
			State.selectedObj = feature;
		}
		
		//鼠标移入事件 1、设置interaction 为false 2、设置标识 map事件是否注销popover
		inputmouseover = function() {
			if(State.draw)State.draw.setActive(false);
			State.redraw = false;
		}
		// 鼠标离开事件 
		inputmouseout = function() {
			if(State.draw)State.draw.setActive(true);
			State.redraw = true;
		}
		if (State.redraw) {
			$(element).popover('destroy');
		}
		if (feature && feature.getId()) {
			
			popup.setPosition(coordinate);
			let feature_name = feature.get('name')?feature.get('name'):'';
			// （table 中定位操作，【1、获取绑定的 nodeid 2、根据id 查询全局数据State.corrdinateArr_global 再将数据打印到popver】）
		let feature_nodeid = feature.getId();
		let foundItem = this.getOriginDataById(feature_nodeid);
		
			if(foundItem){
				$(element).popover({
					trigger: 'manual',
					'placement': 'top',
					'animation': false,
					'html': true,
					'content': `<div >军队分布详情<span class="pop-del glyphicon glyphicon-remove"></div>\
					<div onmouseover="inputmouseover()" onmouseout="inputmouseout()"> \
					<div><span>单位名称：</span>${foundItem.text}</div>\
					<div><span>军官：</span>${foundItem.officer}</div>\
					<div><span>士官：</span>${foundItem.Sergeant}</div>\
					<div><span>战士：</span>${foundItem.warrior}</div>\
					<div><span>装备：</span>${foundItem.arms}</div>\
					<div><span>经度：</span><span>${coordinate[0]}</span></div>\
					<div><span>纬度：</span><span>${coordinate[1]}</span></div>\
				
					</span><span class="type hidden">${type}</span><span class="idNum hidden">${idNum}</span>\
					</div>`
				});
					
				$(element).popover('show');
				State.enableFeature = null;
				State.enableFeature = feature;
			}
		}
	},
	getOriginDataById(nodeId){
		let foundData='';
		State.corrdinateArr_global.forEach((item, index) => {
			if(item.nodeId == nodeId){
				foundData = item;
				return false;
			}
		});
		return foundData
	}
}
