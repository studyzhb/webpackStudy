require('../scss/order.scss');
require('./header.js');
import Vue from 'vue/dist/vue.common.js';
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
        selected:'',
        goodsDetai:{},
        goodsId:'',
        addressArr:[],
        goodsInfo:{
            total:'1',
        },
        obligationObj:{},
        checkType:1,
    },
    methods:{
        renderView:function(){
            this.goodsId=paraObj.id;
            this.isHasBand();  
            // this.getGoodsInfo();
            // this.getAddressInfo();
            // this.getObligationId();
        },
        getGoodsInfo:function(){

            var self=this;
			this.$http.get(ajaxAddress.preFix+ajaxAddress.list.queuelist)
				.then(function(res){
					if(res.body.code==200){
                        
						res.body.data.forEach(function(item){
                            if(item.id==self.goodsId){
                                self.goodsDetai=item;
                            }
                        })
					}
				});

        },
        getAddressInfo:function(){
            var self=this;
			this.$http.get(ajaxAddress.preFix+ajaxAddress.list.getAddress)
				.then(function(res){
					if(res.body.code==200){
                        
						self.addressArr=res.body.data;
					}else{
                        layer.msg('获取不到地址信息,请先登录');
                        setTimeout(function(){
                            open('index.html','_self');
                        },1000);
                    }
					
					
				});
        },
        getObligationId:function(){
           var self=this;
            this.$http.get(ajaxAddress.preFix+ajaxAddress.list.oblitaionList+"?status=1")
                    .then(function(res){
                        if(res.body.code==200){
                            self.obligationObj=res.body.data[0];
                            
                        }else{
                            self.obligationObj={};
                        }
                    })
        },
        createOrder:function(){
            var body={};
            var self=this;
            layer.load();
            this.isHasBand();  
        },
        isHasBand:function(){
            var self=this;
            var body={};
			this.$http.get(ajaxAddress.isHasBand)
				.then(function(res){
					if(res.body.code==200){
                        if(res.body.data=='1'){
                            // if(this.selected){
                            //     this.addressArr.forEach(function(item){
                            //         if(item.id==self.selected){
                            //             body.username=item.sname;
                            //             body.phone=item.tel;
                            //             body.queue=self.goodsId;
                            //             body.delivery_point=3;
                            //             body.debt_nexus_id=self.obligationObj.id;
                            //             body.desc='121313';
                            //             self.$http.post(ajaxAddress.preFix+ajaxAddress.order.commitOrder,body)
                            //                     .then(function(res){
                            //                         if(res.body.code==200){
                                                        
                            //                         var orderId=res.body.data.order_id;
                                                    
                            //                         self.getPayHtml(orderId);

                            //                         }else if(res.body.code==302){
                            //                             cookieUtil.removeCookie('wdusername');
                            //                             layer.msg(res.body.message);
                            //                         }else{
                            //                             layer.msg(res.body.message);
                            //                         }
                            //                     })
                            //             return false;
                            //         }
                            //     })
                            // }else{
                            //     layer.msg('请选择地址');
                            //     layer.closeAll('loading');
                            //     return;
                            // }


                        }else if(res.body.data=='0'){
                            layer.msg('认证审核中，请耐心等待');
                        }
                        else{
                            open('approve.html','_self');
                        }
					}else{
                        
                        setTimeout(function(){
                            open('index.html','_self');
                        },1000);
                    }
			
				});
        },
        gotoPay:function(){
            layer.load();
            var num=paraObj.order_id;
            var self=this;
            
            if(this.checkType==1){
                layer.prompt({
                formType: 0,
                placeholder: '请输入支付密码',
                title: '支付密码',
                area: ['400px', '40px'] //自定义文本域宽高
                },function(value, index, elem){
                    
                    layer.close(index);
                     self.getBalancePay(num,value);
                });
               
            }else if(this.checkType==2){

                this.getPayHtml(num);
            }else{
                layer.msg('暂不支持此种支付方式');
            }
        },
        getPayHtml:function(num){
            var self=this;
            open(ajaxAddress.payHtml+'?id='+num,'_self');
        },
        getBalancePay:function(num,value){
            var body={
                order_id:num,
                password:value
            }
            this.$http.post(ajaxAddress.preFix+ajaxAddress.order.balancePay,body)
                .then(function(res){
                    if(res.body.code==200){
                        layer.msg('支付成功');
                        open('index.html','_self');
                    }else{
                        layer.msg(res.body.message)
                        layer.closeAll('loading');
                    }
                })
        },  
        changeMoney:function(item,way){
            if(way>0){
				item.total++;
			}else{
				item.total--;
				if(item.total<1){
					item.total=1;
				}
			}
        }
    },
    filters:{
		json2single:function(value){
			
			var str=typeof eval(value)=='object'?JSON.parse(value)[0]:'';
			
			return str;
		}
		
	},
    mounted:function() {
		
		this.$nextTick(function(){
			this.renderView();
		})

	},
})