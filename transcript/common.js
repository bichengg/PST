"use strict";var app=angular.module("app",["ui.router"]);app.config(["$httpProvider",function(e){e.defaults.transformRequest=function(e){var t=[];for(var r in e)t.push(encodeURIComponent(r)+"="+encodeURIComponent(e[r]));return t.join("&")},e.defaults.headers.post={"Content-Type":"application/x-www-form-urlencoded"}}]).filter("trans2sex",function(){return function(e){return 1==e?"男":2==e?"女":void 0}}).filter("trans2nation",function(){return function(e){return 1==e?"汉族":"其他"}}).filter("trans2score",function(){return function(a,grade_num,sex,test){41==grade_num||42==grade_num?grade_num=4142:43!=grade_num&&44!=grade_num||(grade_num=4344);var arr=eval("trans_"+grade_num+"_"+sex+"_"+test),res=0;a=parseFloat(a);for(var i=0;i<arr.length-1;i++)a>=arr[i].a&&a<arr[i+1].a?res=arr[i].b:a>=arr[i+1].a&&(res=arr[i+1].b);return res}}).filter("transBMI2score",function(){return function(e,t){return 1==t?e>17.9&&e<=23.9?100:e<=17.8?80:e>24&&e<=27.9?80:e>=28?60:0:e>17.2&&e<=23.9?100:e<=17.1?80:e>24&&e<=27.9?80:e>=28?60:0}}).filter("transBMI2level",function(){return function(e,t){return 1==t?e>17.9&&e<=23.9?"正常":e<=17.8?"低体重":e>24&&e<=27.9?"超重":e>=28?"肥胖":"无":e>17.2&&e<=23.9?"正常":e<=17.1?"低体重":e>24&&e<=27.9?"超重":e>=28?"肥胖":"无"}}).filter("trans2level",function(){return function(e){var t="";return e<=10?t="未测试":e>10&&e<=59?t="不及格":e>59&&e<=79?t="及格":e>79&&e<=89?t="良好":e>89&&(t="优秀"),t}}).filter("trans2exPoint",function(){return function(e,t){var r=0;return e>100&&(r=(e-100)*t),r}}).filter("transScore2not100",function(){return function(e){return e>=100?100:e}}).run(["$rootScope","$state","$stateParams",function(e,t,r){e.$state=t,e.$stateParams=r}]).config(["$stateProvider","$urlRouterProvider",function(e,t){t.otherwise("/login"),e.state("login",{url:"/login",templateUrl:"transcript/login.html",controller:"LoginCtrl"}).state("achievement",{url:"/achievement",templateUrl:"transcript/achievement.html",controller:"AchievementCtrl",cache:!1})}]).controller("AppCtrl",["$scope",function(e){}]).controller("LoginCtrl",["$scope","$http","$state",function(e,t,r){function n(e){if(e&&8==e.length)return e=e.replace(/(.{4})/,"$1/"),e=e.replace(/(.{7})/,"$1/")}sessionStorage.getItem("token")&&r.go("achievement"),e.app={name:"学生成绩查询"},e.user={},e.login=function(){e.user.name&&e.user.password?8!=e.user.password.length?e.authError="密码位数不正确~":(e.authError="",t({url:"http://127.0.0.1/PFT/api/Public/PhysicalFitnessTest/?service=User.checkLoginStudent",method:"post",data:{username:e.user.name,password:n(e.user.password)}}).success(function(t){0==t.data.code?(sessionStorage.setItem("token",angular.toJson(t.data.info)),r.go("achievement")):e.authError="账号或密码错误~"}).error(function(t){e.authError=t})):e.authError="账号或密码不能为空~"}}]).controller("AchievementCtrl",["$scope","$filter",function(e,t){e.today=new Date,e.info=angular.fromJson(sessionStorage.getItem("token")),e.stu=e.info[0],e.subjectArr=[{key:"lung",name:"肺活量(毫升)",coefficient:.15},{key:"50m",name:"50米跑(秒)",coefficient:.2},{key:"sr",name:"坐位体前屈(厘米)",coefficient:.1},{key:"jump",name:"立定跳远(厘米)",coefficient:.1}];var r=[{key:"pullup",name:"引体向上(男)/一分钟仰卧起坐(女)(次)",coefficient:.1},{key:"1000",name:"1000(男)/800(女)米跑(分•秒)",coefficient:.2}],n=[{key:"situp",name:"引体向上(男)/一分钟仰卧起坐(女)(次)",coefficient:.1},{key:"800",name:"1000(男)/800(女)米跑(分•秒)",coefficient:.2}];1==e.stu.sex?(e.subjectArr=e.subjectArr.concat(r),e.subjectAttachArr=r):(e.subjectArr=e.subjectArr.concat(n),e.subjectAttachArr=n),setTimeout(function(){for(var t=[],r=[],n=0,o=0;o<4;o++){for(var a=$(".4"+(o+1)),i=0,u=0,c=0,s=0;s<a.length;s++)i+=parseFloat(a.eq(s).html()*a.eq(s).attr("c"));t.push(i.toFixed(2)),e.standardScore=t;for(var l=$(".4"+(o+1)+"_attach"),f=0;f<l.length;f++)u+=parseFloat(l.eq(f).html());c=i+u,r.push(c.toFixed(2)),e.totalScore=r,n+=o<3?c/6:c/2,e.totalScoreSum=n.toFixed(2),e.$apply()}},100)}]);