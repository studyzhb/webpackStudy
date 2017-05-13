var $script = require("scriptjs");

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
var vm=new Vue({
	el:'#headerApp',
	data:{
		navData:[],
		cityObj:{
			id:'',
			name:''
		},
		//倒计时初始值
		timeNum:60,
		//点击切换选中与否
		isSelecterAgree:true,
		//是否隐藏第三方
		isShowOther:false,
		//是否显示错误
		isShowError:false,
		phone:'',
		loginUserName:'',
		email:"",
		isLogin:false,
		cityArr:[],
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
		laeblTArr:[],
        isShowAllSortIndex:1,
		loginIndex:'-1',
		picCode:'',
		validatorLoginUser:{
			phone:false,
			password:false,
			code:false
		},
		validatorRegisterUser:{
			phone:'',
			password:'',
			phonecode:'',
			conPassword:'',
			code:''
		},
		validatorResetUser:{
			phone:'',
			password:'',
			conPassword:'',
			phonecode:'',
			code:''
		},
		loginUser:{
			phone:'',
			password:'',
			code:''
		},
		registerUser:{
			phone:'',
			password:'',
			conPassword:'',
			phonecode:'',
			code:''
		},
		resetUser:{
			phone:'',
			password:'',
			phonecode:'',
			conPassword:'',
			code:''
		},
		//搜索 //true加载商品,false加载店铺
		searchTag:true,
		searchKeys:'',
		mainCon:'',
		username:'',
		registerMessageCode:'获取短信验证码',
		resetMessageCode:'获取短信验证码',
		isClick:true,
		resetIsClick:true
	},

	filters:{
		json2single:function(value){
			
			var str=typeof eval(value)=='object'?JSON.parse(value)[0]:'';
			return str;
		},
	},

	mounted:function() {
		
		this.$nextTick(function(){
			this.renderView();
            $script("../layer/layer.js", function() {});
		})
	},
	methods:{
		gotoPersonCenter:function(){
			if(this.isLogin){
				open('myAccount.html','_self');
			}else{
				layer.msg('请先登录');
				this.loginIndex='0'
			}
		},
		$vaSubmit:function(){
			
		},
		/**
		 * 用户登录
		 */
		userLogin:function(){
			// validator.attach('email', 'required|email'); 
			// validator.validateAll()
			// console.log(this.$validator.validateAll());
			// console.log(this.errors);
			this.isShowError=true;
			var tag=true;
            
			for(var key in this.validatorLoginUser){
				if(!this.validatorLoginUser[key]){
					tag=false;
					layer.msg('请填写完整内容');
				}
			}
			if(tag){
				var body=this.loginUser;
				body.job_num=this.loginUser.phone;
				var self=this;
                
				this.$http.post(ajaxAddress.preFix+ajaxAddress.user.login,body)
					.then(function(res){
						
						if(res.body.code==200){
							self.isLogin=true;
							self.loginIndex='-1';
							self.isShowError=false;
							self.loginUserName=res.body.data||'***';
							cookieUtil.setExpiresDate('wdusername',self.loginUserName,1/96);
							for(var key in this.loginUser){
								self.loginUser[key]='';
							}
							layer.msg(res.body.msg);
						}else{
							layer.msg(res.body.msg);
						}
			
					})
			}
			
		},
		//用户密码重置
		resetPassword:function(){
			var body=this.resetUser;
			var tag=true;
			var self=this;
			this.isShowError=true;
			for(var key in this.validatorResetUser){
				
				if(!this.validatorResetUser[key]){
					
					tag=false;
					layer.msg('请填写完整内容');
				}
			}
			if(this.resetUser.password!=this.resetUser.conPassword){
				tag=false;
				layer.msg('两次输入密码不一致');
			}
			if(tag){
				this.$http.post(ajaxAddress.preFix+ajaxAddress.user.resetLoginInfo,body)
				.then(function(res){
					if(res.body.code==200){
						self.isShowError=false;
						self.loginIndex='-1';
						layer.msg(res.body.msg);
						for(var key in this.resetUser){
								self.resetUser[key]='';
							}
					}else{
						layer.msg(res.body.msg);
					}
				})
			}
			
		},
		//用户注册
		registerUserInfo:function(){
			var self=this;
			
			var tag=true;
			this.isShowError=true;
			var body=this.registerUser;
			body.tel=this.registerUser.phone;
			body.password=hex_md5(body.password +'5f843e288bb1cabb834b9d20eea3d8c0');
			body.conPassword=hex_md5(body.conPassword + '5f843e288bb1cabb834b9d20eea3d8c0');
			body.code=body.phonecode;
			body.parame="regis";
			for(var key in this.validatorRegisterUser){
				if(!this.validatorRegisterUser[key]){
					tag=false;
					layer.msg('请填写完整内容');
				}
			}
			if(!this.isSelecterAgree){
				tag=false;
				layer.msg('只有同意注册协议才能进行注册，感谢您的支持！');
			}
			if(this.registerUser.password!=this.registerUser.conPassword){
				tag=false;
				layer.msg('两次输入密码不一致');
			}
			if(tag){
				this.$http.post(ajaxAddress.registerPreFix+ajaxAddress.user.register,body)
					.then(function(res){
						
						if(res.body.code==200){
							layer.msg('恭喜你注册成功，请登录。');
							self.isShowError=false;
							self.loginIndex='0';
							for(var key in this.registerUser){
								self.registerUser[key]='';
							}
						}else{
							layer.msg(res.body.message);
						}
					})
			}
			
		},
		closeAllAlertCon:function(){
			this.loginIndex='-1';
			for(var key in this.registerUser){
				this.registerUser[key]='';
			}
			for(var key in this.resetUser){
				this.resetUser[key]='';
			}
			for(var key in this.loginUser){
				this.loginUser[key]='';
			}
		},
		//获取短信验证码
		getMesscode:function(){
			
			var phone=this.registerUser.phone;
			var code=this.registerUser.code;

			var self=this;
			if(!phone){
				layer.msg('手机号不能为空');
				return;
			}
			if(!code){
				layer.msg('验证码不能为空');
				return;
			}
			// layer.load();
			if(this.isClick){
				this.isClick=false;
				this.$http.post(ajaxAddress.registerPreFix+ajaxAddress.user.registMessCode,{tel:phone,code:code,parame:'regis'})
					.then(function(res){
						
						if(res.body.code==200){
							layer.msg('短信验证码发送成功，请注意查收');
							self.timeOutNum('registerMessageCode');
						}else{
							layer.msg(res.body.message);
						}
						
					})
			}else{
				layer.msg('请稍后再试');
			}
			
		},
		//忘记密码,重置
		getResetMesscode:function(){
			var phone=this.resetUser.phone;
			var code=this.resetUser.code;
			var self=this;
			if(!phone){
				layer.msg('手机号不能为空');
				return;
			}
			if(!code){
				layer.msg('验证码不能为空');
				return;
			}
			// layer.load();
			if(this.resetIsClick){
				this.resetIsClick=false;
				this.$http.post(ajaxAddress.preFix+ajaxAddress.user.resetLoginCode,{phone:phone,code:code,type:'found'})
				.then(function(res){
					if(res.body.code==200){
						layer.msg('短信验证码发送成功，请注意查收');
						self.timeOutNum('resetMessageCode');
					}else{
						layer.msg(res.body.msg);
					}
					
					
				})
			}else{
				layer.msg('请稍后再试');
			}
			
		},
		timeOutNum:function(code){
			this[code]=--this.timeNum+'秒后重新发送';
			var self=this;
			
			if(this.timeNum<1){
				if(code=='resetMessageCode'){
					this.resetIsClick=true;
				}else{
					this.isClick=true;
				}
				
				this[code]='获取短信验证码';

				return;
			}
			setTimeout(function(){
				self.timeOutNum(code);
			},1000);
		},
		exit:function(){
			var self=this;
			this.$http.post(ajaxAddress.preFix+ajaxAddress.user.exit,{})
				.then(function(res){
					if(res.body.code==200){

						layer.msg(res.body.message);
						self.isLogin=false;
						cookieUtil.removeCookie('wdusername');
						open('index.html','_self');
					}else{
						layer.msg(res.body.message);
					}
				})
		},
		//搜索
		searchInfoFromData:function(){
			var url=''
			if(this.searchTag){
				url=searchGoods+this.searchTag;
			}else{
				url=searchShop+this.searchTag;
			}

			open(url+'&con='+escape(this.mainCon),'_self');
			this.isShowAllSortIndex=-1;
		},
		updatePicCode:function(){
			this.picCode=ajaxAddress.preFix+ajaxAddress.user.getPicCode+'?v='+new Date().getTime();
		},
		parseUrl:function(value,subItem){
            this.isShowAllSortIndex=1;
			var subid;
			if(subItem!==undefined){
				subid=subItem.id;
				top.location.href=goToWhere+value.id+'&cityid='+this.cityObj.id+'&name='+escape(value.name)+'&subid='+subid;
			}else{
				top.location.href=goToWhere+value.id+'&cityid='+this.cityObj.id+'&name='+escape(value.name);
			}
			
			
			
			return goToWhere+value.id+'&cityid='+this.cityObj.id+'&name='+escape(value.name);
        },
		getCityName:function(){
			
			var cName=cookieUtil.getCookie('cName');
			var cId=cookieUtil.getCookie('cId');
			if(!cId){
				//获取城市
			this.$http.get(ajaxAddress.preFix+ajaxAddress.common.getCity)
					.then(function(res){
						
							self.cityArr=res.body||[];
							res.body.forEach(function(item){
								if(item.status==true){
									cookieUtil.setExpiresDate('cName',item.name,1/96);
									cookieUtil.setExpiresDate('cId',item.id,1/96);
									self.cityObj=item;
								}
							})
							
						
					})
			}else{
				this.cityObj={
					id:cId,
					name:cName
				}
			}
		},
		getUserInfo:function(){
			var userName=cookieUtil.getCookie('wdusername');
			if(userName){
				this.isLogin=true;
				this.loginUserName=userName;
			}else{
				this.isLogin=false;
			}
		},
		renderView:function(){
			
			var self=this;
			this.isShowAllSortIndex=location.href.indexOf('index.html')>-1||location.href.indexOf('.html')==-1?0:1;
			this.picCode=ajaxAddress.preFix+ajaxAddress.user.getPicCode;
			this.getUserInfo();	
			
		},
		agreeHtml:function(){
			layer.open({
				title:'万店联盟注册协议',
				type: 2,
    			content:'http://enclosure.wandlm.net/Other/Serviceagreement.html',  //注意，如果str是object，那么需要字符拼接。
				area:['520px','400px']	
			})
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
			this.$http.get(ajaxAddress.preFix+ajaxAddress.updataContent.hotContent+'?navid='+navObj.id)
				.then(function(res){
					// console.log(res.body.data);
					//navNameArr

					// res.body.data.forEeach(function(item){
					// 	item.
					// });
					if(res.body.data){
						navObj.typeShop=res.body.data||[];
					}
					
					
					
				})
		//获得推荐/热门商品方法
		 this.$http.get(ajaxAddress.preFix+ajaxAddress.updataContent.goods+'?navid='+navObj.id)
				.then(function(res){
					// console.log(res.body.data);
					var arr  = res.body.data instanceof Array? res.body.data.splice(9):[];
					navObj.typeGoods   = res.body.data;
					navObj.typeGoodsAd = arr;
					
					
				})
			// this.$http.get(ajaxAddress.preFix+ajaxAddress.updataCon+'?navid='+navObj.id)
			// .then(function(res){
			// 	// console.log(res.body.data);
			// 	navObj.benefit=res.body.data;
			// 	console.log(navObj.typeGoods);
				
			// })
		
		

		},
		
		getLabelInfo:function(str,lField){
			
			
			var arr=str?str.split(','):[];
			
			var nArr=[];
			var self=this;
			//{id, type,field}
			this.labelArr.forEach(function(item){
				arr.forEach(function(its){
					if(its==item.id){
						if(LabelField[lField]==item.field){
							nArr.push(item);
						}
					}
				})
				
			})
			
			return nArr;
		},
		gotoAuthorMoney:function(){
            var self=this;
			this.$http.get(ajaxAddress.isHasBand)
				.then(function(res){
					
					if(res.body.code==200){
						if(res.body.data=='1'){
							layer.msg('已经认证，可以购买了.')
						}else if(res.body.data=='0'){
							layer.msg('认证审核中....请耐心等待')
						}
						else{
							self.loginIndex=5;
						}
						
					}else{
						cookieUtil.removeCookie('wdusername');
						layer.msg('请先登录');
					}
					
					
				});
		},
		active:function(){
			var self=this;
			this.timer=setInterval(function () {
				go();
			},2000)
			function go(){
				self.index++;
				if(self.index > $('.notice-pic>li').size()-1){
					self.index = 0;
				}
				$('.notice-pic').stop(true,true).animate({
				'left':-$('.notice-pic>li').width()*self.index
				},300);
			};
		},
		updateNav:function(id){
			this.navid=id;
		}

	}

});






