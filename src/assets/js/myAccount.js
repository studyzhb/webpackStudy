require('../scss/myAccount.scss');
require('../scss/personCenter.scss');
require('./header.js');
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
        userBankList:[]
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
        getQueueList:function(){
            var self=this;
            this.$http.get(ajaxAddress.preFix+ajaxAddress.userData.userAccount)
                    .then(function(res){
                        
                        if(res.body.code==200){

                            self.queueList=res.body.data.list.balance_list;
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
                    title:'余额提现,提示：如果没有设置支付密码，支付密码与登录密码相同或手机号后六位',
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

                layer.prompt({
                    formType: 0,
                    value: '0',
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

                });


            });
        }
    }
})