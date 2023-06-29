import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Context } from "../../../utils/ContextProvider";
import {
  Layout,
  Menu,
  Modal,
  Button,
  Form,
  Input,
  message,
  Dropdown,
} from "antd";
import {
  HomeOutlined,
  MessageOutlined,
  KeyOutlined,
  PlusCircleOutlined,
  LogoutOutlined,
  RightOutlined,
  UsergroupDeleteOutlined,
} from "@ant-design/icons";
import placementcell from "../../../assets/placementcell.png";
import admin from "../../../assets/admin.png";
import DomainNames from "../../../utils/DomainNames.json";

const { Sider } = Layout;

const Sidebar = () => {
  const { logout, isCollapsed, setCollapsed } = useContext(Context);
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState("/admin");
  const [statedata, setstatedata] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    handleWindowSizeChange();
    window.addEventListener("resize", handleWindowSizeChange); // This code sets up an event listener for the "resize" event on the window object when the component mounts (i.e., when we load admin page)
    return () => window.removeEventListener("resize", handleWindowSizeChange); // This code removes the event listener when the component unmounts (i.e., when we exit the admin page)
  }, []);

  const handleWindowSizeChange = () => {
    if (window.innerWidth <= 768) {
      setCollapsed(true);
    } else {
      setCollapsed(false);
    }
  };

  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location.pathname]); // the state changes when the location.pathname changes

  const fetchData = async () => {
    // This is used to obtain the data from the server and set it to Hooks for the first time only
    try {
      const response = await fetch(`${DomainNames.local}/api/admin`);
      const data = await response.json();
      setstatedata([data]); // the data we recieved is an object. that is why we are enclosing it inside an array
    } catch (error) {
      console.error(error);
    }
  };

  const sendUpdatedData = async (values) => {
    try {
      const response = await fetch(
        `${DomainNames.local}/api/admin/${values.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );
      const data = await response.json();

      if (response.status === 200) {
        fetchData();
        message.success(data);
        setLoading(false);
        form.resetFields();
        form.setFieldsValue({
          username: values.username,
        });
        setTimeout(() => {
          setIsEditing(false);
        }, 1500);
      } else if (response.status === 404 || response.status === 401) {
        message.error(data);
      } else if (response.status === 500) {
        message.error("Please try again");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const passwordHandleClick = () => {
    // this function is written first becz we cannot access 'passwordHandleClick' funtion in the MenuContents array before initialization
    setIsEditing(true);
  };

  const logoutHandleClick = () => {
    logout();
  };

  const MenuContents = [
    {
      label: "Home",
      icon: <HomeOutlined />,
      key: "/admin",
    },
    {
      label: "New Placement",
      icon: <PlusCircleOutlined />,
      key: "/admin/newplacement",
    },
    {
      label: "Responses",
      icon: <MessageOutlined />,
      key: "/admin/responses",
    },
    {
      label: "Manage Students",
      icon: <UsergroupDeleteOutlined />,
      key: "/admin/manage",
    },
  ];

  const items = [
    {
      label: "Change Password",
      icon: <KeyOutlined />,
      key: "1",
      onClick: passwordHandleClick,
    },
    {
      label: "Logout",
      icon: <LogoutOutlined />,
      key: "2",
      onClick: logoutHandleClick,
    },
  ];

  const initialValues = {
    username: statedata?.[0]?.username,
  };

  const validateConfirmPassword = (rule, value) => {
    // even though rule is not used, it must be used as parameter to the correct syntax
    return new Promise((resolve, reject) => {
      if (value && value !== form.getFieldValue("newpassword"))
        reject("The two passwords do not match");
      else resolve();
    });
  };

  const onCancel = () => {
    form.resetFields();
    setIsEditing(false);
  };

  const onFinish = (values) => {
    setLoading(true);
    // call backend function to update details
    sendUpdatedData(values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Layout>
      <Sider
        mode="vertical"
        trigger={null} // this is used to remove the black arrrow on the side of Sider component
        collapsible
        theme="dark"
        collapsedWidth={80}
        collapsed={isCollapsed}
        width="200px"
        style={{
          backgroundColor: "#141929",
          backgroundImage: `repeating-linear-gradient(120deg, rgba(255,255,255,.1), rgba(255,255,255,.1) 1px, transparent 1px, transparent 60px),
                    repeating-linear-gradient(60deg, rgba(255,255,255,.1), rgba(255,255,255,.1) 1px, transparent 1px, transparent 60px),
                    linear-gradient(60deg, rgba(0,0,0,.1) 25%, transparent 25%, transparent 75%, rgba(0,0,0,.1) 75%, rgba(0,0,0,.1)),
                    linear-gradient(120deg, rgba(0,0,0,.1) 25%, transparent 25%, transparent 75%, rgba(0,0,0,.1) 75%, rgba(0,0,0,.1))`,
          backgroundSize: "70px 120px",
        }}
      >
        <div
          className={`p-2 flex flex-row items-center justify-center backdrop-blur-sm bg-white/30 ${
            isCollapsed ? "m-2 rounded-full" : "m-0"
          }`}
        >
          <img alt="" src={placementcell} width={50} className="rounded-full" />
          {isCollapsed ? null : (
            <h1 className="m-2 text-white text-lg font-extrabold uppercase">
              Placement Cell
            </h1>
          )}
        </div>
        <Menu
          items={MenuContents}
          theme="dark"
          selectedKeys={[currentPath]}
          mode="vertical"
          onClick={(item) => {
            item.key !== "1" && item.key !== "2"
              ? navigate(item.key)
              : () => {}; // this is done to prevent the routing of changepassword, inorder to display only the Model
          }}
          style={{
            marginTop: "10px",
            background: "transparent",
            color: "white",
            border: "none",
          }}
        />
        <div className="absolute bottom-0 right-0 left-0 m-2 cursor-pointer">
          <Dropdown
            menu={{
              items,
              selectable: true,
            }}
          >
            <div className="p-2 flex items-center justify-around gap-x-2 border border-solid border-transparent bg-white/30 rounded-md">
              <div className="rounded-full w-10 h-10 overflow-hidden">
                <img
                  alt=""
                  src={admin}
                  className="object-cover h-full w-full"
                />
              </div>

              {isCollapsed ? (
                <></>
              ) : (
                <>
                  <h1 className="text-lg font-bold text-gray-200">Admin</h1>
                  <RightOutlined className="text-gray-200" />
                </>
              )}
            </div>
          </Dropdown>
        </div>
      </Sider>
      <Modal
        title="Change Password"
        open={isEditing}
        maskClosable={false} // this will make the Model not disappear even if we click outside the Model
        onCancel={onCancel}
        okButtonProps={{ style: { display: "none" } }}
      >
        <Form
          form={form}
          name="changepasswordform"
          initialValues={initialValues}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 12 }}
        >
          <Form.Item name="username" label="Username">
            <Input readOnly />
          </Form.Item>
          <Form.Item
            name="oldpassword"
            label="Old Password"
            rules={[
              { required: true, message: "Please enter your old password" },
            ]}
          >
            <Input type="password" />
          </Form.Item>
          <Form.Item
            name="newpassword"
            label="New Password"
            rules={[
              { required: true, message: "Please enter your new password" },
            ]}
          >
            <Input placeholder="Donot reuse old password" type="password" />
          </Form.Item>
          <Form.Item
            name="confirmnewpassword"
            label="Confirm New Password"
            rules={[
              { required: true, message: "Please confirm your new password" },
              { validator: validateConfirmPassword },
            ]}
          >
            <Input type="password" />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 7 }}>
            <Button
              className="bg-blue-500"
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              {loading ? "Updating..." : "Verify and Update password"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Sidebar;
