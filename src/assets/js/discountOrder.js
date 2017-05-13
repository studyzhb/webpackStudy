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
        goodsValidCode:''
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
        },
        getQueueList:function(){
            var self=this;
            this.$http.get(ajaxAddress.preFix+ajaxAddress.list.queuelist)
                    .then(function(res){
                        if(res.body.code==200){

                            self.queueList=res.body.data;
                            self.tabIndex=self.queueList[0].id;
                            self.getOneUserQueueList(self.queueList[0].id);
                            // self.handleData(res.body.data);   
                        }else{
                            self.queueList=[];
                            
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
                console.log(item);
                for(var i=0;i<item.number;i++){
                    arr.push(item);
                }
            })
            for(var i=0,j=arr;i<j.length;i++){
                j[i].number=1;
            }
            console.log(arr);
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
                        self.getQueueList();
                        layer.msg(res.body.msg);
                    }else{
                        layer.msg(res.body.msg);
                    }
        
                })
        },
        backGoods:function(id){
            var self=this;
            var body={
                order_id:id
            }
            this.$http.post(ajaxAddress.preFix+ajaxAddress.order.backGoods,body)
                .then(function(res){
                    
                    if(res.body.code==200){
                        self.getQueueList();
                        layer.msg(res.body.msg);
                    }else{
                        layer.msg(res.body.msg);
                    }
        
                })
        }
    }
})