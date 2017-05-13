/**
 * cookie
 */
var cookieUtil={
    //天数
    setCookie:function(user,name){
        document.cookie=user+"="+name;
    },
    setExpiresDate:function(user,name,value){
        var da=new Date();
        var expiresDay=da.getDate()+value;
        da.setDate(expiresDay);
        document.cookie=user+"="+name+";expires="+da+";path=/";
    },
    getCookie:function(name) {
        if(document.cookie.length>0){
            var start=document.cookie.indexOf(name+"=");
            if(start!=-1){
                start=document.cookie.indexOf(name+"=")+name.length+1;
            }else{
                return '';
            }
            var end=document.cookie.indexOf(';',start)!=-1?document.cookie.indexOf(';',start):document.cookie.length;
            return document.cookie.substring(start,end);
        }
        return "";
    },
    removeCookie:function(name){
        this.setExpiresDate(name,1,-1);
    }
};
//获取地址栏参数数据
var paraObj=function() {
    'use strict';
     var paraData=location.href.split('?')||[];
        var readyData=paraData[1]?paraData[1]:'';
        var arrData=readyData.split('&')||[];

        var obj={};

        for(var i=0,j=arrData.length;i<j;i++){
            var arr=arrData[i].split('=')||[];
            obj[arr[0]]=arr[1];
        }

        return obj;
}();
