require('../scss/myAccount.scss');

require('./header.js');
require('./personCenter.js');

import Vue from 'vue/dist/vue.common.js'
import VueResource from 'vue-resource/dist/vue-resource.common.js';
// import './vue-resource.min.js'
import ajaxAddress from './ajaxAddress.js'
Vue.use(VueResource);
import {cookieUtil,paraObj} from './config.js'
// $script("//libs.baidu.com/jquery/2.1.1/jquery.min.js", function() {});

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
        queueList:[],
        userQueueList:[],
        userOrderArr:[],
        user:'',
        tabIndex:'0',
        userOrderFilterArr:[],
        goodsValidCode:'',
        userBankList:[],
        currentPage:1,
        //总页数
		pageCount:1,
        showItem:5,
		//每页个数
		pageSize:6
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
    computed:{
        pages:function(){
            var pag = [];
            if( this.currentPage < this.showItem ){ //如果当前的激活的项 小于要显示的条数
                //总页数和要显示的条数那个大就显示多少条
                var i = Math.min(this.showItem,this.pageCount);
                
                while(i){
                    pag.unshift(i--);
                }
            }else{ //当前页数大于显示页数了
                var middle = this.currentPage - Math.floor(this.showItem / 2 ),//从哪里开始
                    i = this.showItem;
                if( middle >  (this.pageCount - this.showItem)  ){
                    middle = (this.pageCount - this.showItem) + 1
                }
                while(i--){
                    pag.push( middle++ );
                }
            }
            
            return pag
        }
    },
    methods:{
        renderView:function(){
            var self=this;
            this.getUserAccountList();
            this.getQueueList();
            this.getUserBankList();
            this.getUserInfo();
        },
        //债权金转余额
        obligation2Balance:function(){
            var self=this;
            layui.use(['form','layer'], function(){
                var layer = layui.layer;
                layer.confirm('确认执行此操作？',function(index){
                    layer.close(index);
                    self.$http.post(ajaxAddress.preFix+ajaxAddress.order.obligation2balance)
                        .then(function(res){
                            if(res.body.code==200){
                                layer.msg('操作成功');
                                location.reload();
                            }else{
                                layer.msg(res.body.message);
                            }
                        })
                })
            })

        },
        pageClick:function(n){
			this.currentPage=n;
			var obj={};
			obj.page=n;
			this.getQueueList(obj);
		},
        prePage:function(){
			this.currentPage--;
			this.pageClick(this.currentPage);
		},
		nextPage:function(){
			this.currentPage++;
			this.pageClick(this.currentPage);
		},
        getUserBankList:function(){
            var self=this;
            this.$http.get(ajaxAddress.preFix+ajaxAddress.list.banklist)
                    .then(function(res){
                        if(res.body.code==200){
                            self.userBankList=res.body.data.list;
                        }else{
                            self.userBankList=[];
                        }
                    })
        },
        getQueueList:function(obj){
            var self=this;
            this.$http.get(ajaxAddress.preFix+ajaxAddress.userData.userAccount,{params:obj||{}})
                    .then(function(res){
                        
                        if(res.body.code==200){

                            self.queueList=res.body.data.list.balance_list;
                            self.pageCount=Math.ceil(res.body.data.list.total/res.body.data.list.per_page)||1;
                            self.pageSize=res.body.data.list.per_page;
                            // self.handleData(res.body.data);   
                        }else{
                            self.queueList=[];
                        }
                    })
        },
        getUserAccountList:function(obj){
            obj=obj||{};
            var self=this;
            this.$http.get(ajaxAddress.preFix+ajaxAddress.userData.userBalance,{params:obj})
                    .then(function(res){
                        if(res.body.code==200){

                            self.userOrderArr=res.body.data.list;
                            
                            // self.handleData(res.body.data);   
                        }else{
                            self.userOrderArr={};
                        }
                    })
        },
        getUser:function(){
            var self=this;
            this.$http.get(ajaxAddress.preFix+ajaxAddress.userData.user)
                    .then(function(res){
                        if(res.body.code==200){
                            self.user=res.body.data||{};
                        }else{
                            self.user={};
                        }
                        
                    })
        },
        showOrderList:function(index){
            this.tabIndex=index;
            this.getOneUserQueueList(index);
        },
        //展示付完款中的已消费与未消费
        showConsume:function(index,staIndex){
            this.tabIndex=index;
            var self=this;
            this.$http.get(ajaxAddress.preFix+ajaxAddress.userData.userConsume,{params:{status:staIndex}})
                    .then(function(res){
                        if(res.body.code==200){

                            self.userOrderArr=res.body.data;
                            // self.handleData(res.body.data);   
                        }else{
                            self.userOrderArr=[];
                        }
                    })
        },
        outputMoney:function(obj){
            
            var self=this;
            
            layui.use(['form','layer'], function(){
                var layer = layui.layer;
                var form=layui.form();
                
                if(self.userBankList.length==0){
                    layer.msg('请先添加银行卡');
                    setTimeout(function(){
                        open('banklist.html','_self');
                    },3000);
                    return;
                }

                $('.bankListWrapper').html('');
                
                $.each(self.userBankList,function(index,item){
                    if(index==0){
                         $('<option selected>').appendTo($('.bankListWrapper')).html(item.card_num).attr('value',item.id);
                    }else{
                         $('<option>').appendTo($('.bankListWrapper')).html(item.card_num).attr('value',item.id);
                    }
                   
                })
                form.render();
                layer.open({
                    type:1,
                    title:'提示：如果没有设置支付密码，支付密码与登录密码或手机号后六位相同',
                    content: $('#bankFormWrapper'), //这里content是一个DOM
                    shade:[0.8,'#000'],
                    area:['600px','500px'],
                    maxmin: true,
                    end:function(){
                        $('#bankFormWrapper').hide();
                    }
                })


                form.on('submit(addBank)',function(formParams){
                    layer.load();
                    self.$http.post(ajaxAddress.preFix+ajaxAddress.userData.outputMoney,formParams.field)
                        .then(function(res){
                            layer.closeAll();
                            if(res.body.code==200){
                                
                                layer.msg(res.body.message);
                                // location.reload();
                            }else{
                                layer.msg(res.body.message);
                            }
                
                        })
                })

            });
        },
        //获取用户信息
        getUserInfo:function(){
            var self=this;
            this.$http.get(ajaxAddress.preFix+ajaxAddress.user.userInfo)
                    .then(function(res){
                        if(res.body.code==200){
                            self.userObj=res.body.message;
                            // self.resetUser.phone=self.userObj.tel;
                        }
                    })
        },
        rechargeMoney:function(){
            var self=this;
            layui.use(['form','layer'], function(){
                var layer = layui.layer;
                var form=layui.form();
                layer.msg('因系统升级，需要2-3个工作日，如需充值、购买请线下进行。')
                /** 
                layer.prompt({
                    formType: 0,
                    placeHolder:'请输入充值金额',
                    title: '请输入充值金额',
                }, function(value, index, elem){
                    layer.load();
                    layer.close(index);
                    top.location.href=ajaxAddress.preFix+ajaxAddress.rechargePayMoney+'?uid='+self.userObj.user_id+'&money='+value.trim();
                    // open(ajaxAddress.preFix+ajaxAddress.rechargePayMoney+'?uid='+self.userObj.id+'&money='+value.trim(),"_self");
                    // self.$http.post(ajaxAddress.preFix+ajaxAddress.rechargePayMoney,{uid:self.userObj.id,money:value.trim()})
                    // .then(function(res){
                    //     if(res.body.code==200){
                    //        layer.msg();
                    //     }else{
                    //         layer.msg();
                    //     }
                    // })

                });*/


            });
        }
    }
})