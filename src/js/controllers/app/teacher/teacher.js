'use strict';

/* Controllers */

app
    .controller('Teacher2stuCtrl', ['APP', '$scope', '$modal', 'toaster', '$http', '$q', 'Subject', function (APP, $scope, $modal, toaster, $http, $q, Subject) {
        $scope.teacher = angular.fromJson(localStorage.getItem('teacher'));
        $scope.token = sessionStorage.getItem('token');
        $scope.student.status = '';
        $scope.student.size = 0;
        $scope.POP = 0;

        $scope.getStudentListByTeacherId = function () {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $http({
                method: "get",
                url: APP.baseurl + '?service=Student.getInfo',
                params: {
                    teacher_id: $scope.teacher.id,
                    year: $scope.student.year,
                    status: $scope.student.status,
                    size: $scope.student.size,
                    current: $scope.student.current,
                    teacherClass: $scope.teacher.class.teacher_class
                }
            }).success(function (res) {
                deferred.resolve(res);
                if (res.data) {
                    $scope.student.resJson = res.data.info;
                    //异步算得分
                    setTimeout(function () {
                        var passNum = 0;
                        var $tr = $('#scoreTable tbody tr');
                        for (var i = 0; i < $tr.length; i++) {
                            var sum = 0;
                            var $c = $tr.eq(i).find('[c]');
                            for (var j = 0; j < $c.length; j++) {
                                sum += parseFloat($c.eq(j).html()) * parseFloat($c.eq(j).attr('c'));
                            }
                            var $extra = $tr.eq(i).find('[extra]');
                            for (var j = 0; j < $extra.length; j++) {
                                sum += parseFloat($extra.eq(j).html());
                            }
                            sum = parseFloat(sum.toString().substring(0, sum.toString().lastIndexOf('.') + 3)).toFixed(2);
                            if (sum >= 60) {
                                passNum += 1;
                            }
                            $tr.eq(i).find('[sum]').html(sum);
                        }
                        $scope.POP = ((passNum / $tr.length) * 100).toFixed(2);
                        $scope.$apply();
                    }, 100);

                }
            }).error(function (res) {
                deferred.reject(res);
                console.log(res)
            });
            return promise;
        };
        $scope.getClassListByTeacherId = function () {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $http({
                method: "get",
                url: APP.baseurl + '?service=Teacher.getClassInfo',
                params: {
                    token: $scope.token || '',
                    teacherId: $scope.teacher.id,
                    year: $scope.student.year
                }
            }).success(function (res) {
                deferred.resolve(res);
                if (res.data) {
                    $scope.classList = res.data.info;
                    $scope.teacher.class = $scope.classList[0] ? $scope.classList[0] : 0;
                }
            }).error(function (res) {
                deferred.reject(res);
                console.log(res)
            });
            return promise;
        };

        var score = {},
            scoreName = {};
        var ResSubjectList = [];

        $scope.getClassListByTeacherId().then(function () {
            $scope.getScroeList().then(function () {
                $scope.getStudentListByTeacherId();
                ResSubjectList = $scope.resSubjectList;
                if (ResSubjectList) {
                    for (var i = 0; i < ResSubjectList.length; i++) {
                        score[ResSubjectList[i].column_name] = 0;
                        scoreName[ResSubjectList[i].column_comment] = 0;
                    }
                }

            });
        });

        $scope.student.json = [];
        $scope.student.jsonReady = true;

        $scope.count = 0;


        $scope.updateStudent = function () {
            var arr = $scope.student.json;
            var i = $scope.count;
            var isGoOn = true;
            var status = '';
            var ele = {
                token: $scope.token || '',
                teacher_id: $scope.teacher.id,
                school_year: $scope.student.year,
                student_code: arr[i]['学籍号'],
                status: (function (s) {
                    switch (s) {
                        case '病假':
                            status = '1';
                            break;
                        case '事假':
                            status = '2';
                            break;
                        case '未参加':
                            status = '3';
                            break;
                        default:
                            status = '0';
                            break;
                    }
                    return status;
                })(arr[i]['备注']),
                score: (function (stuEle) {
                    angular.forEach(scoreName, function (i, k) {
                        var en_k = Subject.transEn(k, $scope.resSubjectList);
                        scoreName[k] = stuEle[k];
                        score[en_k] = stuEle[k];
                    });
                    //验证
                    if (status == 0 && !checkScore(score, arr[i]['性别'])) {
                        toaster.pop('error', '失败', '第 ' + ($scope.count + 2) + ' 行导入的数据格式有误 \n 请检查这行成绩的数据：女生和男生的项目不同 以及 成绩的最小最大值是否合理');
                        isGoOn = false;
                    };
                    return angular.toJson(score);
                })(arr[i])
            }
            if (isGoOn) {
                //上传
                $http({
                    url: APP.baseurl + '?service=Student.updateScore',
                    method: 'post',
                    data: ele
                }).success(function (res) {
                    if (res.ret == 200) {
                        $scope.count++;
                        if (i == arr.length - 1) {
                            $scope.getStudentListByTeacherId();
                            toaster.pop('success', '更新成绩成功', '共更新' + $scope.count + '条成绩');
                            $scope.count = 0;
                            $scope.student.jsonReady = true;
                            return;
                        } else {
                            $scope.updateStudent();
                        }
                    } else
                        toaster.pop('error', '失败', res.msg);

                }).error(function (res) {
                    toaster.pop('error', '失败', res);
                });
            }
        };



        //
        $scope.submitStudent = function () {
            var stuArr = $scope.student.resJson;
            for (var i = 0; i < stuArr.length; i++) {
                var stuEle = stuArr[i];
                var score = getScroeFromStu(stuEle);
                if (stuEle.status == 0 && !checkScore(score, stuEle.sex)) {
                    toaster.pop('error', '失败', '请检查 ' + stuEle.name + ' 的成绩！');
                    return false;
                }
            }
            if (window.confirm('确定提交吗？提交后将不能修改，如需修改请联系管理员！')) {
                var ele = {
                    teacher_id: $scope.teacher.id,
                    school_year: $scope.student.year,
                    teacher_class: $scope.teacher.class.teacher_class
                }
                //上传
                $http({
                    url: APP.baseurl + '?service=Student.submitScore',
                    method: 'post',
                    data: ele
                }).success(function (res) {
                    if (res.ret == 200) {
                        toaster.pop('success', '提交成绩成功', '已提交【' + $scope.teacher.class.teacher_class + '】的成绩');
                        $scope.teacher.class.is_submit = 1;
                    } else
                        toaster.pop('error', '失败', res.msg);

                }).error(function (res) {
                    toaster.pop('error', '失败', res);
                });
            }
        };
        //
        $scope.unlock = function () {
            var ele = {
                token: $scope.token || '',
                teacher_id: $scope.teacher.id,
                school_year: $scope.student.year,
                teacher_class: $scope.teacher.class.teacher_class
            }
            //上传
            $http({
                url: APP.baseurl + '?service=Student.backSubmitScore',
                method: 'post',
                data: ele
            }).success(function (res) {
                if (res.ret == 200) {
                    toaster.pop('success', '解锁成功', '【' + $scope.teacher.class.teacher_class + '】的成绩已解锁');
                    $scope.teacher.class.is_submit = 0;
                } else
                    toaster.pop('error', '失败', res.msg);

            }).error(function (res) {
                toaster.pop('error', '失败', res);
            });
        };

        $scope.updateDetail = function (stu, size) {
            var modalInstance = $modal.open({
                templateUrl: 'tpl/teacher/update.html',
                controller: 'TeacherUpdateStudentScoreDetailCtrl',
                size: size,
                resolve: {
                    stu: function () {
                        return stu;
                    },
                    subjectList: function () {
                        return $scope.resSubjectList;
                    }
                }
            });
            modalInstance.result.then(function (res) {
                $scope.getStudentListByTeacherId();
            }, function (res) {
                $scope.getStudentListByTeacherId();
            });

        };

        $scope.clearFile = function () {
            document.getElementById('selectFileInput').value = '';
        }

    }]);


app.controller('TeacherUpdateStudentScoreDetailCtrl', ['APP', '$scope', '$modalInstance', '$http', 'toaster', 'stu', 'subjectList', function (APP, $scope, $modalInstance, $http, toaster, stu, subjectList) {

    $scope.stu = stu;
    $scope.subjectList = subjectList;
    $scope.token = sessionStorage.getItem('token');

    $scope.ok = function () {
        var ele = {
            token: $scope.token || '',
            teacher_id: stu.teacher_id,
            school_year: stu.school_year,
            student_code: stu.student_code,
            status: stu.status,
            score: (function (stuEle) {
                var score = getScroeFromStu(stuEle);
                return angular.toJson(score);
            })(stu)
        }
        if ($scope.stu.status == 0 && !checkScore(angular.fromJson(ele.score), stu.sex)) {
            toaster.pop('error', '失败', '请检查该同学的成绩数据：女生和男生的项目不同 以及 成绩的最小最大值是否合理');
        } else {
            $http({
                url: APP.baseurl + '?service=Student.updateScore',
                method: 'post',
                data: ele
            }).success(function (res) {
                if (res.ret == 200)
                    toaster.pop('success', '成功', '成功编辑成绩！');
                else
                    toaster.pop('error', '失败', res.msg);
                $modalInstance.close();
            }).error(function (res) {
                toaster.pop('error', '失败', res);
            });

        }
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);


//成绩验证
function checkScore(score, sex) {
    console.log(score)
    for (var k in score) {
        var v = Number(score[k]);
        if (isNaN(v)) {
            return false;
        }
        switch (k) {
            case 'test_height':
                if (v < 50 || v > 250) {
                    return false;
                }
                break;
            case 'test_weight':
                if (v < 15 || v > 300) {
                    return false;
                }
                break;
            case 'test_lung':
                if (v < 500 || v > 9999) {
                    return false;
                }
                break;
            case 'test_50m':
                if (v < 5 || v > 20) {
                    return false;
                }
                break;
            case 'test_jump':
                if (v < 50 || v > 400) {
                    return false;
                }
                break;
            case 'test_sr':
                if (v > 40) {
                    return false;
                }
                break;
            case 'test_800':
                if (sex == 2 || sex == '女') {
                    if (v < 1.3 || v > 10 || !checkSecond(v)) {
                        return false;
                    }
                }
                break;
            case 'test_1000':
                if (sex == 1 || sex == '男') {
                    if (v < 1.3 || v > 10 || !checkSecond(v)) {
                        return false;
                    }
                }
                break;
            case 'test_pullup':
                if (sex == 1 || sex == '男') {
                    if (v < 0 || v > 99) {
                        return false;
                    }
                }
                break;
            case 'test_situp':
                if (sex == 2 || sex == '女') {
                    if (v < 0 || v > 99) {
                        return false;
                    }
                }
                break;
            default:
                break;
        }


    }

    return true;
}


//checkSecond
function checkSecond(time) {
    var t = time.toString();
    if (t.indexOf('.') > 0) {
        if (t.substr(t.indexOf('.') + 1, 1) >= 6) {
            return false;
        }
    }
    return true;
}


function getScroeFromStu(stuEle) {
    var score = {};
    angular.forEach(stuEle, function (i, k) {
        if (k.indexOf("test_") >= 0) {
            score[k] = stuEle[k];
        }
    });
    return score;
}