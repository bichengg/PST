<?php
/**
 * 考试项目接口服务类
 *
 * @author: 
 */

class Api_Subject extends PhalApi_Api {

	public function getRules() {
        return array(
            'getInfo' => array(
                'token' => array('name' => 'token', 'source' => 'get', 'type' => 'string', 'require' => true)
            ),
            'insert' => array(
                'token' => array('name' => 'token', 'source' => 'post', 'type' => 'string', 'require' => true),
                'num'  => array('name' => 'num', 'type' => 'int', 'source' => 'post', 'require' => false, 'default'=>'2', 'desc' => '项目工号'),   
                'name'  => array('name' => 'name','type' => 'string', 'source' => 'post', 'require' => false, 'desc' => '项目姓名'),
                'pwd'  => array('name' => 'pwd', 'type' => 'string', 'source' => 'post', 'require' => false, 'default'=>'123', 'desc' => '密码'),   
            ),
            'update' => array(
                'token' => array('name' => 'token', 'source' => 'post', 'type' => 'string', 'require' => true),
                'subjectId' => array('name' => 'id', 'source' => 'post', 'type' => 'string', 'require' => true),
                'num'  => array('name' => 'num', 'type' => 'int', 'source' => 'post', 'require' => false, 'default'=>'2', 'desc' => '项目工号'),   
                'name'  => array('name' => 'name','type' => 'string', 'source' => 'post', 'require' => false, 'desc' => '项目姓名'),
                'pwd'  => array('name' => 'pwd', 'type' => 'string', 'source' => 'post', 'require' => false, 'default'=>'123', 'desc' => '密码'),   
            ),
        );
	}
	
    /**
	 * 项目信息获取
	 * @return 
	 */
    public function getInfo(){
        $model = new Model_Default();
        $adminId = $model->checkAdminId($this->token);
        if (empty($adminId)) {
            return ;
        }

        $rs = array('code' => 0, 'msg' => '', 'info' => array());

        
        $info = array();


        $sql ="SELECT
                    column_name,
                    column_comment
                FROM
                    information_schema. COLUMNS
                WHERE
                    column_name LIKE 'test_%'
                AND table_name = 'pft_student'";

        $info= DI()->notorm->example->queryAll($sql);
        
        if (empty($info)) {
            DI()->logger->debug('subject not found', $this->subjectId);

            $rs['code'] = 1;
            $rs['msg'] = T('user not exists');
            return $rs;
        }

        $rs['info'] = $info;

        return $rs;
    }
    /**
	 * 项目新增
     * @desc 
	 * @return  id
	 */
    public function insert(){
        $model = new Model_Default();
        $adminId = $model->checkAdminId($this->token);
        if (empty($adminId)) {
            return ;
        }
        $data = array(
            'id' => new NotORM_Literal('uuid()'),
            'num'  => $this->num,                                            
            'name'  => $this->name,
            'pwd'  => $this->pwd,
            'time'  => date('Y-m-d H:i:s')
        );
        $rs   = DI()->notorm->subject->insert($data);    
        $rs['msg'] = T('add ok');           
        return $rs['id'];  
    }
    /**
	 * 项目更改
     * @desc 
	 * @return  id
	 */
    public function update(){
        $model = new Model_Default();
        $adminId = $model->checkAdminId($this->token);
        if (empty($adminId)) {
            return ;
        }
        $data = array(
            'num'  => $this->num,                                            
            'name'  => $this->name,
            'pwd'  => $this->pwd,
            'time'  => date('Y-m-d H:i:s')
        );
        $rs   = DI()->notorm->subject->where('id', $this->subjectId)->update($data);
        if($rs === false){
            throw new PhalApi_Exception_BadRequest('修改数据失败');
        }
    }
}
