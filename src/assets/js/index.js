require('./header.js');
require('../scss/index.scss');

import Vue from 'vue/dist/vue.common.js'
import VueResource from 'vue-resource/dist/vue-resource.common.js';

import ajaxAddress from './ajaxAddress.js'
Vue.use(VueResource);
import {cookieUtil,paraObj} from './config.js'

Vue.http.options.emulateJSON = true;
Vue.http.options.emulateHTTP = true;
Vue.http.options.xhr = { withCredentials: true }
Vue.http.interceptors.push(function(request, next){
	request.credentials = true;
	// request.headers.set('Content-Type','application/x-www-form-urlencoded');
	next()
})


new Vue({
	el:'#app',
	data:{
		navData:[],
		banImgData:[],
		mainData:[],
		navIdArr:[],
		navNameArr:[],
		bannerData:[],
		labelArr:[],//标签数组 【 ID=》 name】
		timer:"",
		index:"",
		navid:'',
		navtype:'',
		cityId:'0',
		labelFArr:[],
		laeblSArr:[],
		laeblTArr:[]
	},
	filters:{
		json2single:function(value,tag){
			
			var str=typeof eval(value)=='object'?JSON.parse(value)[0]:'';
			if(tag==1){
				str+='?x-oss-process=image/resize,m_fill,w_270,h_164,limit_0/auto-orient,0/sharpen,100/quality,q_90';
			}else if(tag==2){
				str+='?x-oss-process=image/resize,m_fill,w_240,h_170,limit_0/auto-orient,0/sharpen,100/quality,q_90';
			}else if(tag==3){
				str+='?x-oss-process=image/resize,m_fill,w_390,h_274,limit_0/auto-orient,0/sharpen,100/quality,q_90';
			}
			return str;
		}
		
		
	},
	mounted:function() {
		
		this.$nextTick(function(){
			this.renderView();
		})
	}, 
	methods:{
		//banner图跳转
		advertisement:function(item){
			open(item.slide_info,'_self');
		},
		discountNum:function(value){
			value=value+'';
			var str=value;
			if(value.length>1){
				str=value.replace(value.charAt(0),value.charAt(0)+'.');
			}
			return '全场'+str+'折优惠';
		},
		renderView:function(){
			
			var self=this;
			this.$http.get(ajaxAddress.preFix+ajaxAddress.list.queuelist)
				.then(function(res){
					
					if(res.body.code==200){
						self.navData=res.body.data;
						self.navData.forEach(function(data){
							self.navIdArr.push({id:data.id,typeGoods:[],nav_name:data.name,money:data.money,packid:data.pack_id,total_amount:data.total_amount});
						})			
						self.navIdArr.forEach(function(item) {
							self.navfun(item);
						});
					}else{
						cookieUtil.removeCookie('wdusername');
						layer.msg('请先登录');
					}
					
					
				});

			
		},
		setNameShop:function(value){

			var str = value + shopRecomendName;
			
			
				return str;
			
		},
		setNameGoods:function(value){

			var str = value + goodsRecomendName;
			
			
				return str;
			
		},
		//获得推荐/热门店铺方法
		navfun:function(navObj){

		//获得推荐/热门商品方法
		 this.$http.get(ajaxAddress.preFix+ajaxAddress.list.getGoodsInfo+'?id='+navObj.packid)
				.then(function(res){
					if(res.body.code==200){
						navObj.typeGoods= res.body.data;
						
					}else{
						layer.msg(res.body.msg);
					}		
				})
		
		

		},
		
		getLabelInfo:function(str,lField){
			
			
			var arr=str?str.split(','):[];
			
			var nArr=[];
			var self=this;
			
			//{id, type,field}
			this.labelArr.forEach(function(item){
				arr.forEach(function(its){
					if(its==item.id){
						// console.log(LabelField[lField]);
						// console.log(item.field);
						if(LabelField[lField]==item.field){
							nArr.push(item);
						}
					}
				})
				
			})
			// console.log(nArr);
			return nArr;
		},
		active:function(){
			var self=this;
			var len=$(".notice-pic>li").size();
			
			$(".notice-pic").width(len*$('.notice-pic>li').width());
			clearInterval(this.timer);
			this.timer=setInterval(function () {
				self.index==len/2?self.index=0:self.index++;
                self.index==0?$('.notice-pic').css({left:0}):'';
				go();
			},2000)
			function go(){
				// self.index++;
				// if(self.index > $('.notice-pic>li').size()-1){
				// 	self.index = 0;
				// }
				$('.notice-pic').animate({
				'left':-$('.notice-pic>li').width()*self.index+'px'
				},1000);
			};
		},
		updateNav:function(id){
			this.navid=id;
		},
		gotoShopDetail:function(id,name){
			open(shopDetailUrl+id+'&name='+escape(name),'_self');
		},
		goToGoodsDetail:function(id,name){
			open('../html/order.html?id='+id,'_self');
		},
		gotoDiscount:function(id,name){

			open(discountInfo+id+'&name='+escape(name),'_self');
		},

	}
})

