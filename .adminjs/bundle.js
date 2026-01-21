(function (react, adminjs, designSystem) {
	'use strict';

	const api$1 = new adminjs.ApiClient();
	const statuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
	function OrderStatusAction({
	  action,
	  record,
	  resource
	}) {
	  const [localRecord, setLocalRecord] = react.useState(record);
	  const [selectedStatus, setSelectedStatus] = react.useState(record?.params.status ?? 'PENDING');
	  const [loading, setLoading] = react.useState(false);
	  const addNotice = adminjs.useNotice();
	  const {
	    translateAction,
	    translateLabel,
	    translateMessage
	  } = adminjs.useTranslation();
	  if (!localRecord) {
	    return /*#__PURE__*/React.createElement(designSystem.Box, {
	      variant: "white",
	      p: "xl"
	    }, /*#__PURE__*/React.createElement(designSystem.Text, null, translateMessage('status-update-failed')));
	  }
	  const currentStatus = localRecord.params.status;
	  const statusOptions = react.useMemo(() => statuses.map(status => ({
	    value: status,
	    label: translateLabel(`status.${status}`, resource.id)
	  })), [resource.id, translateLabel]);
	  const currentLabel = currentStatus ? translateLabel(`status.${currentStatus}`, resource.id) : translateMessage('status-unknown');
	  const selectedOption = statusOptions.find(option => option.value === selectedStatus) ?? null;
	  const nextLabel = selectedStatus ? translateLabel(`status.${selectedStatus}`, resource.id) : null;
	  const handleClick = async () => {
	    if (!localRecord || !selectedStatus) return;
	    setLoading(true);
	    try {
	      const formData = new FormData();
	      formData.append('status', selectedStatus);
	      const response = await api$1.recordAction({
	        resourceId: resource.id,
	        recordId: localRecord.id,
	        actionName: action.name,
	        method: 'post',
	        data: formData
	      });
	      if (response.data.notice?.type === 'error') {
	        addNotice(response.data.notice);
	      } else {
	        addNotice({
	          message: 'status-updated',
	          type: 'success',
	          options: {
	            status: nextLabel ?? selectedStatus
	          }
	        });
	      }
	      if (response.data.record) {
	        setLocalRecord(response.data.record);
	      }
	    } catch {
	      addNotice({
	        message: 'status-update-failed',
	        type: 'error'
	      });
	    } finally {
	      setLoading(false);
	    }
	  };
	  const buttonLabel = loading ? translateMessage('status-update-progress') : translateMessage('apply-status');
	  const title = translateAction(action.name, resource.id);
	  return /*#__PURE__*/React.createElement(designSystem.Box, {
	    variant: "white",
	    p: "xxl",
	    borderRadius: "xl",
	    boxShadow: "sm",
	    maxWidth: "680px",
	    style: {
	      border: '1px solid #E2E8F0'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Box, {
	    display: "flex",
	    alignItems: "center",
	    justifyContent: "space-between",
	    mb: "xl"
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontSize: "xl",
	    fontWeight: "bold"
	  }, title)), /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      display: 'flex',
	      flexDirection: 'column',
	      gap: 24
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Box, {
	    display: "flex",
	    alignItems: "center"
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontSize: "lg",
	    fontWeight: "500",
	    mr: "lg"
	  }, translateMessage('current-status')), /*#__PURE__*/React.createElement(designSystem.Badge, {
	    fontSize: "md",
	    outline: true,
	    style: {
	      background: '#C6F6D5',
	      borderColor: '#38A169',
	      color: '#22543D'
	    }
	  }, currentLabel)), /*#__PURE__*/React.createElement(designSystem.FormGroup, {
	    label: translateMessage('select-status'),
	    mb: "0"
	  }, /*#__PURE__*/React.createElement(designSystem.Select, {
	    isClearable: false,
	    options: statusOptions,
	    value: selectedOption,
	    onChange: option => {
	      const value = option?.value;
	      setSelectedStatus(value ?? currentStatus ?? 'PENDING');
	    }
	  })), nextLabel ? /*#__PURE__*/React.createElement(designSystem.Box, {
	    display: "flex",
	    alignItems: "center"
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "500",
	    fontSize: "lg",
	    mr: "lg"
	  }, translateMessage('new-status')), /*#__PURE__*/React.createElement(designSystem.Badge, {
	    fontSize: "md",
	    outline: true,
	    style: {
	      background: '#C6F6D5',
	      borderColor: '#38A169',
	      color: '#22543D'
	    }
	  }, nextLabel)) : null, /*#__PURE__*/React.createElement(designSystem.Box, null, /*#__PURE__*/React.createElement(designSystem.Button, {
	    style: {
	      borderColor: 'white',
	      background: '#facc15',
	      color: 'black'
	    },
	    variant: "contained",
	    color: "primary",
	    onClick: handleClick,
	    disabled: !selectedStatus || loading
	  }, buttonLabel))));
	}

	const api = new adminjs.ApiClient();
	function CancelOrderAction({
	  action,
	  record,
	  resource
	}) {
	  const [localRecord, setLocalRecord] = react.useState(record);
	  const [refundPayment, setRefundPayment] = react.useState(false);
	  const [loading, setLoading] = react.useState(false);
	  const addNotice = adminjs.useNotice();
	  const {
	    translateAction,
	    translateMessage
	  } = adminjs.useTranslation();
	  if (!localRecord) {
	    return /*#__PURE__*/React.createElement(designSystem.Box, {
	      variant: "white",
	      p: "xl"
	    }, /*#__PURE__*/React.createElement(designSystem.Text, null, translateMessage('status-update-failed')));
	  }
	  const stripeSessionId = localRecord.params.stripeSessionId;
	  const canRefund = Boolean(stripeSessionId);
	  const title = translateAction(action.name, resource.id);
	  const buttonLabel = loading ? translateMessage('cancel-order-progress') : title;
	  const handleCancel = async () => {
	    if (!localRecord) return;
	    setLoading(true);
	    try {
	      const formData = new FormData();
	      formData.append('refund', refundPayment ? 'true' : 'false');
	      const response = await api.recordAction({
	        resourceId: resource.id,
	        recordId: localRecord.id,
	        actionName: action.name,
	        method: 'post',
	        data: formData
	      });
	      if (response.data.notice) {
	        addNotice(response.data.notice);
	      }
	      if (response.data.record) {
	        setLocalRecord(response.data.record);
	      }
	    } catch {
	      addNotice({
	        message: 'status-update-failed',
	        type: 'error'
	      });
	    } finally {
	      setLoading(false);
	    }
	  };
	  return /*#__PURE__*/React.createElement(designSystem.Box, {
	    variant: "white",
	    p: "xxl",
	    borderRadius: "xl",
	    boxShadow: "sm",
	    maxWidth: "680px",
	    style: {
	      border: '1px solid #E2E8F0'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Box, {
	    display: "flex",
	    alignItems: "center",
	    justifyContent: "space-between",
	    mb: "xl"
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontSize: "xl",
	    fontWeight: "bold"
	  }, title)), /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      display: 'flex',
	      flexDirection: 'column',
	      gap: 16
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Box, {
	    as: "label",
	    display: "flex",
	    alignItems: "center",
	    style: {
	      gap: 10,
	      cursor: canRefund ? 'pointer' : 'not-allowed'
	    }
	  }, /*#__PURE__*/React.createElement("input", {
	    type: "checkbox",
	    checked: refundPayment,
	    disabled: !canRefund,
	    onChange: event => setRefundPayment(event.target.checked),
	    style: {
	      width: 16,
	      height: 16
	    }
	  }), /*#__PURE__*/React.createElement(designSystem.Text, null, translateMessage('refund-payment'))), !canRefund ? /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60",
	    fontSize: "sm"
	  }, translateMessage('refund-payment-hint')) : null, /*#__PURE__*/React.createElement(designSystem.Box, null, /*#__PURE__*/React.createElement(designSystem.Button, {
	    style: {
	      borderColor: 'white',
	      background: '#facc15',
	      color: 'black'
	    },
	    variant: "contained",
	    color: "primary",
	    onClick: handleCancel,
	    disabled: loading
	  }, buttonLabel))));
	}

	const quickActions = [{
	  key: 'orders',
	  path: 'resources/Order'
	}, {
	  key: 'products',
	  path: 'resources/Product'
	}, {
	  key: 'customers',
	  path: 'resources/User'
	}, {
	  key: 'reviews',
	  path: 'resources/Review'
	}];
	const actionButtonStyle$1 = {
	  borderColor: 'white',
	  background: '#facc15',
	  color: 'black'
	};
	const resolvePath = path => {
	  if (typeof window === 'undefined') return path;
	  const globalAny = window;
	  const rootPath = globalAny.REDUX_STATE?.paths?.rootPath ?? '';
	  const normalizedRoot = rootPath.replace(/\/$/, '');
	  const normalizedPath = path.replace(/^\//, '');
	  if (!normalizedRoot) return path;
	  return `${normalizedRoot}/${normalizedPath}`;
	};
	const goTo = path => () => {
	  if (typeof window !== 'undefined') {
	    window.location.assign(resolvePath(path));
	  }
	};
	function Dashboard() {
	  const {
	    translateMessage
	  } = adminjs.useTranslation();
	  return /*#__PURE__*/React.createElement(designSystem.Box, {
	    variant: "grey",
	    p: "xxl"
	  }, /*#__PURE__*/React.createElement(designSystem.Box, {
	    variant: "white",
	    p: "xxl",
	    borderRadius: "xl",
	    boxShadow: "sm",
	    style: {
	      display: 'flex',
	      alignItems: 'center',
	      justifyContent: 'space-between',
	      gap: 32,
	      flexWrap: 'wrap'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      maxWidth: 520
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.H2, {
	    mb: "lg"
	  }, translateMessage('dashboard.title')), /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontSize: "lg",
	    mb: "xl"
	  }, translateMessage('dashboard.subtitle')), /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      display: 'flex',
	      gap: 12,
	      flexWrap: 'wrap'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Button, {
	    variant: "contained",
	    color: "primary",
	    style: actionButtonStyle$1,
	    onClick: goTo('resources/Order')
	  }, translateMessage('dashboard.primaryActions.orders')), /*#__PURE__*/React.createElement(designSystem.Button, {
	    variant: "contained",
	    color: "primary",
	    style: actionButtonStyle$1,
	    onClick: goTo('resources/Product')
	  }, translateMessage('dashboard.primaryActions.products')), /*#__PURE__*/React.createElement(designSystem.Button, {
	    variant: "contained",
	    color: "primary",
	    style: actionButtonStyle$1,
	    onClick: goTo('resources/Review')
	  }, translateMessage('dashboard.primaryActions.reviews')))), /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      minWidth: 240,
	      display: 'flex',
	      justifyContent: 'center'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Illustration, {
	    variant: "Bag",
	    width: 200,
	    height: 180
	  }))), /*#__PURE__*/React.createElement(designSystem.Box, {
	    mt: "xxl"
	  }, /*#__PURE__*/React.createElement(designSystem.H4, null, translateMessage('dashboard.dailyFocus.title')), /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('dashboard.dailyFocus.subtitle'))), /*#__PURE__*/React.createElement(designSystem.Box, {
	    mt: "lg",
	    style: {
	      display: 'grid',
	      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
	      gap: 16
	    }
	  }, quickActions.map(action => /*#__PURE__*/React.createElement(designSystem.Box, {
	    key: action.key,
	    variant: "white",
	    p: "xl",
	    borderRadius: "xl",
	    boxShadow: "sm",
	    style: {
	      border: '1px solid #E2E8F0'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.H5, {
	    mb: "md"
	  }, translateMessage(`dashboard.cards.${action.key}.title`)), /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60",
	    mb: "xl"
	  }, translateMessage(`dashboard.cards.${action.key}.description`)), /*#__PURE__*/React.createElement(designSystem.Button, {
	    variant: "contained",
	    color: "primary",
	    style: actionButtonStyle$1,
	    onClick: goTo(action.path)
	  }, translateMessage(`dashboard.cards.${action.key}.button`))))));
	}

	const actionButtonStyle = {
	  borderColor: 'white',
	  background: '#facc15',
	  color: 'black'
	};
	const getMessageText = (message, translateMessage) => message.split(' ').length > 1 ? message : translateMessage(message);
	function Login() {
	  const windowState = window;
	  const props = windowState.__APP_STATE__;
	  const action = props?.action ?? '';
	  const message = props?.errorMessage ?? undefined;
	  const branding = windowState.REDUX_STATE?.branding ?? {};
	  const {
	    translateComponent,
	    translateMessage
	  } = adminjs.useTranslation();
	  const [email, setEmail] = react.useState('');
	  const [password, setPassword] = react.useState('');
	  const handleEmailChange = event => {
	    setEmail(event.target.value);
	  };
	  const handlePasswordChange = event => {
	    setPassword(event.target.value);
	  };
	  return /*#__PURE__*/React.createElement(designSystem.Box, {
	    variant: "grey",
	    flex: true,
	    style: {
	      minHeight: '100%',
	      alignItems: 'center',
	      justifyContent: 'center',
	      padding: '32px 16px'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Box, {
	    variant: "white",
	    p: "xxl",
	    borderRadius: "xl",
	    boxShadow: "sm",
	    style: {
	      width: 'min(960px, 100%)',
	      display: 'grid',
	      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
	      gap: 32
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      display: 'flex',
	      flexDirection: 'column',
	      gap: 16
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.H2, null, translateComponent('Login.title')), /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontSize: "lg"
	  }, translateComponent('Login.subtitle')), /*#__PURE__*/React.createElement(designSystem.Box, {
	    variant: "grey",
	    borderRadius: "xl",
	    p: "xl",
	    style: {
	      display: 'flex',
	      alignItems: 'center',
	      gap: 16
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Illustration, {
	    variant: "Bag",
	    width: 120,
	    height: 110
	  }), /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateComponent('Login.supportText')))), /*#__PURE__*/React.createElement(designSystem.Box, {
	    as: "form",
	    action: action,
	    method: "POST",
	    style: {
	      display: 'flex',
	      flexDirection: 'column',
	      gap: 16
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.H5, {
	    marginBottom: "lg"
	  }, branding?.logo ? /*#__PURE__*/React.createElement("img", {
	    src: branding.logo,
	    alt: branding.companyName,
	    style: {
	      maxWidth: 200
	    }
	  }) : branding?.companyName ?? 'Admin'), message ? /*#__PURE__*/React.createElement(designSystem.MessageBox, {
	    my: "lg",
	    message: getMessageText(message, translateMessage),
	    variant: "danger"
	  }) : null, /*#__PURE__*/React.createElement(designSystem.FormGroup, null, /*#__PURE__*/React.createElement(designSystem.Label, {
	    required: true
	  }, translateComponent('Login.properties.email')), /*#__PURE__*/React.createElement(designSystem.Input, {
	    name: "email",
	    type: "email",
	    autoComplete: "off",
	    placeholder: translateComponent('Login.properties.email'),
	    value: email,
	    onChange: handleEmailChange
	  })), /*#__PURE__*/React.createElement(designSystem.FormGroup, null, /*#__PURE__*/React.createElement(designSystem.Label, {
	    required: true
	  }, translateComponent('Login.properties.password')), /*#__PURE__*/React.createElement(designSystem.Input, {
	    type: "password",
	    name: "password",
	    autoComplete: "new-password",
	    placeholder: translateComponent('Login.properties.password'),
	    value: password,
	    onChange: handlePasswordChange
	  })), /*#__PURE__*/React.createElement(designSystem.Box, null, /*#__PURE__*/React.createElement(designSystem.Button, {
	    variant: "contained",
	    color: "primary",
	    style: actionButtonStyle
	  }, translateComponent('Login.loginButton'))))));
	}

	function LoggedIn({
	  session,
	  paths
	}) {
	  const {
	    translateButton
	  } = adminjs.useTranslation();
	  const dropActions = [{
	    label: translateButton('logout'),
	    onClick: event => {
	      event.preventDefault();
	      window.location.href = paths.logoutPath;
	    },
	    icon: 'LogOut'
	  }];
	  return /*#__PURE__*/React.createElement(designSystem.Box, {
	    flexShrink: 0,
	    "data-css": "logged-in"
	  }, /*#__PURE__*/React.createElement(designSystem.CurrentUserNav, {
	    name: session.email,
	    title: session.title,
	    avatarUrl: session.avatarUrl,
	    dropActions: dropActions
	  }));
	}

	const Version = ({
	  versions
	}) => {
	  const {
	    translateLabel
	  } = adminjs.useTranslation();
	  const {
	    admin,
	    app
	  } = versions;
	  return /*#__PURE__*/React.createElement(designSystem.Box, {
	    flex: true,
	    flexGrow: 1,
	    py: "default",
	    px: "xxl",
	    "data-css": "version"
	  }, admin ? /*#__PURE__*/React.createElement(designSystem.Text, {
	    display: ['none', 'block'],
	    color: "grey100",
	    style: {
	      padding: '12px 24px 12px 0'
	    }
	  }, translateLabel('adminVersion', {
	    version: admin
	  })) : null, app ? /*#__PURE__*/React.createElement(designSystem.Text, {
	    display: ['none', 'block'],
	    color: "grey100",
	    style: {
	      padding: '12px 24px 12px 0'
	    }
	  }, translateLabel('appVersion', {
	    version: app
	  })) : null);
	};
	const LanguageSelect = () => {
	  const {
	    i18n,
	    translateComponent
	  } = adminjs.useTranslation();
	  const supportedLngs = i18n?.options?.supportedLngs ?? [];
	  const availableLanguages = supportedLngs.filter(lang => lang !== 'cimode');
	  if (availableLanguages.length <= 1) {
	    return null;
	  }
	  return /*#__PURE__*/React.createElement(designSystem.Box, {
	    flex: true,
	    alignItems: "center"
	  }, /*#__PURE__*/React.createElement(designSystem.DropDown, null, /*#__PURE__*/React.createElement(designSystem.DropDownTrigger, null, /*#__PURE__*/React.createElement(designSystem.Button, {
	    color: "text"
	  }, /*#__PURE__*/React.createElement(designSystem.Icon, {
	    icon: "Globe"
	  }), translateComponent(`LanguageSelector.availableLanguages.${i18n.language}`, {
	    defaultValue: i18n.language
	  }))), /*#__PURE__*/React.createElement(designSystem.DropDownMenu, null, availableLanguages.map(lang => /*#__PURE__*/React.createElement(designSystem.DropDownItem, {
	    key: lang,
	    onClick: () => i18n.changeLanguage(lang)
	  }, translateComponent(`LanguageSelector.availableLanguages.${lang}`, {
	    defaultValue: lang
	  }))))));
	};
	function TopBar({
	  toggleSidebar
	}) {
	  const windowState = typeof window === 'undefined' ? null : window;
	  const reduxState = windowState?.REDUX_STATE ?? {};
	  const session = reduxState.session;
	  const paths = reduxState.paths;
	  const versions = reduxState.versions;
	  const {
	    translateMessage
	  } = adminjs.useTranslation();
	  const rootPath = paths?.rootPath ?? '/admin';
	  const homeLabel = translateMessage('admin-home');
	  return /*#__PURE__*/React.createElement(designSystem.Box, {
	    "data-css": "topbar",
	    style: {
	      height: '64px',
	      borderBottom: '1px solid #E2E8F0',
	      background: '#FFFFFF',
	      display: 'flex',
	      flexDirection: 'row',
	      flexShrink: 0,
	      alignItems: 'center'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Box, {
	    display: "flex",
	    alignItems: "center",
	    style: {
	      gap: 12
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Box, {
	    py: "lg",
	    px: ['default', 'lg'],
	    onClick: toggleSidebar,
	    display: ['block', 'block', 'block', 'block', 'none'],
	    style: {
	      cursor: 'pointer'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Icon, {
	    icon: "Menu",
	    size: 24
	  })), /*#__PURE__*/React.createElement("a", {
	    href: rootPath,
	    className: "admin-home-link"
	  }, /*#__PURE__*/React.createElement(designSystem.Icon, {
	    icon: "Home"
	  }), homeLabel)), /*#__PURE__*/React.createElement(Version, {
	    versions: versions ?? {}
	  }), /*#__PURE__*/React.createElement(LanguageSelect, null), session?.email ? /*#__PURE__*/React.createElement(LoggedIn, {
	    session: session,
	    paths: paths ?? {}
	  }) : '');
	}

	AdminJS.UserComponents = {};
	AdminJS.UserComponents.OrderStatusAction = OrderStatusAction;
	AdminJS.UserComponents.CancelOrderAction = CancelOrderAction;
	AdminJS.UserComponents.Dashboard = Dashboard;
	AdminJS.UserComponents.Login = Login;
	AdminJS.UserComponents.LoggedIn = LoggedIn;
	AdminJS.UserComponents.TopBar = TopBar;

})(React, AdminJS, AdminJSDesignSystem);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9PcmRlclN0YXR1c0FjdGlvbi50c3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9DYW5jZWxPcmRlckFjdGlvbi50c3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9EYXNoYm9hcmQudHN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvTG9naW4udHN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvTG9nZ2VkSW4udHN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvVG9wQmFyLnRzeCIsImVudHJ5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHVzZU1lbW8sIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQXBpQ2xpZW50LCB0eXBlIEFjdGlvblByb3BzLCB1c2VOb3RpY2UsIHVzZVRyYW5zbGF0aW9uIH0gZnJvbSAnYWRtaW5qcyc7XG5pbXBvcnQgeyBCYWRnZSwgQm94LCBCdXR0b24sIEZvcm1Hcm91cCwgU2VsZWN0LCBUZXh0IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSc7XG5cbnR5cGUgT3JkZXJTdGF0dXMgPSAnUEVORElORycgfCAnUEFJRCcgfCAnU0hJUFBFRCcgfCAnREVMSVZFUkVEJyB8ICdDQU5DRUxMRUQnO1xudHlwZSBTdGF0dXNPcHRpb24gPSB7IHZhbHVlOiBPcmRlclN0YXR1czsgbGFiZWw6IHN0cmluZyB9O1xuXG5jb25zdCBhcGkgPSBuZXcgQXBpQ2xpZW50KCk7XG5cbmNvbnN0IHN0YXR1c2VzOiBPcmRlclN0YXR1c1tdID0gWydQRU5ESU5HJywgJ1BBSUQnLCAnU0hJUFBFRCcsICdERUxJVkVSRUQnLCAnQ0FOQ0VMTEVEJ107XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIE9yZGVyU3RhdHVzQWN0aW9uKHsgYWN0aW9uLCByZWNvcmQsIHJlc291cmNlIH06IEFjdGlvblByb3BzKSB7XG5cdGNvbnN0IFtsb2NhbFJlY29yZCwgc2V0TG9jYWxSZWNvcmRdID0gdXNlU3RhdGUocmVjb3JkKTtcblx0Y29uc3QgW3NlbGVjdGVkU3RhdHVzLCBzZXRTZWxlY3RlZFN0YXR1c10gPSB1c2VTdGF0ZTxPcmRlclN0YXR1cz4oXG5cdFx0KHJlY29yZD8ucGFyYW1zLnN0YXR1cyBhcyBPcmRlclN0YXR1cykgPz8gJ1BFTkRJTkcnXG5cdCk7XG5cdGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcblx0Y29uc3QgYWRkTm90aWNlID0gdXNlTm90aWNlKCk7XG5cdGNvbnN0IHsgdHJhbnNsYXRlQWN0aW9uLCB0cmFuc2xhdGVMYWJlbCwgdHJhbnNsYXRlTWVzc2FnZSB9ID0gdXNlVHJhbnNsYXRpb24oKTtcblxuXHRpZiAoIWxvY2FsUmVjb3JkKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxCb3ggdmFyaWFudD0nd2hpdGUnIHA9J3hsJz5cblx0XHRcdFx0PFRleHQ+e3RyYW5zbGF0ZU1lc3NhZ2UoJ3N0YXR1cy11cGRhdGUtZmFpbGVkJyl9PC9UZXh0PlxuXHRcdFx0PC9Cb3g+XG5cdFx0KTtcblx0fVxuXG5cdGNvbnN0IGN1cnJlbnRTdGF0dXMgPSBsb2NhbFJlY29yZC5wYXJhbXMuc3RhdHVzIGFzIE9yZGVyU3RhdHVzIHwgdW5kZWZpbmVkO1xuXHRjb25zdCBzdGF0dXNPcHRpb25zID0gdXNlTWVtbzxTdGF0dXNPcHRpb25bXT4oXG5cdFx0KCkgPT5cblx0XHRcdHN0YXR1c2VzLm1hcCgoc3RhdHVzKSA9PiAoe1xuXHRcdFx0XHR2YWx1ZTogc3RhdHVzLFxuXHRcdFx0XHRsYWJlbDogdHJhbnNsYXRlTGFiZWwoYHN0YXR1cy4ke3N0YXR1c31gLCByZXNvdXJjZS5pZCksXG5cdFx0XHR9KSksXG5cdFx0W3Jlc291cmNlLmlkLCB0cmFuc2xhdGVMYWJlbF1cblx0KTtcblx0Y29uc3QgY3VycmVudExhYmVsID0gY3VycmVudFN0YXR1c1xuXHRcdD8gdHJhbnNsYXRlTGFiZWwoYHN0YXR1cy4ke2N1cnJlbnRTdGF0dXN9YCwgcmVzb3VyY2UuaWQpXG5cdFx0OiB0cmFuc2xhdGVNZXNzYWdlKCdzdGF0dXMtdW5rbm93bicpO1xuXHRjb25zdCBzZWxlY3RlZE9wdGlvbiA9IHN0YXR1c09wdGlvbnMuZmluZCgob3B0aW9uKSA9PiBvcHRpb24udmFsdWUgPT09IHNlbGVjdGVkU3RhdHVzKSA/PyBudWxsO1xuXHRjb25zdCBuZXh0TGFiZWwgPSBzZWxlY3RlZFN0YXR1cyA/IHRyYW5zbGF0ZUxhYmVsKGBzdGF0dXMuJHtzZWxlY3RlZFN0YXR1c31gLCByZXNvdXJjZS5pZCkgOiBudWxsO1xuXG5cdGNvbnN0IGhhbmRsZUNsaWNrID0gYXN5bmMgKCkgPT4ge1xuXHRcdGlmICghbG9jYWxSZWNvcmQgfHwgIXNlbGVjdGVkU3RhdHVzKSByZXR1cm47XG5cdFx0c2V0TG9hZGluZyh0cnVlKTtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcblx0XHRcdGZvcm1EYXRhLmFwcGVuZCgnc3RhdHVzJywgc2VsZWN0ZWRTdGF0dXMpO1xuXHRcdFx0Y29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhcGkucmVjb3JkQWN0aW9uKHtcblx0XHRcdFx0cmVzb3VyY2VJZDogcmVzb3VyY2UuaWQsXG5cdFx0XHRcdHJlY29yZElkOiBsb2NhbFJlY29yZC5pZCxcblx0XHRcdFx0YWN0aW9uTmFtZTogYWN0aW9uLm5hbWUsXG5cdFx0XHRcdG1ldGhvZDogJ3Bvc3QnLFxuXHRcdFx0XHRkYXRhOiBmb3JtRGF0YSxcblx0XHRcdH0pO1xuXHRcdFx0aWYgKHJlc3BvbnNlLmRhdGEubm90aWNlPy50eXBlID09PSAnZXJyb3InKSB7XG5cdFx0XHRcdGFkZE5vdGljZShyZXNwb25zZS5kYXRhLm5vdGljZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRhZGROb3RpY2Uoe1xuXHRcdFx0XHRcdG1lc3NhZ2U6ICdzdGF0dXMtdXBkYXRlZCcsXG5cdFx0XHRcdFx0dHlwZTogJ3N1Y2Nlc3MnLFxuXHRcdFx0XHRcdG9wdGlvbnM6IHsgc3RhdHVzOiBuZXh0TGFiZWwgPz8gc2VsZWN0ZWRTdGF0dXMgfSxcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRpZiAocmVzcG9uc2UuZGF0YS5yZWNvcmQpIHtcblx0XHRcdFx0c2V0TG9jYWxSZWNvcmQocmVzcG9uc2UuZGF0YS5yZWNvcmQpO1xuXHRcdFx0fVxuXHRcdH0gY2F0Y2gge1xuXHRcdFx0YWRkTm90aWNlKHsgbWVzc2FnZTogJ3N0YXR1cy11cGRhdGUtZmFpbGVkJywgdHlwZTogJ2Vycm9yJyB9KTtcblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0c2V0TG9hZGluZyhmYWxzZSk7XG5cdFx0fVxuXHR9O1xuXG5cdGNvbnN0IGJ1dHRvbkxhYmVsID0gbG9hZGluZ1xuXHRcdD8gdHJhbnNsYXRlTWVzc2FnZSgnc3RhdHVzLXVwZGF0ZS1wcm9ncmVzcycpXG5cdFx0OiB0cmFuc2xhdGVNZXNzYWdlKCdhcHBseS1zdGF0dXMnKTtcblx0Y29uc3QgdGl0bGUgPSB0cmFuc2xhdGVBY3Rpb24oYWN0aW9uLm5hbWUsIHJlc291cmNlLmlkKTtcblxuXHRyZXR1cm4gKFxuXHRcdDxCb3hcblx0XHRcdHZhcmlhbnQ9J3doaXRlJ1xuXHRcdFx0cD0neHhsJ1xuXHRcdFx0Ym9yZGVyUmFkaXVzPSd4bCdcblx0XHRcdGJveFNoYWRvdz0nc20nXG5cdFx0XHRtYXhXaWR0aD0nNjgwcHgnXG5cdFx0XHRzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQgI0UyRThGMCcgfX1cblx0XHQ+XG5cdFx0XHQ8Qm94IGRpc3BsYXk9J2ZsZXgnIGFsaWduSXRlbXM9J2NlbnRlcicganVzdGlmeUNvbnRlbnQ9J3NwYWNlLWJldHdlZW4nIG1iPSd4bCc+XG5cdFx0XHRcdDxUZXh0IGZvbnRTaXplPSd4bCcgZm9udFdlaWdodD0nYm9sZCc+XG5cdFx0XHRcdFx0e3RpdGxlfVxuXHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHQ8L0JveD5cblx0XHRcdDxCb3ggc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywgZ2FwOiAyNCB9fT5cblx0XHRcdFx0PEJveCBkaXNwbGF5PSdmbGV4JyBhbGlnbkl0ZW1zPSdjZW50ZXInPlxuXHRcdFx0XHRcdDxUZXh0IGZvbnRTaXplPSdsZycgZm9udFdlaWdodD0nNTAwJyBtcj0nbGcnPlxuXHRcdFx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoJ2N1cnJlbnQtc3RhdHVzJyl9XG5cdFx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0XHRcdDxCYWRnZVxuXHRcdFx0XHRcdFx0Zm9udFNpemU9J21kJ1xuXHRcdFx0XHRcdFx0b3V0bGluZVxuXHRcdFx0XHRcdFx0c3R5bGU9e3tcblx0XHRcdFx0XHRcdFx0YmFja2dyb3VuZDogJyNDNkY2RDUnLFxuXHRcdFx0XHRcdFx0XHRib3JkZXJDb2xvcjogJyMzOEExNjknLFxuXHRcdFx0XHRcdFx0XHRjb2xvcjogJyMyMjU0M0QnLFxuXHRcdFx0XHRcdFx0fX1cblx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHR7Y3VycmVudExhYmVsfVxuXHRcdFx0XHRcdDwvQmFkZ2U+XG5cdFx0XHRcdDwvQm94PlxuXHRcdFx0XHQ8Rm9ybUdyb3VwIGxhYmVsPXt0cmFuc2xhdGVNZXNzYWdlKCdzZWxlY3Qtc3RhdHVzJyl9IG1iPScwJz5cblx0XHRcdFx0XHQ8U2VsZWN0XG5cdFx0XHRcdFx0XHRpc0NsZWFyYWJsZT17ZmFsc2V9XG5cdFx0XHRcdFx0XHRvcHRpb25zPXtzdGF0dXNPcHRpb25zfVxuXHRcdFx0XHRcdFx0dmFsdWU9e3NlbGVjdGVkT3B0aW9ufVxuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyhvcHRpb246IFN0YXR1c09wdGlvbiB8IG51bGwpID0+IHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgdmFsdWUgPSBvcHRpb24/LnZhbHVlO1xuXHRcdFx0XHRcdFx0XHRzZXRTZWxlY3RlZFN0YXR1cyh2YWx1ZSA/PyBjdXJyZW50U3RhdHVzID8/ICdQRU5ESU5HJyk7XG5cdFx0XHRcdFx0XHR9fVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdDwvRm9ybUdyb3VwPlxuXHRcdFx0XHR7bmV4dExhYmVsID8gKFxuXHRcdFx0XHRcdDxCb3ggZGlzcGxheT0nZmxleCcgYWxpZ25JdGVtcz0nY2VudGVyJz5cblx0XHRcdFx0XHRcdDxUZXh0IGZvbnRXZWlnaHQ9JzUwMCcgZm9udFNpemU9J2xnJyBtcj0nbGcnPlxuXHRcdFx0XHRcdFx0XHR7dHJhbnNsYXRlTWVzc2FnZSgnbmV3LXN0YXR1cycpfVxuXHRcdFx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0XHRcdFx0PEJhZGdlXG5cdFx0XHRcdFx0XHRcdGZvbnRTaXplPSdtZCdcblx0XHRcdFx0XHRcdFx0b3V0bGluZVxuXHRcdFx0XHRcdFx0XHRzdHlsZT17e1xuXHRcdFx0XHRcdFx0XHRcdGJhY2tncm91bmQ6ICcjQzZGNkQ1Jyxcblx0XHRcdFx0XHRcdFx0XHRib3JkZXJDb2xvcjogJyMzOEExNjknLFxuXHRcdFx0XHRcdFx0XHRcdGNvbG9yOiAnIzIyNTQzRCcsXG5cdFx0XHRcdFx0XHRcdH19XG5cdFx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHRcdHtuZXh0TGFiZWx9XG5cdFx0XHRcdFx0XHQ8L0JhZGdlPlxuXHRcdFx0XHRcdDwvQm94PlxuXHRcdFx0XHQpIDogbnVsbH1cblx0XHRcdFx0PEJveD5cblx0XHRcdFx0XHQ8QnV0dG9uXG5cdFx0XHRcdFx0XHRzdHlsZT17e1xuXHRcdFx0XHRcdFx0XHRib3JkZXJDb2xvcjogJ3doaXRlJyxcblx0XHRcdFx0XHRcdFx0YmFja2dyb3VuZDogJyNmYWNjMTUnLFxuXHRcdFx0XHRcdFx0XHRjb2xvcjogJ2JsYWNrJyxcblx0XHRcdFx0XHRcdH19XG5cdFx0XHRcdFx0XHR2YXJpYW50PSdjb250YWluZWQnXG5cdFx0XHRcdFx0XHRjb2xvcj0ncHJpbWFyeSdcblx0XHRcdFx0XHRcdG9uQ2xpY2s9e2hhbmRsZUNsaWNrfVxuXHRcdFx0XHRcdFx0ZGlzYWJsZWQ9eyFzZWxlY3RlZFN0YXR1cyB8fCBsb2FkaW5nfVxuXHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdHtidXR0b25MYWJlbH1cblx0XHRcdFx0XHQ8L0J1dHRvbj5cblx0XHRcdFx0PC9Cb3g+XG5cdFx0XHQ8L0JveD5cblx0XHQ8L0JveD5cblx0KTtcbn1cbiIsImltcG9ydCB7IHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQXBpQ2xpZW50LCB0eXBlIEFjdGlvblByb3BzLCB1c2VOb3RpY2UsIHVzZVRyYW5zbGF0aW9uIH0gZnJvbSAnYWRtaW5qcyc7XG5pbXBvcnQgeyBCb3gsIEJ1dHRvbiwgVGV4dCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xuXG5jb25zdCBhcGkgPSBuZXcgQXBpQ2xpZW50KCk7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIENhbmNlbE9yZGVyQWN0aW9uKHsgYWN0aW9uLCByZWNvcmQsIHJlc291cmNlIH06IEFjdGlvblByb3BzKSB7XG5cdGNvbnN0IFtsb2NhbFJlY29yZCwgc2V0TG9jYWxSZWNvcmRdID0gdXNlU3RhdGUocmVjb3JkKTtcblx0Y29uc3QgW3JlZnVuZFBheW1lbnQsIHNldFJlZnVuZFBheW1lbnRdID0gdXNlU3RhdGUoZmFsc2UpO1xuXHRjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG5cdGNvbnN0IGFkZE5vdGljZSA9IHVzZU5vdGljZSgpO1xuXHRjb25zdCB7IHRyYW5zbGF0ZUFjdGlvbiwgdHJhbnNsYXRlTWVzc2FnZSB9ID0gdXNlVHJhbnNsYXRpb24oKTtcblxuXHRpZiAoIWxvY2FsUmVjb3JkKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxCb3ggdmFyaWFudD0nd2hpdGUnIHA9J3hsJz5cblx0XHRcdFx0PFRleHQ+e3RyYW5zbGF0ZU1lc3NhZ2UoJ3N0YXR1cy11cGRhdGUtZmFpbGVkJyl9PC9UZXh0PlxuXHRcdFx0PC9Cb3g+XG5cdFx0KTtcblx0fVxuXG5cdGNvbnN0IHN0cmlwZVNlc3Npb25JZCA9IGxvY2FsUmVjb3JkLnBhcmFtcy5zdHJpcGVTZXNzaW9uSWQgYXMgc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHRjb25zdCBjYW5SZWZ1bmQgPSBCb29sZWFuKHN0cmlwZVNlc3Npb25JZCk7XG5cdGNvbnN0IHRpdGxlID0gdHJhbnNsYXRlQWN0aW9uKGFjdGlvbi5uYW1lLCByZXNvdXJjZS5pZCk7XG5cdGNvbnN0IGJ1dHRvbkxhYmVsID0gbG9hZGluZyA/IHRyYW5zbGF0ZU1lc3NhZ2UoJ2NhbmNlbC1vcmRlci1wcm9ncmVzcycpIDogdGl0bGU7XG5cblx0Y29uc3QgaGFuZGxlQ2FuY2VsID0gYXN5bmMgKCkgPT4ge1xuXHRcdGlmICghbG9jYWxSZWNvcmQpIHJldHVybjtcblx0XHRzZXRMb2FkaW5nKHRydWUpO1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuXHRcdFx0Zm9ybURhdGEuYXBwZW5kKCdyZWZ1bmQnLCByZWZ1bmRQYXltZW50ID8gJ3RydWUnIDogJ2ZhbHNlJyk7XG5cdFx0XHRjb25zdCByZXNwb25zZSA9IGF3YWl0IGFwaS5yZWNvcmRBY3Rpb24oe1xuXHRcdFx0XHRyZXNvdXJjZUlkOiByZXNvdXJjZS5pZCxcblx0XHRcdFx0cmVjb3JkSWQ6IGxvY2FsUmVjb3JkLmlkLFxuXHRcdFx0XHRhY3Rpb25OYW1lOiBhY3Rpb24ubmFtZSxcblx0XHRcdFx0bWV0aG9kOiAncG9zdCcsXG5cdFx0XHRcdGRhdGE6IGZvcm1EYXRhLFxuXHRcdFx0fSk7XG5cdFx0XHRpZiAocmVzcG9uc2UuZGF0YS5ub3RpY2UpIHtcblx0XHRcdFx0YWRkTm90aWNlKHJlc3BvbnNlLmRhdGEubm90aWNlKTtcblx0XHRcdH1cblx0XHRcdGlmIChyZXNwb25zZS5kYXRhLnJlY29yZCkge1xuXHRcdFx0XHRzZXRMb2NhbFJlY29yZChyZXNwb25zZS5kYXRhLnJlY29yZCk7XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCB7XG5cdFx0XHRhZGROb3RpY2UoeyBtZXNzYWdlOiAnc3RhdHVzLXVwZGF0ZS1mYWlsZWQnLCB0eXBlOiAnZXJyb3InIH0pO1xuXHRcdH0gZmluYWxseSB7XG5cdFx0XHRzZXRMb2FkaW5nKGZhbHNlKTtcblx0XHR9XG5cdH07XG5cblx0cmV0dXJuIChcblx0XHQ8Qm94XG5cdFx0XHR2YXJpYW50PSd3aGl0ZSdcblx0XHRcdHA9J3h4bCdcblx0XHRcdGJvcmRlclJhZGl1cz0neGwnXG5cdFx0XHRib3hTaGFkb3c9J3NtJ1xuXHRcdFx0bWF4V2lkdGg9JzY4MHB4J1xuXHRcdFx0c3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnIH19XG5cdFx0PlxuXHRcdFx0PEJveCBkaXNwbGF5PSdmbGV4JyBhbGlnbkl0ZW1zPSdjZW50ZXInIGp1c3RpZnlDb250ZW50PSdzcGFjZS1iZXR3ZWVuJyBtYj0neGwnPlxuXHRcdFx0XHQ8VGV4dCBmb250U2l6ZT0neGwnIGZvbnRXZWlnaHQ9J2JvbGQnPlxuXHRcdFx0XHRcdHt0aXRsZX1cblx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0PC9Cb3g+XG5cdFx0XHQ8Qm94IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGdhcDogMTYgfX0+XG5cdFx0XHRcdDxCb3hcblx0XHRcdFx0XHRhcz0nbGFiZWwnXG5cdFx0XHRcdFx0ZGlzcGxheT0nZmxleCdcblx0XHRcdFx0XHRhbGlnbkl0ZW1zPSdjZW50ZXInXG5cdFx0XHRcdFx0c3R5bGU9e3sgZ2FwOiAxMCwgY3Vyc29yOiBjYW5SZWZ1bmQgPyAncG9pbnRlcicgOiAnbm90LWFsbG93ZWQnIH19XG5cdFx0XHRcdD5cblx0XHRcdFx0XHQ8aW5wdXRcblx0XHRcdFx0XHRcdHR5cGU9J2NoZWNrYm94J1xuXHRcdFx0XHRcdFx0Y2hlY2tlZD17cmVmdW5kUGF5bWVudH1cblx0XHRcdFx0XHRcdGRpc2FibGVkPXshY2FuUmVmdW5kfVxuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyhldmVudCkgPT4gc2V0UmVmdW5kUGF5bWVudChldmVudC50YXJnZXQuY2hlY2tlZCl9XG5cdFx0XHRcdFx0XHRzdHlsZT17eyB3aWR0aDogMTYsIGhlaWdodDogMTYgfX1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHRcdDxUZXh0Pnt0cmFuc2xhdGVNZXNzYWdlKCdyZWZ1bmQtcGF5bWVudCcpfTwvVGV4dD5cblx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdHshY2FuUmVmdW5kID8gKFxuXHRcdFx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnIGZvbnRTaXplPSdzbSc+XG5cdFx0XHRcdFx0XHR7dHJhbnNsYXRlTWVzc2FnZSgncmVmdW5kLXBheW1lbnQtaGludCcpfVxuXHRcdFx0XHRcdDwvVGV4dD5cblx0XHRcdFx0KSA6IG51bGx9XG5cdFx0XHRcdDxCb3g+XG5cdFx0XHRcdFx0PEJ1dHRvblxuXHRcdFx0XHRcdFx0c3R5bGU9e3tcblx0XHRcdFx0XHRcdFx0Ym9yZGVyQ29sb3I6ICd3aGl0ZScsXG5cdFx0XHRcdFx0XHRcdGJhY2tncm91bmQ6ICcjZmFjYzE1Jyxcblx0XHRcdFx0XHRcdFx0Y29sb3I6ICdibGFjaycsXG5cdFx0XHRcdFx0XHR9fVxuXHRcdFx0XHRcdFx0dmFyaWFudD0nY29udGFpbmVkJ1xuXHRcdFx0XHRcdFx0Y29sb3I9J3ByaW1hcnknXG5cdFx0XHRcdFx0XHRvbkNsaWNrPXtoYW5kbGVDYW5jZWx9XG5cdFx0XHRcdFx0XHRkaXNhYmxlZD17bG9hZGluZ31cblx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHR7YnV0dG9uTGFiZWx9XG5cdFx0XHRcdFx0PC9CdXR0b24+XG5cdFx0XHRcdDwvQm94PlxuXHRcdFx0PC9Cb3g+XG5cdFx0PC9Cb3g+XG5cdCk7XG59XG4iLCJpbXBvcnQgeyB1c2VUcmFuc2xhdGlvbiB9IGZyb20gJ2FkbWluanMnO1xuaW1wb3J0IHsgQm94LCBCdXR0b24sIEgyLCBINCwgSDUsIElsbHVzdHJhdGlvbiwgVGV4dCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xuXG50eXBlIFF1aWNrQWN0aW9uID0ge1xuXHRrZXk6IHN0cmluZztcblx0cGF0aDogc3RyaW5nO1xufTtcblxuY29uc3QgcXVpY2tBY3Rpb25zOiBRdWlja0FjdGlvbltdID0gW1xuXHR7IGtleTogJ29yZGVycycsIHBhdGg6ICdyZXNvdXJjZXMvT3JkZXInIH0sXG5cdHsga2V5OiAncHJvZHVjdHMnLCBwYXRoOiAncmVzb3VyY2VzL1Byb2R1Y3QnIH0sXG5cdHsga2V5OiAnY3VzdG9tZXJzJywgcGF0aDogJ3Jlc291cmNlcy9Vc2VyJyB9LFxuXHR7IGtleTogJ3Jldmlld3MnLCBwYXRoOiAncmVzb3VyY2VzL1JldmlldycgfSxcbl07XG5cbmNvbnN0IGFjdGlvbkJ1dHRvblN0eWxlID0ge1xuXHRib3JkZXJDb2xvcjogJ3doaXRlJyxcblx0YmFja2dyb3VuZDogJyNmYWNjMTUnLFxuXHRjb2xvcjogJ2JsYWNrJyxcbn07XG5cbmNvbnN0IHJlc29sdmVQYXRoID0gKHBhdGg6IHN0cmluZykgPT4ge1xuXHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybiBwYXRoO1xuXHRjb25zdCBnbG9iYWxBbnkgPSB3aW5kb3cgYXMgdHlwZW9mIHdpbmRvdyAmIHtcblx0XHRSRURVWF9TVEFURT86IHsgcGF0aHM/OiB7IHJvb3RQYXRoPzogc3RyaW5nIH0gfTtcblx0fTtcblx0Y29uc3Qgcm9vdFBhdGggPSBnbG9iYWxBbnkuUkVEVVhfU1RBVEU/LnBhdGhzPy5yb290UGF0aCA/PyAnJztcblx0Y29uc3Qgbm9ybWFsaXplZFJvb3QgPSByb290UGF0aC5yZXBsYWNlKC9cXC8kLywgJycpO1xuXHRjb25zdCBub3JtYWxpemVkUGF0aCA9IHBhdGgucmVwbGFjZSgvXlxcLy8sICcnKTtcblx0aWYgKCFub3JtYWxpemVkUm9vdCkgcmV0dXJuIHBhdGg7XG5cdHJldHVybiBgJHtub3JtYWxpemVkUm9vdH0vJHtub3JtYWxpemVkUGF0aH1gO1xufTtcblxuY29uc3QgZ29UbyA9IChwYXRoOiBzdHJpbmcpID0+ICgpID0+IHtcblx0aWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0d2luZG93LmxvY2F0aW9uLmFzc2lnbihyZXNvbHZlUGF0aChwYXRoKSk7XG5cdH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIERhc2hib2FyZCgpIHtcblx0Y29uc3QgeyB0cmFuc2xhdGVNZXNzYWdlIH0gPSB1c2VUcmFuc2xhdGlvbigpO1xuXG5cdHJldHVybiAoXG5cdFx0PEJveCB2YXJpYW50PSdncmV5JyBwPSd4eGwnPlxuXHRcdFx0PEJveFxuXHRcdFx0XHR2YXJpYW50PSd3aGl0ZSdcblx0XHRcdFx0cD0neHhsJ1xuXHRcdFx0XHRib3JkZXJSYWRpdXM9J3hsJ1xuXHRcdFx0XHRib3hTaGFkb3c9J3NtJ1xuXHRcdFx0XHRzdHlsZT17e1xuXHRcdFx0XHRcdGRpc3BsYXk6ICdmbGV4Jyxcblx0XHRcdFx0XHRhbGlnbkl0ZW1zOiAnY2VudGVyJyxcblx0XHRcdFx0XHRqdXN0aWZ5Q29udGVudDogJ3NwYWNlLWJldHdlZW4nLFxuXHRcdFx0XHRcdGdhcDogMzIsXG5cdFx0XHRcdFx0ZmxleFdyYXA6ICd3cmFwJyxcblx0XHRcdFx0fX1cblx0XHRcdD5cblx0XHRcdFx0PEJveCBzdHlsZT17eyBtYXhXaWR0aDogNTIwIH19PlxuXHRcdFx0XHRcdDxIMiBtYj0nbGcnPnt0cmFuc2xhdGVNZXNzYWdlKCdkYXNoYm9hcmQudGl0bGUnKX08L0gyPlxuXHRcdFx0XHRcdDxUZXh0IGZvbnRTaXplPSdsZycgbWI9J3hsJz5cblx0XHRcdFx0XHRcdHt0cmFuc2xhdGVNZXNzYWdlKCdkYXNoYm9hcmQuc3VidGl0bGUnKX1cblx0XHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHRcdFx0PEJveCBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGdhcDogMTIsIGZsZXhXcmFwOiAnd3JhcCcgfX0+XG5cdFx0XHRcdFx0XHQ8QnV0dG9uXG5cdFx0XHRcdFx0XHRcdHZhcmlhbnQ9J2NvbnRhaW5lZCdcblx0XHRcdFx0XHRcdFx0Y29sb3I9J3ByaW1hcnknXG5cdFx0XHRcdFx0XHRcdHN0eWxlPXthY3Rpb25CdXR0b25TdHlsZX1cblx0XHRcdFx0XHRcdFx0b25DbGljaz17Z29UbygncmVzb3VyY2VzL09yZGVyJyl9XG5cdFx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHRcdHt0cmFuc2xhdGVNZXNzYWdlKCdkYXNoYm9hcmQucHJpbWFyeUFjdGlvbnMub3JkZXJzJyl9XG5cdFx0XHRcdFx0XHQ8L0J1dHRvbj5cblx0XHRcdFx0XHRcdDxCdXR0b25cblx0XHRcdFx0XHRcdFx0dmFyaWFudD0nY29udGFpbmVkJ1xuXHRcdFx0XHRcdFx0XHRjb2xvcj0ncHJpbWFyeSdcblx0XHRcdFx0XHRcdFx0c3R5bGU9e2FjdGlvbkJ1dHRvblN0eWxlfVxuXHRcdFx0XHRcdFx0XHRvbkNsaWNrPXtnb1RvKCdyZXNvdXJjZXMvUHJvZHVjdCcpfVxuXHRcdFx0XHRcdFx0PlxuXHRcdFx0XHRcdFx0XHR7dHJhbnNsYXRlTWVzc2FnZSgnZGFzaGJvYXJkLnByaW1hcnlBY3Rpb25zLnByb2R1Y3RzJyl9XG5cdFx0XHRcdFx0XHQ8L0J1dHRvbj5cblx0XHRcdFx0XHRcdDxCdXR0b25cblx0XHRcdFx0XHRcdFx0dmFyaWFudD0nY29udGFpbmVkJ1xuXHRcdFx0XHRcdFx0XHRjb2xvcj0ncHJpbWFyeSdcblx0XHRcdFx0XHRcdFx0c3R5bGU9e2FjdGlvbkJ1dHRvblN0eWxlfVxuXHRcdFx0XHRcdFx0XHRvbkNsaWNrPXtnb1RvKCdyZXNvdXJjZXMvUmV2aWV3Jyl9XG5cdFx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHRcdHt0cmFuc2xhdGVNZXNzYWdlKCdkYXNoYm9hcmQucHJpbWFyeUFjdGlvbnMucmV2aWV3cycpfVxuXHRcdFx0XHRcdFx0PC9CdXR0b24+XG5cdFx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdDwvQm94PlxuXHRcdFx0XHQ8Qm94IHN0eWxlPXt7IG1pbldpZHRoOiAyNDAsIGRpc3BsYXk6ICdmbGV4JywganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInIH19PlxuXHRcdFx0XHRcdDxJbGx1c3RyYXRpb24gdmFyaWFudD0nQmFnJyB3aWR0aD17MjAwfSBoZWlnaHQ9ezE4MH0gLz5cblx0XHRcdFx0PC9Cb3g+XG5cdFx0XHQ8L0JveD5cblxuXHRcdFx0PEJveCBtdD0neHhsJz5cblx0XHRcdFx0PEg0Pnt0cmFuc2xhdGVNZXNzYWdlKCdkYXNoYm9hcmQuZGFpbHlGb2N1cy50aXRsZScpfTwvSDQ+XG5cdFx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnPnt0cmFuc2xhdGVNZXNzYWdlKCdkYXNoYm9hcmQuZGFpbHlGb2N1cy5zdWJ0aXRsZScpfTwvVGV4dD5cblx0XHRcdDwvQm94PlxuXG5cdFx0XHQ8Qm94XG5cdFx0XHRcdG10PSdsZydcblx0XHRcdFx0c3R5bGU9e3tcblx0XHRcdFx0XHRkaXNwbGF5OiAnZ3JpZCcsXG5cdFx0XHRcdFx0Z3JpZFRlbXBsYXRlQ29sdW1uczogJ3JlcGVhdChhdXRvLWZpdCwgbWlubWF4KDI0MHB4LCAxZnIpKScsXG5cdFx0XHRcdFx0Z2FwOiAxNixcblx0XHRcdFx0fX1cblx0XHRcdD5cblx0XHRcdFx0e3F1aWNrQWN0aW9ucy5tYXAoKGFjdGlvbikgPT4gKFxuXHRcdFx0XHRcdDxCb3hcblx0XHRcdFx0XHRcdGtleT17YWN0aW9uLmtleX1cblx0XHRcdFx0XHRcdHZhcmlhbnQ9J3doaXRlJ1xuXHRcdFx0XHRcdFx0cD0neGwnXG5cdFx0XHRcdFx0XHRib3JkZXJSYWRpdXM9J3hsJ1xuXHRcdFx0XHRcdFx0Ym94U2hhZG93PSdzbSdcblx0XHRcdFx0XHRcdHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJyB9fVxuXHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdDxINSBtYj0nbWQnPnt0cmFuc2xhdGVNZXNzYWdlKGBkYXNoYm9hcmQuY2FyZHMuJHthY3Rpb24ua2V5fS50aXRsZWApfTwvSDU+XG5cdFx0XHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJyBtYj0neGwnPlxuXHRcdFx0XHRcdFx0XHR7dHJhbnNsYXRlTWVzc2FnZShgZGFzaGJvYXJkLmNhcmRzLiR7YWN0aW9uLmtleX0uZGVzY3JpcHRpb25gKX1cblx0XHRcdFx0XHRcdDwvVGV4dD5cblx0XHRcdFx0XHRcdDxCdXR0b25cblx0XHRcdFx0XHRcdFx0dmFyaWFudD0nY29udGFpbmVkJ1xuXHRcdFx0XHRcdFx0XHRjb2xvcj0ncHJpbWFyeSdcblx0XHRcdFx0XHRcdFx0c3R5bGU9e2FjdGlvbkJ1dHRvblN0eWxlfVxuXHRcdFx0XHRcdFx0XHRvbkNsaWNrPXtnb1RvKGFjdGlvbi5wYXRoKX1cblx0XHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoYGRhc2hib2FyZC5jYXJkcy4ke2FjdGlvbi5rZXl9LmJ1dHRvbmApfVxuXHRcdFx0XHRcdFx0PC9CdXR0b24+XG5cdFx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdCkpfVxuXHRcdFx0PC9Cb3g+XG5cdFx0PC9Cb3g+XG5cdCk7XG59XG4iLCJpbXBvcnQgeyB1c2VUcmFuc2xhdGlvbiB9IGZyb20gJ2FkbWluanMnO1xuaW1wb3J0IHsgQm94LCBCdXR0b24sIEZvcm1Hcm91cCwgSDIsIEg1LCBJbGx1c3RyYXRpb24sIElucHV0LCBMYWJlbCwgTWVzc2FnZUJveCwgVGV4dCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xuaW1wb3J0IHsgdXNlU3RhdGUsIHR5cGUgQ2hhbmdlRXZlbnQgfSBmcm9tICdyZWFjdCc7XG5cbnR5cGUgTG9naW5TdGF0ZSA9IHtcblx0YWN0aW9uPzogc3RyaW5nO1xuXHRlcnJvck1lc3NhZ2U/OiBzdHJpbmcgfCBudWxsO1xufTtcblxudHlwZSBCcmFuZGluZ1N0YXRlID0ge1xuXHRsb2dvPzogc3RyaW5nO1xuXHRjb21wYW55TmFtZT86IHN0cmluZztcblx0d2l0aE1hZGVXaXRoTG92ZT86IGJvb2xlYW47XG59O1xuXG50eXBlIFdpbmRvd1dpdGhBZG1pblN0YXRlID0gV2luZG93ICYge1xuXHRfX0FQUF9TVEFURV9fPzogTG9naW5TdGF0ZTtcblx0UkVEVVhfU1RBVEU/OiB7XG5cdFx0YnJhbmRpbmc/OiBCcmFuZGluZ1N0YXRlO1xuXHR9O1xufTtcblxuY29uc3QgYWN0aW9uQnV0dG9uU3R5bGUgPSB7XG5cdGJvcmRlckNvbG9yOiAnd2hpdGUnLFxuXHRiYWNrZ3JvdW5kOiAnI2ZhY2MxNScsXG5cdGNvbG9yOiAnYmxhY2snLFxufTtcblxuY29uc3QgZ2V0TWVzc2FnZVRleHQgPSAobWVzc2FnZTogc3RyaW5nLCB0cmFuc2xhdGVNZXNzYWdlOiAoa2V5OiBzdHJpbmcpID0+IHN0cmluZykgPT5cblx0bWVzc2FnZS5zcGxpdCgnICcpLmxlbmd0aCA+IDEgPyBtZXNzYWdlIDogdHJhbnNsYXRlTWVzc2FnZShtZXNzYWdlKTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gTG9naW4oKSB7XG5cdGNvbnN0IHdpbmRvd1N0YXRlID0gd2luZG93IGFzIFdpbmRvd1dpdGhBZG1pblN0YXRlO1xuXHRjb25zdCBwcm9wcyA9IHdpbmRvd1N0YXRlLl9fQVBQX1NUQVRFX187XG5cdGNvbnN0IGFjdGlvbiA9IHByb3BzPy5hY3Rpb24gPz8gJyc7XG5cdGNvbnN0IG1lc3NhZ2UgPSBwcm9wcz8uZXJyb3JNZXNzYWdlID8/IHVuZGVmaW5lZDtcblx0Y29uc3QgYnJhbmRpbmcgPSB3aW5kb3dTdGF0ZS5SRURVWF9TVEFURT8uYnJhbmRpbmcgPz8ge307XG5cdGNvbnN0IHsgdHJhbnNsYXRlQ29tcG9uZW50LCB0cmFuc2xhdGVNZXNzYWdlIH0gPSB1c2VUcmFuc2xhdGlvbigpO1xuXHRjb25zdCBbZW1haWwsIHNldEVtYWlsXSA9IHVzZVN0YXRlKCcnKTtcblx0Y29uc3QgW3Bhc3N3b3JkLCBzZXRQYXNzd29yZF0gPSB1c2VTdGF0ZSgnJyk7XG5cblx0Y29uc3QgaGFuZGxlRW1haWxDaGFuZ2UgPSAoZXZlbnQ6IENoYW5nZUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+KSA9PiB7XG5cdFx0c2V0RW1haWwoZXZlbnQudGFyZ2V0LnZhbHVlKTtcblx0fTtcblxuXHRjb25zdCBoYW5kbGVQYXNzd29yZENoYW5nZSA9IChldmVudDogQ2hhbmdlRXZlbnQ8SFRNTElucHV0RWxlbWVudD4pID0+IHtcblx0XHRzZXRQYXNzd29yZChldmVudC50YXJnZXQudmFsdWUpO1xuXHR9O1xuXG5cdHJldHVybiAoXG5cdFx0PEJveFxuXHRcdFx0dmFyaWFudD0nZ3JleSdcblx0XHRcdGZsZXhcblx0XHRcdHN0eWxlPXt7XG5cdFx0XHRcdG1pbkhlaWdodDogJzEwMCUnLFxuXHRcdFx0XHRhbGlnbkl0ZW1zOiAnY2VudGVyJyxcblx0XHRcdFx0anVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxuXHRcdFx0XHRwYWRkaW5nOiAnMzJweCAxNnB4Jyxcblx0XHRcdH19XG5cdFx0PlxuXHRcdFx0PEJveFxuXHRcdFx0XHR2YXJpYW50PSd3aGl0ZSdcblx0XHRcdFx0cD0neHhsJ1xuXHRcdFx0XHRib3JkZXJSYWRpdXM9J3hsJ1xuXHRcdFx0XHRib3hTaGFkb3c9J3NtJ1xuXHRcdFx0XHRzdHlsZT17e1xuXHRcdFx0XHRcdHdpZHRoOiAnbWluKDk2MHB4LCAxMDAlKScsXG5cdFx0XHRcdFx0ZGlzcGxheTogJ2dyaWQnLFxuXHRcdFx0XHRcdGdyaWRUZW1wbGF0ZUNvbHVtbnM6ICdyZXBlYXQoYXV0by1maXQsIG1pbm1heCgyODBweCwgMWZyKSknLFxuXHRcdFx0XHRcdGdhcDogMzIsXG5cdFx0XHRcdH19XG5cdFx0XHQ+XG5cdFx0XHRcdDxCb3ggc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywgZ2FwOiAxNiB9fT5cblx0XHRcdFx0XHQ8SDI+e3RyYW5zbGF0ZUNvbXBvbmVudCgnTG9naW4udGl0bGUnKX08L0gyPlxuXHRcdFx0XHRcdDxUZXh0IGZvbnRTaXplPSdsZyc+e3RyYW5zbGF0ZUNvbXBvbmVudCgnTG9naW4uc3VidGl0bGUnKX08L1RleHQ+XG5cdFx0XHRcdFx0PEJveFxuXHRcdFx0XHRcdFx0dmFyaWFudD0nZ3JleSdcblx0XHRcdFx0XHRcdGJvcmRlclJhZGl1cz0neGwnXG5cdFx0XHRcdFx0XHRwPSd4bCdcblx0XHRcdFx0XHRcdHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGdhcDogMTYgfX1cblx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHQ8SWxsdXN0cmF0aW9uIHZhcmlhbnQ9J0JhZycgd2lkdGg9ezEyMH0gaGVpZ2h0PXsxMTB9IC8+XG5cdFx0XHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJz57dHJhbnNsYXRlQ29tcG9uZW50KCdMb2dpbi5zdXBwb3J0VGV4dCcpfTwvVGV4dD5cblx0XHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdDxCb3ggYXM9J2Zvcm0nIGFjdGlvbj17YWN0aW9ufSBtZXRob2Q9J1BPU1QnIHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGdhcDogMTYgfX0+XG5cdFx0XHRcdFx0PEg1IG1hcmdpbkJvdHRvbT0nbGcnPlxuXHRcdFx0XHRcdFx0e2JyYW5kaW5nPy5sb2dvID8gKFxuXHRcdFx0XHRcdFx0XHQ8aW1nXG5cdFx0XHRcdFx0XHRcdFx0c3JjPXticmFuZGluZy5sb2dvfVxuXHRcdFx0XHRcdFx0XHRcdGFsdD17YnJhbmRpbmcuY29tcGFueU5hbWV9XG5cdFx0XHRcdFx0XHRcdFx0c3R5bGU9e3sgbWF4V2lkdGg6IDIwMCB9fVxuXHRcdFx0XHRcdFx0XHQvPlxuXHRcdFx0XHRcdFx0KSA6IChcblx0XHRcdFx0XHRcdFx0YnJhbmRpbmc/LmNvbXBhbnlOYW1lID8/ICdBZG1pbidcblx0XHRcdFx0XHRcdCl9XG5cdFx0XHRcdFx0PC9INT5cblx0XHRcdFx0XHR7bWVzc2FnZSA/IChcblx0XHRcdFx0XHRcdDxNZXNzYWdlQm94XG5cdFx0XHRcdFx0XHRcdG15PSdsZydcblx0XHRcdFx0XHRcdFx0bWVzc2FnZT17Z2V0TWVzc2FnZVRleHQobWVzc2FnZSwgdHJhbnNsYXRlTWVzc2FnZSl9XG5cdFx0XHRcdFx0XHRcdHZhcmlhbnQ9J2Rhbmdlcidcblx0XHRcdFx0XHRcdC8+XG5cdFx0XHRcdFx0KSA6IG51bGx9XG5cdFx0XHRcdFx0PEZvcm1Hcm91cD5cblx0XHRcdFx0XHRcdDxMYWJlbCByZXF1aXJlZD57dHJhbnNsYXRlQ29tcG9uZW50KCdMb2dpbi5wcm9wZXJ0aWVzLmVtYWlsJyl9PC9MYWJlbD5cblx0XHRcdFx0XHRcdDxJbnB1dFxuXHRcdFx0XHRcdFx0XHRuYW1lPSdlbWFpbCdcblx0XHRcdFx0XHRcdFx0dHlwZT0nZW1haWwnXG5cdFx0XHRcdFx0XHRcdGF1dG9Db21wbGV0ZT0nb2ZmJ1xuXHRcdFx0XHRcdFx0XHRwbGFjZWhvbGRlcj17dHJhbnNsYXRlQ29tcG9uZW50KCdMb2dpbi5wcm9wZXJ0aWVzLmVtYWlsJyl9XG5cdFx0XHRcdFx0XHRcdHZhbHVlPXtlbWFpbH1cblx0XHRcdFx0XHRcdFx0b25DaGFuZ2U9e2hhbmRsZUVtYWlsQ2hhbmdlfVxuXHRcdFx0XHRcdFx0Lz5cblx0XHRcdFx0XHQ8L0Zvcm1Hcm91cD5cblx0XHRcdFx0XHQ8Rm9ybUdyb3VwPlxuXHRcdFx0XHRcdFx0PExhYmVsIHJlcXVpcmVkPnt0cmFuc2xhdGVDb21wb25lbnQoJ0xvZ2luLnByb3BlcnRpZXMucGFzc3dvcmQnKX08L0xhYmVsPlxuXHRcdFx0XHRcdFx0PElucHV0XG5cdFx0XHRcdFx0XHRcdHR5cGU9J3Bhc3N3b3JkJ1xuXHRcdFx0XHRcdFx0XHRuYW1lPSdwYXNzd29yZCdcblx0XHRcdFx0XHRcdFx0YXV0b0NvbXBsZXRlPSduZXctcGFzc3dvcmQnXG5cdFx0XHRcdFx0XHRcdHBsYWNlaG9sZGVyPXt0cmFuc2xhdGVDb21wb25lbnQoJ0xvZ2luLnByb3BlcnRpZXMucGFzc3dvcmQnKX1cblx0XHRcdFx0XHRcdFx0dmFsdWU9e3Bhc3N3b3JkfVxuXHRcdFx0XHRcdFx0XHRvbkNoYW5nZT17aGFuZGxlUGFzc3dvcmRDaGFuZ2V9XG5cdFx0XHRcdFx0XHQvPlxuXHRcdFx0XHRcdDwvRm9ybUdyb3VwPlxuXHRcdFx0XHRcdDxCb3g+XG5cdFx0XHRcdFx0XHQ8QnV0dG9uIHZhcmlhbnQ9J2NvbnRhaW5lZCcgY29sb3I9J3ByaW1hcnknIHN0eWxlPXthY3Rpb25CdXR0b25TdHlsZX0+XG5cdFx0XHRcdFx0XHRcdHt0cmFuc2xhdGVDb21wb25lbnQoJ0xvZ2luLmxvZ2luQnV0dG9uJyl9XG5cdFx0XHRcdFx0XHQ8L0J1dHRvbj5cblx0XHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0PC9Cb3g+XG5cdFx0XHQ8L0JveD5cblx0XHQ8L0JveD5cblx0KTtcbn1cbiIsImltcG9ydCB7IHVzZVRyYW5zbGF0aW9uIH0gZnJvbSAnYWRtaW5qcyc7XG5pbXBvcnQgeyBCb3gsIEN1cnJlbnRVc2VyTmF2IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSc7XG5cbnR5cGUgTG9nZ2VkSW5Qcm9wcyA9IHtcblx0c2Vzc2lvbjoge1xuXHRcdGVtYWlsPzogc3RyaW5nO1xuXHRcdHRpdGxlPzogc3RyaW5nO1xuXHRcdGF2YXRhclVybD86IHN0cmluZztcblx0fTtcblx0cGF0aHM6IHtcblx0XHRsb2dvdXRQYXRoOiBzdHJpbmc7XG5cdH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBMb2dnZWRJbih7IHNlc3Npb24sIHBhdGhzIH06IExvZ2dlZEluUHJvcHMpIHtcblx0Y29uc3QgeyB0cmFuc2xhdGVCdXR0b24gfSA9IHVzZVRyYW5zbGF0aW9uKCk7XG5cblx0Y29uc3QgZHJvcEFjdGlvbnMgPSBbXG5cdFx0e1xuXHRcdFx0bGFiZWw6IHRyYW5zbGF0ZUJ1dHRvbignbG9nb3V0JyksXG5cdFx0XHRvbkNsaWNrOiAoZXZlbnQ6IEV2ZW50KSA9PiB7XG5cdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gcGF0aHMubG9nb3V0UGF0aDtcblx0XHRcdH0sXG5cdFx0XHRpY29uOiAnTG9nT3V0Jyxcblx0XHR9LFxuXHRdO1xuXG5cdHJldHVybiAoXG5cdFx0PEJveCBmbGV4U2hyaW5rPXswfSBkYXRhLWNzcz0nbG9nZ2VkLWluJz5cblx0XHRcdDxDdXJyZW50VXNlck5hdlxuXHRcdFx0XHRuYW1lPXtzZXNzaW9uLmVtYWlsfVxuXHRcdFx0XHR0aXRsZT17c2Vzc2lvbi50aXRsZX1cblx0XHRcdFx0YXZhdGFyVXJsPXtzZXNzaW9uLmF2YXRhclVybH1cblx0XHRcdFx0ZHJvcEFjdGlvbnM9e2Ryb3BBY3Rpb25zfVxuXHRcdFx0Lz5cblx0XHQ8L0JveD5cblx0KTtcbn1cbiIsImltcG9ydCB7IHVzZVRyYW5zbGF0aW9uIH0gZnJvbSAnYWRtaW5qcyc7XG5pbXBvcnQge1xuXHRCb3gsXG5cdEJ1dHRvbixcblx0RHJvcERvd24sXG5cdERyb3BEb3duSXRlbSxcblx0RHJvcERvd25NZW51LFxuXHREcm9wRG93blRyaWdnZXIsXG5cdEljb24sXG5cdFRleHQsXG59IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xuaW1wb3J0IExvZ2dlZEluIGZyb20gJy4vTG9nZ2VkSW4nO1xuXG50eXBlIFRvcEJhclByb3BzID0ge1xuXHR0b2dnbGVTaWRlYmFyOiAoKSA9PiB2b2lkO1xufTtcblxudHlwZSBBZG1pblN0YXRlID0ge1xuXHRzZXNzaW9uPzogeyBlbWFpbD86IHN0cmluZzsgdGl0bGU/OiBzdHJpbmc7IGF2YXRhclVybD86IHN0cmluZyB9O1xuXHRwYXRocz86IHsgcm9vdFBhdGg/OiBzdHJpbmc7IGxvZ291dFBhdGg/OiBzdHJpbmcgfTtcblx0dmVyc2lvbnM/OiB7IGFkbWluPzogc3RyaW5nOyBhcHA/OiBzdHJpbmcgfTtcbn07XG5cbnR5cGUgVmVyc2lvbnMgPSB7XG5cdGFkbWluPzogc3RyaW5nO1xuXHRhcHA/OiBzdHJpbmc7XG59O1xuXG50eXBlIFdpbmRvd1dpdGhBZG1pblN0YXRlID0gV2luZG93ICYge1xuXHRSRURVWF9TVEFURT86IEFkbWluU3RhdGU7XG59O1xuXG5jb25zdCBWZXJzaW9uID0gKHsgdmVyc2lvbnMgfTogeyB2ZXJzaW9uczogVmVyc2lvbnMgfSkgPT4ge1xuXHRjb25zdCB7IHRyYW5zbGF0ZUxhYmVsIH0gPSB1c2VUcmFuc2xhdGlvbigpO1xuXHRjb25zdCB7IGFkbWluLCBhcHAgfSA9IHZlcnNpb25zO1xuXG5cdHJldHVybiAoXG5cdFx0PEJveCBmbGV4IGZsZXhHcm93PXsxfSBweT0nZGVmYXVsdCcgcHg9J3h4bCcgZGF0YS1jc3M9J3ZlcnNpb24nPlxuXHRcdFx0e2FkbWluID8gKFxuXHRcdFx0XHQ8VGV4dCBkaXNwbGF5PXtbJ25vbmUnLCAnYmxvY2snXX0gY29sb3I9J2dyZXkxMDAnIHN0eWxlPXt7IHBhZGRpbmc6ICcxMnB4IDI0cHggMTJweCAwJyB9fT5cblx0XHRcdFx0XHR7dHJhbnNsYXRlTGFiZWwoJ2FkbWluVmVyc2lvbicsIHsgdmVyc2lvbjogYWRtaW4gfSl9XG5cdFx0XHRcdDwvVGV4dD5cblx0XHRcdCkgOiBudWxsfVxuXHRcdFx0e2FwcCA/IChcblx0XHRcdFx0PFRleHQgZGlzcGxheT17Wydub25lJywgJ2Jsb2NrJ119IGNvbG9yPSdncmV5MTAwJyBzdHlsZT17eyBwYWRkaW5nOiAnMTJweCAyNHB4IDEycHggMCcgfX0+XG5cdFx0XHRcdFx0e3RyYW5zbGF0ZUxhYmVsKCdhcHBWZXJzaW9uJywgeyB2ZXJzaW9uOiBhcHAgfSl9XG5cdFx0XHRcdDwvVGV4dD5cblx0XHRcdCkgOiBudWxsfVxuXHRcdDwvQm94PlxuXHQpO1xufTtcblxuY29uc3QgTGFuZ3VhZ2VTZWxlY3QgPSAoKSA9PiB7XG5cdGNvbnN0IHsgaTE4biwgdHJhbnNsYXRlQ29tcG9uZW50IH0gPSB1c2VUcmFuc2xhdGlvbigpO1xuXHRjb25zdCBzdXBwb3J0ZWRMbmdzID0gaTE4bj8ub3B0aW9ucz8uc3VwcG9ydGVkTG5ncyA/PyBbXTtcblx0Y29uc3QgYXZhaWxhYmxlTGFuZ3VhZ2VzID0gc3VwcG9ydGVkTG5ncy5maWx0ZXIoKGxhbmcpID0+IGxhbmcgIT09ICdjaW1vZGUnKTtcblxuXHRpZiAoYXZhaWxhYmxlTGFuZ3VhZ2VzLmxlbmd0aCA8PSAxKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHRyZXR1cm4gKFxuXHRcdDxCb3ggZmxleCBhbGlnbkl0ZW1zPSdjZW50ZXInPlxuXHRcdFx0PERyb3BEb3duPlxuXHRcdFx0XHQ8RHJvcERvd25UcmlnZ2VyPlxuXHRcdFx0XHRcdDxCdXR0b24gY29sb3I9J3RleHQnPlxuXHRcdFx0XHRcdFx0PEljb24gaWNvbj0nR2xvYmUnIC8+XG5cdFx0XHRcdFx0XHR7dHJhbnNsYXRlQ29tcG9uZW50KGBMYW5ndWFnZVNlbGVjdG9yLmF2YWlsYWJsZUxhbmd1YWdlcy4ke2kxOG4ubGFuZ3VhZ2V9YCwge1xuXHRcdFx0XHRcdFx0XHRkZWZhdWx0VmFsdWU6IGkxOG4ubGFuZ3VhZ2UsXG5cdFx0XHRcdFx0XHR9KX1cblx0XHRcdFx0XHQ8L0J1dHRvbj5cblx0XHRcdFx0PC9Ecm9wRG93blRyaWdnZXI+XG5cdFx0XHRcdDxEcm9wRG93bk1lbnU+XG5cdFx0XHRcdFx0e2F2YWlsYWJsZUxhbmd1YWdlcy5tYXAoKGxhbmcpID0+IChcblx0XHRcdFx0XHRcdDxEcm9wRG93bkl0ZW0ga2V5PXtsYW5nfSBvbkNsaWNrPXsoKSA9PiBpMThuLmNoYW5nZUxhbmd1YWdlKGxhbmcpfT5cblx0XHRcdFx0XHRcdFx0e3RyYW5zbGF0ZUNvbXBvbmVudChgTGFuZ3VhZ2VTZWxlY3Rvci5hdmFpbGFibGVMYW5ndWFnZXMuJHtsYW5nfWAsIHtcblx0XHRcdFx0XHRcdFx0XHRkZWZhdWx0VmFsdWU6IGxhbmcsXG5cdFx0XHRcdFx0XHRcdH0pfVxuXHRcdFx0XHRcdFx0PC9Ecm9wRG93bkl0ZW0+XG5cdFx0XHRcdFx0KSl9XG5cdFx0XHRcdDwvRHJvcERvd25NZW51PlxuXHRcdFx0PC9Ecm9wRG93bj5cblx0XHQ8L0JveD5cblx0KTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFRvcEJhcih7IHRvZ2dsZVNpZGViYXIgfTogVG9wQmFyUHJvcHMpIHtcblx0Y29uc3Qgd2luZG93U3RhdGUgPSB0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiAod2luZG93IGFzIFdpbmRvd1dpdGhBZG1pblN0YXRlKTtcblx0Y29uc3QgcmVkdXhTdGF0ZSA9IHdpbmRvd1N0YXRlPy5SRURVWF9TVEFURSA/PyB7fTtcblx0Y29uc3Qgc2Vzc2lvbiA9IHJlZHV4U3RhdGUuc2Vzc2lvbjtcblx0Y29uc3QgcGF0aHMgPSByZWR1eFN0YXRlLnBhdGhzO1xuXHRjb25zdCB2ZXJzaW9ucyA9IHJlZHV4U3RhdGUudmVyc2lvbnM7XG5cdGNvbnN0IHsgdHJhbnNsYXRlTWVzc2FnZSB9ID0gdXNlVHJhbnNsYXRpb24oKTtcblx0Y29uc3Qgcm9vdFBhdGggPSBwYXRocz8ucm9vdFBhdGggPz8gJy9hZG1pbic7XG5cdGNvbnN0IGhvbWVMYWJlbCA9IHRyYW5zbGF0ZU1lc3NhZ2UoJ2FkbWluLWhvbWUnKTtcblxuXHRyZXR1cm4gKFxuXHRcdDxCb3hcblx0XHRcdGRhdGEtY3NzPSd0b3BiYXInXG5cdFx0XHRzdHlsZT17e1xuXHRcdFx0XHRoZWlnaHQ6ICc2NHB4Jyxcblx0XHRcdFx0Ym9yZGVyQm90dG9tOiAnMXB4IHNvbGlkICNFMkU4RjAnLFxuXHRcdFx0XHRiYWNrZ3JvdW5kOiAnI0ZGRkZGRicsXG5cdFx0XHRcdGRpc3BsYXk6ICdmbGV4Jyxcblx0XHRcdFx0ZmxleERpcmVjdGlvbjogJ3JvdycsXG5cdFx0XHRcdGZsZXhTaHJpbms6IDAsXG5cdFx0XHRcdGFsaWduSXRlbXM6ICdjZW50ZXInLFxuXHRcdFx0fX1cblx0XHQ+XG5cdFx0XHQ8Qm94IGRpc3BsYXk9J2ZsZXgnIGFsaWduSXRlbXM9J2NlbnRlcicgc3R5bGU9e3sgZ2FwOiAxMiB9fT5cblx0XHRcdFx0PEJveFxuXHRcdFx0XHRcdHB5PSdsZydcblx0XHRcdFx0XHRweD17WydkZWZhdWx0JywgJ2xnJ119XG5cdFx0XHRcdFx0b25DbGljaz17dG9nZ2xlU2lkZWJhcn1cblx0XHRcdFx0XHRkaXNwbGF5PXtbJ2Jsb2NrJywgJ2Jsb2NrJywgJ2Jsb2NrJywgJ2Jsb2NrJywgJ25vbmUnXX1cblx0XHRcdFx0XHRzdHlsZT17eyBjdXJzb3I6ICdwb2ludGVyJyB9fVxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0PEljb24gaWNvbj0nTWVudScgc2l6ZT17MjR9IC8+XG5cdFx0XHRcdDwvQm94PlxuXHRcdFx0XHQ8YSBocmVmPXtyb290UGF0aH0gY2xhc3NOYW1lPSdhZG1pbi1ob21lLWxpbmsnPlxuXHRcdFx0XHRcdDxJY29uIGljb249J0hvbWUnIC8+XG5cdFx0XHRcdFx0e2hvbWVMYWJlbH1cblx0XHRcdFx0PC9hPlxuXHRcdFx0PC9Cb3g+XG5cdFx0XHQ8VmVyc2lvbiB2ZXJzaW9ucz17dmVyc2lvbnMgPz8ge319IC8+XG5cdFx0XHQ8TGFuZ3VhZ2VTZWxlY3QgLz5cblx0XHRcdHtzZXNzaW9uPy5lbWFpbCA/IDxMb2dnZWRJbiBzZXNzaW9uPXtzZXNzaW9ufSBwYXRocz17cGF0aHMgPz8ge319IC8+IDogJyd9XG5cdFx0PC9Cb3g+XG5cdCk7XG59XG4iLCJBZG1pbkpTLlVzZXJDb21wb25lbnRzID0ge31cbmltcG9ydCBPcmRlclN0YXR1c0FjdGlvbiBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9PcmRlclN0YXR1c0FjdGlvbidcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuT3JkZXJTdGF0dXNBY3Rpb24gPSBPcmRlclN0YXR1c0FjdGlvblxuaW1wb3J0IENhbmNlbE9yZGVyQWN0aW9uIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL0NhbmNlbE9yZGVyQWN0aW9uJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5DYW5jZWxPcmRlckFjdGlvbiA9IENhbmNlbE9yZGVyQWN0aW9uXG5pbXBvcnQgRGFzaGJvYXJkIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL0Rhc2hib2FyZCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuRGFzaGJvYXJkID0gRGFzaGJvYXJkXG5pbXBvcnQgTG9naW4gZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvTG9naW4nXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkxvZ2luID0gTG9naW5cbmltcG9ydCBMb2dnZWRJbiBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9Mb2dnZWRJbidcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuTG9nZ2VkSW4gPSBMb2dnZWRJblxuaW1wb3J0IFRvcEJhciBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9Ub3BCYXInXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlRvcEJhciA9IFRvcEJhciJdLCJuYW1lcyI6WyJhcGkiLCJBcGlDbGllbnQiLCJzdGF0dXNlcyIsIk9yZGVyU3RhdHVzQWN0aW9uIiwiYWN0aW9uIiwicmVjb3JkIiwicmVzb3VyY2UiLCJsb2NhbFJlY29yZCIsInNldExvY2FsUmVjb3JkIiwidXNlU3RhdGUiLCJzZWxlY3RlZFN0YXR1cyIsInNldFNlbGVjdGVkU3RhdHVzIiwicGFyYW1zIiwic3RhdHVzIiwibG9hZGluZyIsInNldExvYWRpbmciLCJhZGROb3RpY2UiLCJ1c2VOb3RpY2UiLCJ0cmFuc2xhdGVBY3Rpb24iLCJ0cmFuc2xhdGVMYWJlbCIsInRyYW5zbGF0ZU1lc3NhZ2UiLCJ1c2VUcmFuc2xhdGlvbiIsIlJlYWN0IiwiY3JlYXRlRWxlbWVudCIsIkJveCIsInZhcmlhbnQiLCJwIiwiVGV4dCIsImN1cnJlbnRTdGF0dXMiLCJzdGF0dXNPcHRpb25zIiwidXNlTWVtbyIsIm1hcCIsInZhbHVlIiwibGFiZWwiLCJpZCIsImN1cnJlbnRMYWJlbCIsInNlbGVjdGVkT3B0aW9uIiwiZmluZCIsIm9wdGlvbiIsIm5leHRMYWJlbCIsImhhbmRsZUNsaWNrIiwiZm9ybURhdGEiLCJGb3JtRGF0YSIsImFwcGVuZCIsInJlc3BvbnNlIiwicmVjb3JkQWN0aW9uIiwicmVzb3VyY2VJZCIsInJlY29yZElkIiwiYWN0aW9uTmFtZSIsIm5hbWUiLCJtZXRob2QiLCJkYXRhIiwibm90aWNlIiwidHlwZSIsIm1lc3NhZ2UiLCJvcHRpb25zIiwiYnV0dG9uTGFiZWwiLCJ0aXRsZSIsImJvcmRlclJhZGl1cyIsImJveFNoYWRvdyIsIm1heFdpZHRoIiwic3R5bGUiLCJib3JkZXIiLCJkaXNwbGF5IiwiYWxpZ25JdGVtcyIsImp1c3RpZnlDb250ZW50IiwibWIiLCJmb250U2l6ZSIsImZvbnRXZWlnaHQiLCJmbGV4RGlyZWN0aW9uIiwiZ2FwIiwibXIiLCJCYWRnZSIsIm91dGxpbmUiLCJiYWNrZ3JvdW5kIiwiYm9yZGVyQ29sb3IiLCJjb2xvciIsIkZvcm1Hcm91cCIsIlNlbGVjdCIsImlzQ2xlYXJhYmxlIiwib25DaGFuZ2UiLCJCdXR0b24iLCJvbkNsaWNrIiwiZGlzYWJsZWQiLCJDYW5jZWxPcmRlckFjdGlvbiIsInJlZnVuZFBheW1lbnQiLCJzZXRSZWZ1bmRQYXltZW50Iiwic3RyaXBlU2Vzc2lvbklkIiwiY2FuUmVmdW5kIiwiQm9vbGVhbiIsImhhbmRsZUNhbmNlbCIsImFzIiwiY3Vyc29yIiwiY2hlY2tlZCIsImV2ZW50IiwidGFyZ2V0Iiwid2lkdGgiLCJoZWlnaHQiLCJxdWlja0FjdGlvbnMiLCJrZXkiLCJwYXRoIiwiYWN0aW9uQnV0dG9uU3R5bGUiLCJyZXNvbHZlUGF0aCIsIndpbmRvdyIsImdsb2JhbEFueSIsInJvb3RQYXRoIiwiUkVEVVhfU1RBVEUiLCJwYXRocyIsIm5vcm1hbGl6ZWRSb290IiwicmVwbGFjZSIsIm5vcm1hbGl6ZWRQYXRoIiwiZ29UbyIsImxvY2F0aW9uIiwiYXNzaWduIiwiRGFzaGJvYXJkIiwiZmxleFdyYXAiLCJIMiIsIm1pbldpZHRoIiwiSWxsdXN0cmF0aW9uIiwibXQiLCJINCIsImdyaWRUZW1wbGF0ZUNvbHVtbnMiLCJINSIsImdldE1lc3NhZ2VUZXh0Iiwic3BsaXQiLCJsZW5ndGgiLCJMb2dpbiIsIndpbmRvd1N0YXRlIiwicHJvcHMiLCJfX0FQUF9TVEFURV9fIiwiZXJyb3JNZXNzYWdlIiwidW5kZWZpbmVkIiwiYnJhbmRpbmciLCJ0cmFuc2xhdGVDb21wb25lbnQiLCJlbWFpbCIsInNldEVtYWlsIiwicGFzc3dvcmQiLCJzZXRQYXNzd29yZCIsImhhbmRsZUVtYWlsQ2hhbmdlIiwiaGFuZGxlUGFzc3dvcmRDaGFuZ2UiLCJmbGV4IiwibWluSGVpZ2h0IiwicGFkZGluZyIsIm1hcmdpbkJvdHRvbSIsImxvZ28iLCJzcmMiLCJhbHQiLCJjb21wYW55TmFtZSIsIk1lc3NhZ2VCb3giLCJteSIsIkxhYmVsIiwicmVxdWlyZWQiLCJJbnB1dCIsImF1dG9Db21wbGV0ZSIsInBsYWNlaG9sZGVyIiwiTG9nZ2VkSW4iLCJzZXNzaW9uIiwidHJhbnNsYXRlQnV0dG9uIiwiZHJvcEFjdGlvbnMiLCJwcmV2ZW50RGVmYXVsdCIsImhyZWYiLCJsb2dvdXRQYXRoIiwiaWNvbiIsImZsZXhTaHJpbmsiLCJDdXJyZW50VXNlck5hdiIsImF2YXRhclVybCIsIlZlcnNpb24iLCJ2ZXJzaW9ucyIsImFkbWluIiwiYXBwIiwiZmxleEdyb3ciLCJweSIsInB4IiwidmVyc2lvbiIsIkxhbmd1YWdlU2VsZWN0IiwiaTE4biIsInN1cHBvcnRlZExuZ3MiLCJhdmFpbGFibGVMYW5ndWFnZXMiLCJmaWx0ZXIiLCJsYW5nIiwiRHJvcERvd24iLCJEcm9wRG93blRyaWdnZXIiLCJJY29uIiwibGFuZ3VhZ2UiLCJkZWZhdWx0VmFsdWUiLCJEcm9wRG93bk1lbnUiLCJEcm9wRG93bkl0ZW0iLCJjaGFuZ2VMYW5ndWFnZSIsIlRvcEJhciIsInRvZ2dsZVNpZGViYXIiLCJyZWR1eFN0YXRlIiwiaG9tZUxhYmVsIiwiYm9yZGVyQm90dG9tIiwic2l6ZSIsImNsYXNzTmFtZSIsIkFkbWluSlMiLCJVc2VyQ29tcG9uZW50cyJdLCJtYXBwaW5ncyI6Ijs7O0NBT0EsTUFBTUEsS0FBRyxHQUFHLElBQUlDLGlCQUFTLEVBQUU7Q0FFM0IsTUFBTUMsUUFBdUIsR0FBRyxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUM7Q0FFekUsU0FBU0MsaUJBQWlCQSxDQUFDO0dBQUVDLE1BQU07R0FBRUMsTUFBTTtDQUFFQyxFQUFBQTtDQUFzQixDQUFDLEVBQUU7R0FDcEYsTUFBTSxD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
