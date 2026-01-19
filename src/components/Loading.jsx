/**
 * 加载组件
 */

import { Spin } from 'antd';

const Loading = ({ tip = '加载中...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        minHeight: 200,
      }}
    >
      <Spin size="large" tip={tip} />
    </div>
  );
};

export default Loading;
