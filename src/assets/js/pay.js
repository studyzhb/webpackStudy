require('../scss/order.scss');
require('./header.js');

import Vue from 'vue/dist/vue.common.js';
import VueResource from 'vue-resource/dist/vue-resource.common.js';
import _ from 'lodash';
import ajaxAddress from './ajaxAddress.js'
Vue.use(VueResource);
import { cookieUtil, paraObj } from './config.js'

Vue.http.options.emulateJSON = true;
Vue.http.options.emulateHTTP = true;
Vue.http.options.xhr = { withCredentials: true }
Vue.http.interceptors.push(function (request, next) {
    request.credentials = true;
    // request.headers.set('Content-Type','application/x-www-form-urlencoded');
    next()
})

new Vue({
    el: '#app',
    data: {
        selected: '',
        goodsDetai: {},
        goodsId: '',
        addressArr: [],
        goodsInfo: {
            total: '1',
        },
        obligationObj: {},
        checkType: 1,
    },
    methods: {
        renderView: function () {
            this.goodsId = paraObj.id;
            this.isHasBand();
            this.getGoodsInfo();
            // this.getAddressInfo();
            // this.getObligationId();
        },
        //获取商品包信息
        getGoodsInfo: function () {

            var self = this;
            this.$http.get(ajaxAddress.preFix + ajaxAddress.list.queuelist)
                .then(function (res) {
                    if (res.body.code == 200) {

                        res.body.data.forEach(function (item) {
                            if (item.id == self.goodsId) {
                                self.goodsDetai = item;
                            }
                        })
                    }
                });

        },
        getAddressInfo: function () {
            var self = this;
            this.$http.get(ajaxAddress.preFix + ajaxAddress.list.getAddress)
                .then(function (res) {
                    if (res.body.code == 200) {

                        self.addressArr = res.body.data;
                    } else {
                        layer.msg('获取不到地址信息,请先登录');
                        setTimeout(function () {
                            open('index.html', '_self');
                        }, 1000);
                    }


                });
        },
        getObligationId: function () {
            var self = this;
            this.$http.get(ajaxAddress.preFix + ajaxAddress.list.oblitaionList + "?status=1")
                .then(function (res) {
                    if (res.body.code == 200) {
                        self.obligationObj = res.body.data[0];

                    } else {
                        self.obligationObj = {};
                    }
                })
        },
        createOrder: function () {
            var body = {};
            var self = this;
            layer.load();
            this.isHasBand();
        },
        isHasBand: function () {
            var self = this;
            var body = {};
            this.$http.get(ajaxAddress.isHasBand)
                .then(function (res) {
                    if (res.body.code == 200) {
                        if (res.body.data == '1') {
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


                        } else if (res.body.data == '0') {
                            layer.msg('认证审核中，请耐心等待');
                        }
                        else {
                            layer.msg('请先认证');
                            setTimeout(function () {
                                open('index.html', '_self');
                            }, 1000);

                        }
                    } else {

                        setTimeout(function () {
                            open('index.html', '_self');
                        }, 1000);
                    }

                });
        },
        gotoPay: function () {
            // layer.load();
            var num = paraObj.order_id;
            var orderObjArr = paraObj.orrandomsum ? paraObj.orrandomsum.split('zhbwdlm') : [];
            var self = this;

            if (this.checkType == 1) {
                layer.prompt({
                    formType: 0,
                    placeholder: '请输入支付密码',
                    title: '支付密码',
                    area: ['400px', '40px'] //自定义文本域宽高
                }, function (value, index, elem) {

                    layer.close(index);
                    self.getBalancePay(num, value);
                }, function () {
                    layer.closeAll();
                });

            } else if (this.checkType == 2) {

                this.getPayHtml(num);
                // layer.msg('因系统升级，需要2-3个工作日，如需充值、购买请线下进行。')
            } else if (this.checkType == 3) {
                this.getSimplePayHtml(orderObjArr);
            } else if (this.checkType == 4) {
                this.getSDPayHtml(orderObjArr);
            }
            else {
                layer.msg('暂不支持此种支付方式');
            }
        },
        //杉德快捷支付
        getSDPayHtml:function(orderObjArr){
            console.log(orderObjArr);
            if (orderObjArr.length <= 1) {
                layer.msg('支付失败')
                return;
            }
            var self = this;
            var readyTo2 = orderObjArr[1] - 0;
            readyTo2 = readyTo2.toFixed(2);
            var body = {
                orderCode: orderObjArr[0],
                totalAmount: readyTo2,
                //type: 3,//快捷支付类型，1为余额支付，2为支付宝支付
                // msg: '快捷支付',
                subject: '消费返利模式：' + self.goodsDetai.name,
                // goodsname: self.goodsDetai.name,
                //异步
                notifyUrl:location.origin+'/public/bondpc/pay/sandNotify',
                //同步
                frontUrl:location.origin+'/public/bondpc/pay/sandReturn',
                body: self.goodsDetai.name + self.goodsDetai.total_amount
            }

            // open(ajaxAddress.simpleSDPayInterceptor + '?orderCode=' + orderObjArr[0] + '&totalAmount=' + readyTo2 + '&type=3&msg=快捷支付&ordertitle=消费返利模式：' + self.goodsDetai.name + '&goodsname=' + self.goodsDetai.name + '&goodsdetail=' + self.goodsDetai.name + self.goodsDetai.total_amount, 'blank');
            open(ajaxAddress.simpleSDPayInterceptor + '?orderCode=' + orderObjArr[0] + '&totalAmount=' + readyTo2 , 'blank');

        },
        //快捷支付
        getSimplePayHtml: function (orderObjArr) {
            if (orderObjArr.length <= 1) {
                layer.msg('支付失败')
                return;
            }
            var self = this;
            console.log(orderObjArr[1])
            console.log(typeof orderObjArr[1])
            var readyTo2 = orderObjArr[1] - 0;
            console.log(readyTo2)
            console.log(typeof readyTo2)
            readyTo2 = readyTo2.toFixed(2);
            var body = {
                orderidinf: orderObjArr[0],
                totalPrice: readyTo2,
                type: 3,//快捷支付类型，1为余额支付，2为支付宝支付
                msg: '快捷支付',
                ordertitle: '消费返利模式：' + self.goodsDetai.name,
                goodsname: self.goodsDetai.name,
                goodsdetail: self.goodsDetai.name + self.goodsDetai.total_amount
            }

            open(ajaxAddress.simplePayInterceptor + '?orderidinf=' + orderObjArr[0] + '&totalPrice=' + readyTo2 + '&type=3&msg=快捷支付&ordertitle=消费返利模式：' + self.goodsDetai.name + '&goodsname=' + self.goodsDetai.name + '&goodsdetail=' + self.goodsDetai.name + self.goodsDetai.total_amount, 'blank');

            // this.$http.post(ajaxAddress.simplePayInterceptor,body)
            //     .then(function(res){
            //         console.log(res.body.code==200)
            //         console.log(res.body.code)
            //         if(res.body.code==200){
            //             var payObj=res.body.data;
            //             var titleObj={}
            //             console.log(self.goodsDetai)
            //             // self.goodsDetai.name+ 
            //             titleObj.ordertitle='消费返利模式';
            //             titleObj.goodsname='消费商品包';
            //             titleObj.goodsDetail='消费返利模式 商品名称价格：';

            //             _.assign(payObj,body,titleObj);
            //             // self.gotoOtherPayKind(payObj);
            //         }else{

            //         }
            //     })
        },
        //第三方支付
        gotoOtherPayKind: function (obj) {
            console.log(obj)
            var reqUrl = obj.url;
            var timeStr = new Date().getTime() + '';
            console.log(timeStr)
            obj.posttime += timeStr.substr(-3, 3);
            console.log(obj.posttime);
            delete obj.msg;
            delete obj.url;
            delete obj.type;
            obj.returnUrl = "https://www.baidu.com";
            this.post(reqUrl, obj);
            // this.$http.post(reqUrl,obj)
            //     .then(function(res){
            //         if(res.body.code==200){


            //         }else{

            //         }
            //     })
        },
        post: function (URL, PARAMS) {
            var temp = document.createElement("form");
            temp.action = URL;
            temp.method = "post";
            temp.style.display = "none";
            for (var x in PARAMS) {
                var opt = document.createElement("textarea");
                opt.name = x;
                opt.value = PARAMS[x];
                // alert(opt.name)        
                temp.appendChild(opt);
            }
            document.body.appendChild(temp);
            temp.submit();
            return temp;
        },

        getPayHtml: function (num) {
            var self = this;
            open(ajaxAddress.payHtml + '?id=' + num, '_self');
        },
        getBalancePay: function (num, value) {
            layer.load();
            var body = {
                order_id: num,
                password: value,
                type: 1,
                msg: '余额支付'
            }
            this.$http.post(ajaxAddress.preFix + ajaxAddress.order.balancePay, body)
                .then(function (res) {
                    if (res.body.code == 200) {
                        layer.msg('支付成功');
                        setTimeout(function () {
                            open('personCenter.html', '_self');
                        }, 3000);

                    } else {
                        layer.msg(res.body.message);
                        layer.closeAll('loading');
                    }
                })
        },
        changeMoney: function (item, way) {
            if (way > 0) {
                item.total++;
            } else {
                item.total--;
                if (item.total < 1) {
                    item.total = 1;
                }
            }
        }
    },
    filters: {
        json2single: function (value) {

            var str = typeof eval(value) == 'object' ? JSON.parse(value)[0] : '';

            return str;
        }

    },
    mounted: function () {

        this.$nextTick(function () {
            this.renderView();
        })

    },
})