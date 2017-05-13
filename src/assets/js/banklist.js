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

var layer,form;

layui.use(['form','layer'], function(){
    layer = layui.layer;
    form=layui.form();
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
        bankList:[],
        authorStatus:true
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
            this.getQueueList();
            this.getBankList();
            this.getAuthorStatus();
        },
        getQueueList:function(){
            var self=this;
            this.$http.get(ajaxAddress.preFix+ajaxAddress.list.banklist)
                    .then(function(res){
                        if(res.body.code==200){
                            self.queueList=res.body.data.list;
                        }else{
                            self.queueList=[];
                        }
                    })
        },
        getAuthorStatus:function(){
            var self=this;
            this.$http.get(ajaxAddress.preFix+ajaxAddress.list.isAuthorPage)
                    .then(function(res){
                        if(res.body.code==200){
                            self.authorStatus=res.body.data==0?false:true;
                        }else{
                           self.authorStatus=true;
                            
                        }
                    })
        },
        getUserOrder:function(obj){
            obj=obj||{};
            var self=this;
            this.$http.get(ajaxAddress.preFix+ajaxAddress.userData.userOder,{params:obj})
                    .then(function(res){
                        if(res.body.code==200){

                            self.userOrderArr=res.body.data;
                            
                            // self.handleData(res.body.data);   
                        }else{
                            self.userOrderArr=[];
                        }
                    })
        },
        getOneUserQueueList:function(id){
            var obj={id:id}
            var self=this;
            this.$http.get(ajaxAddress.preFix+ajaxAddress.list.getOneUserQueue,{params:obj})
                    .then(function(res){
                        if(res.body.code==200){

                            self.userQueueList=res.body.data.data;
                            console.log(self.userQueueList);
                            // self.handleData(res.body.data);   
                        }else{
                            self.userQueueList=[];
                            
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
        getBankList:function(){
            var self=this;
            this.$http.get(ajaxAddress.preFix+ajaxAddress.list.canShowBankList)
                    .then(function(res){
                        if(res.body.code==200){

                            self.bankList=res.body.data.list.bank_list;
                            
                            // self.handleData(res.body.data);   
                        }else{
                            self.userOrderArr=[];
                        }
                    })
        },
        handleData:function(arrN){
            var self=this;
            var arr=[];
            
            arrN.forEach(function(item,index){
               
                if(item.status==1){
                    arr.push(arrN.splice(index,1));
                }

            })
            self.userOrderArr=arrN;
            
            arr[0].forEach(function(item){
                
                for(var i=0;i<item.number;i++){
                    arr.push(item);
                }
            })
            for(var i=0,j=arr;i<j.length;i++){
                j[i].number=1;
            }
            
            self.userOrderFilterArr=arr;
        },
        checkCode:function(id){
            var self=this;
            this.$http.get(ajaxAddress.preFix+ajaxAddress.goods.goodsCode,{params:{id:id}})
                    .then(function(res){
                        if(res.body.code==200){

                            self.goodsValidCode=res.body.data;
                            // self.handleData(res.body.data);   
                        }
                    })
        },
        convertScore:function(id){
            var self=this;
            var body={
                id:id
            }
            this.$http.post(ajaxAddress.preFix+ajaxAddress.order.convertScore,body)
                .then(function(res){
                    
                    if(res.body.code==200){
                        
                        layer.msg(res.body.msg);
                    }else{
                        layer.msg(res.body.msg);
                    }
        
                })
        },
        backGoods:function(id){
            
        },
        addBankList:function(){
            layer.load();
            var self=this;
            $('.bankListWrapper').html('');
            $.each(this.bankList,function(index,item){
                $('<option>').appendTo($('.bankListWrapper')).html(item).attr('value',index+1);
            })
            form.render();
                layer.open({
                    type:1,
                    title:'添加银行卡',
                    content: $('#bankFormWrapper'), //这里content是一个DOM
                    shade:[0.8,'#000'],
                    area:['600px','500px'],
                    maxmin: true,
                    end:function(){
                        layer.closeAll('loading');
                        $('#bankFormWrapper').hide();
                    }
                })


                form.on('submit(addBank)',function(formParams){
                    $.each(self.bankList,function(index,item){
                        if(index==formParams.field.card_type-1){
                            formParams.field.card_tip=item;
                        }
                    })
                    self.$http.post(ajaxAddress.preFix+ajaxAddress.list.addBanklist,formParams.field)
                        .then(function(res){
                            
                            if(res.body.code==200){
                                layer.closeAll();
                                layer.msg(res.body.message);
                                setTimeout(function(){
                                    location.reload();
                                },500);
                                
                            }else{
                                
                                layer.msg(res.body.message);
                                
                            }
                
                        })
                })

 
        } ,
        addAuthorList:function(){
            layer.load();
            var self=this;
            layer.open({
                    type:1,
                    title:'实名认证',
                    content: $('#userInfoAuthor'), //这里content是一个DOM
                    shade:[0.8,'#000'],
                    area:['600px','500px'],
                    maxmin: true,
                    end:function(){
                        layer.closeAll();
                        $('#userInfoAuthor').hide();
                    }
                })

             form.on('submit(addAuthor)',function(formParams){
                    layer.load();
                    self.$http.post(ajaxAddress.preFix+ajaxAddress.list.addAuthor,formParams.field)
                        .then(function(res){
                            
                            if(res.body.code==200){
                                layer.closeAll();
                                layer.msg(res.body.message);
                            }else{
                                layer.closeAll();
                                layer.msg(res.body.message);
                            }
                
                        })
                })
        }
    }
})
