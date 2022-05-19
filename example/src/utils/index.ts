import axios from 'axios';
import {Platform} from 'react-native';

let token = '';

const api = axios.create({
  withCredentials: true,
  timeout: 20000,
});

// Request 拦截器
api.interceptors.request.use(
  async config => {
    if (token && config.headers) {
      config.headers['token'] = token;
    }
    const url = `${config.baseURL || ''}${config.url}`;
    console.log(
      ` >> [${config.method?.toLocaleUpperCase()} REQUEST] ${url}: ${JSON.stringify(
        config.data || config.params,
      )}`,
    );
    return config;
  },
  error => {
    console.log(' >> [API REQUEST ERROR]', error);
    return Promise.reject(error);
  },
);

// Respone 拦截器
api.interceptors.response.use(
  response => {
    const {config} = response;
    console.log(
      ` >> [${config.method?.toLocaleUpperCase()} RESPONSE] ${config.url}:`,
      response.data ? response.data : response,
    );
    return response;
  },
  async error => {
    const res = error.response || {};
    const {config = {}} = res;
    console.log(
      ` >> [API RESPONSE ERROR]`,
      config.url,
      res.data ? res.data : res,
      error,
    );
    return Promise.reject(error);
  },
);

/**
 * @param { Promise } promise
 * @param { Object= } errorExt - Additional Information you can pass to the err object
 * @return { Promise }
 */
export async function to<T, U = Error>(
  promise: Promise<T>,
  errorExt?: object,
): Promise<[U, undefined] | [null, T]> {
  return promise
    .then<[null, T]>((data: T) => [null, data])
    .catch<[U, undefined]>((err: U) => {
      if (errorExt) {
        const parsedError = Object.assign({}, err, errorExt);
        return [parsedError, undefined];
      }
      return [err, undefined];
    });
}

export async function admin_system_login() {
  const [_err, res] = await to(
    api.post<IApiRes<{token: string}>>(
      'http://112.74.92.242:8765/v1/api/admin/system/login',
      {
        phone: Platform.OS === 'ios' ? '18816468651' : '18816468654',
        smsCode: '1234',
      },
    ),
  );
  if (!res || !res.data.data) {
    return;
  }
  token = res.data.data.token;
  return res.data.data;
}

export async function admin_user_info() {
  const [_err, res] = await to(
    api.get<IApiRes<{id: number}>>(
      'http://112.74.92.242:8765/v1/api/admin/user/info',
    ),
  );
  if (!res || !res.data.data) {
    return;
  }
  return res.data.data;
}

export async function index_user_login_im() {
  const [_err, res] = await to(
    api.get<IApiRes<{sig: string; group_id: string}>>(
      'http://web.xiaoquexinapp.com/index/user/loginIm',
    ),
  );
  if (!res || !res.data.data) {
    return;
  }
  return res.data.data;
}

export async function login_im_sdk() {
  const res = await admin_system_login();
  if (!res) return;
  const [info, data] = await Promise.all([
    admin_user_info(),
    index_user_login_im(),
  ]);
  if (!info || !data) return;
  return Object.assign(info, data);
}

interface IApiRes<T> {
  data: T;
  message: string;
  statusCode: number;
}
