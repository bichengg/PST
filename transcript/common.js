"use strict";var app=angular.module("app",["ui.router"]);app.config(["$controllerProvider","$compileProvider","$filterProvider","$provide",function(e,t,r,n){app.controller=e.register,app.directive=t.directive,app.filter=r.register,app.factory=n.factory,app.service=n.service,app.constant=n.constant,app.value=n.value}]).config(["$httpProvider",function(e){e.defaults.transformRequest=function(e){var t=[];for(var r in e)t.push(encodeURIComponent(r)+"="+encodeURIComponent(e[r]));return t.join("&")},e.defaults.headers.post={"Content-Type":"application/x-www-form-urlencoded"}}]).filter("trans2sex",function(){return function(e){return 1==e?"男":2==e?"女":void 0}}).filter("trans2nation",function(){return function(e){return 1==e?"汉族":"其他"}}).filter("trans2score",function(){return function(e,t,r,n){41==t||42==t?t=4142:43!=t&&44!=t||(t=4344);var o=trans_4142_1_lung,a=0;e=parseFloat(e);for(var i=0;i<o.length-1;i++)e>=o[i].a&&e<o[i+1].a?a=o[i].b:e>=o[i+1].a&&(a=o[i+1].b);return a}}).filter("trans2level",function(){return function(e){var t="";return e<=10?t="未测试":e>10&&e<=59?t="不及格":e>59&&e<=79?t="及格":e>79&&e<=89?t="良好":e>89&&(t="优秀"),t}}).filter("trans2exPoint",function(){return function(e,t){var r=0;return e>100&&(r=(e-100)*t),r}}).run(["$rootScope","$state","$stateParams",function(e,t,r){e.$state=t,e.$stateParams=r}]).config(["$stateProvider","$urlRouterProvider",function(e,t){t.otherwise("/login"),e.state("login",{url:"/login",templateUrl:"login.html",controller:"LoginCtrl"}).state("achievement",{url:"/achievement",templateUrl:"achievement.html",controller:"AchievementCtrl",cache:!1})}]).controller("AppCtrl",["$scope",function(e){}]).controller("LoginCtrl",["$scope","$http","$state",function(e,t,r){function n(e){if(e&&8==e.length)return e=e.replace(/(.{4})/,"$1/"),e=e.replace(/(.{7})/,"$1/")}e.app={name:"学生成绩查询"},e.user={},e.login=function(){e.user.name&&e.user.password?8!=e.user.password.length?e.authError="密码位数不正确~":(e.authError="",t({url:"http://127.0.0.1/PFT/api/Public/PhysicalFitnessTest/?service=User.checkLoginStudent",method:"post",data:{username:e.user.name,password:n(e.user.password)}}).success(function(t){0==t.data.code?(sessionStorage.setItem("token",angular.toJson(t.data.info)),r.go("achievement")):e.authError="账号或密码错误~"}).error(function(t){e.authError=t})):e.authError="账号或密码不能为空~"}}]).controller("AchievementCtrl",["$scope",function(e){e.today=new Date,e.info=angular.fromJson(sessionStorage.getItem("token")),e.stu=e.info[0],e.subjectArr=[{key:"lung",name:"肺活量(毫升)",coefficient:.15},{key:"50m",name:"50米跑(秒)",coefficient:.2},{key:"sr",name:"坐位体前屈(厘米)",coefficient:.1},{key:"jump",name:"立定跳远(厘米)",coefficient:.1}];var t=[{key:"pullup",name:"引体向上(男)(次)",coefficient:.1},{key:"1000",name:"1000(男)(分•秒)",coefficient:.2}],r=[{key:"situp",name:"一分钟仰卧起坐(女)(次)",coefficient:.1},{key:"800",name:"800(女)米跑(分•秒)",coefficient:.2}];1==e.stu.sex?(e.subjectArr=e.subjectArr.concat(t),e.subjectAttachArr=t):(e.subjectArr=e.subjectArr.concat(r),e.subjectAttachArr=r)}]);