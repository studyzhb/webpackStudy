require('../scss/order.scss');
require('./header.js');

import Vue from 'vue/dist/vue.common.js';
import VueResource from 'vue-resource/dist/vue-resource.common.js';
import _ from 'lodash';
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
    mounted:function() {
		
		this.$nextTick(function(){
			this.renderView();
		})

	},
    methods:{
        renderView:function(){
            console.log(paraObj.data)
            console.log(unescape(paraObj.data))
            var body=JSON.parse(unescape(paraObj.data));
            console.log(body);
            this.$http.post(ajaxAddress.simplePayInterceptor,body)
                .then(function(res){
                    
                    if(res.body.code==200){
                        var payObj=res.body.data;
                        var titleObj={}
                        alert(JSON.stringify(res.body.data));
                        console.log(self.goodsDetai)
                        // self.goodsDetai.name+ 
                        titleObj.ordertitle='消费返利模式';
                        titleObj.goodsname='消费商品包';
                        titleObj.goodsDetail='消费返利模式 商品名称价格：';
                        
                        _.assign(payObj,body,titleObj);
                        // self.gotoOtherPayKind(payObj);
                    }else{
                        
                    }
                })
        }
    }

})