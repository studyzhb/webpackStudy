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
    el:'#leftApp',
    data:{

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
            this.gotoAuthorMoney();
        },
        gotoAuthorMoney:function(){
            var self=this;
			this.$http.get(ajaxAddress.isHasBand)
				.then(function(res){
					
					if(res.body.code==200){
						
						
					}else{
						cookieUtil.removeCookie('wdusername');
						layer.msg('请先登录');
                        setTimeout(function(){
                            open('index.html',"_self");
                        },1000);
					}
					
					
				});
		}

 


    }
})



