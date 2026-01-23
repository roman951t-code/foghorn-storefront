(function (react, adminjs, designSystem) {
	'use strict';

	const api$d = new adminjs.ApiClient();
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
	      const response = await api$d.recordAction({
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

	const api$c = new adminjs.ApiClient();
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
	      const response = await api$c.recordAction({
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

	const api$b = new adminjs.ApiClient();
	const extractEntries = payload => {
	  if (!payload || typeof payload !== 'object') return [];
	  const entries = payload.entries;
	  return Array.isArray(entries) ? entries : [];
	};
	function OrderAuditTimelineAction({
	  action,
	  record,
	  resource
	}) {
	  const [entries, setEntries] = react.useState([]);
	  const [note, setNote] = react.useState('');
	  const [loading, setLoading] = react.useState(false);
	  const [saving, setSaving] = react.useState(false);
	  const addNotice = adminjs.useNotice();
	  const {
	    translateAction,
	    translateLabel,
	    translateMessage
	  } = adminjs.useTranslation();
	  const recordId = record?.id;
	  const addNoticeRef = react.useRef(addNotice);
	  react.useEffect(() => {
	    addNoticeRef.current = addNotice;
	  }, [addNotice]);
	  react.useEffect(() => {
	    if (!recordId) return;
	    let isActive = true;
	    setLoading(true);
	    api$b.recordAction({
	      resourceId: resource.id,
	      recordId,
	      actionName: action.name,
	      method: 'get'
	    }).then(response => {
	      if (!isActive) return;
	      const payloadEntries = extractEntries(response.data.payload);
	      setEntries(payloadEntries);
	    }).catch(() => {
	      if (!isActive) return;
	      addNoticeRef.current({
	        message: 'audit-load-failed',
	        type: 'error'
	      });
	    }).finally(() => {
	      if (!isActive) return;
	      setLoading(false);
	    });
	    return () => {
	      isActive = false;
	    };
	  }, [action.name, recordId, resource.id]);
	  if (!recordId) {
	    return /*#__PURE__*/React.createElement(designSystem.Box, {
	      variant: "white",
	      p: "xl"
	    }, /*#__PURE__*/React.createElement(designSystem.Text, null, translateMessage('audit-load-failed')));
	  }
	  const title = translateAction(action.name, resource.id);
	  const formatTimestamp = value => {
	    const parsed = Date.parse(value);
	    if (Number.isNaN(parsed)) {
	      return value;
	    }
	    return new Date(parsed).toLocaleString();
	  };
	  const handleSubmit = async () => {
	    if (!recordId) return;
	    const trimmed = note.trim();
	    if (!trimmed) {
	      addNotice({
	        message: 'audit-note-empty',
	        type: 'error'
	      });
	      return;
	    }
	    setSaving(true);
	    try {
	      const formData = new FormData();
	      formData.append('note', trimmed);
	      const response = await api$b.recordAction({
	        resourceId: resource.id,
	        recordId,
	        actionName: action.name,
	        method: 'post',
	        data: formData
	      });
	      if (response.data.notice) {
	        addNotice(response.data.notice);
	      }
	      setNote('');
	      const payloadEntries = extractEntries(response.data.payload);
	      setEntries(payloadEntries);
	    } catch {
	      addNotice({
	        message: 'audit-note-save-failed',
	        type: 'error'
	      });
	    } finally {
	      setSaving(false);
	    }
	  };
	  return /*#__PURE__*/React.createElement(designSystem.Box, {
	    variant: "white",
	    p: "xxl",
	    borderRadius: "xl",
	    boxShadow: "sm",
	    maxWidth: "820px",
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
	      gap: 20
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Box, null, /*#__PURE__*/React.createElement(designSystem.Label, {
	    htmlFor: "audit-note"
	  }, translateMessage('audit-note-label')), /*#__PURE__*/React.createElement("textarea", {
	    id: "audit-note",
	    name: "auditNote",
	    value: note,
	    onChange: event => setNote(event.target.value),
	    placeholder: translateMessage('audit-note-placeholder'),
	    rows: 4,
	    style: {
	      width: '100%',
	      resize: 'vertical',
	      padding: '12px 14px',
	      borderRadius: 8,
	      border: '1px solid #E2E8F0',
	      fontSize: 14,
	      marginTop: 12
	    }
	  })), /*#__PURE__*/React.createElement(designSystem.Box, null, /*#__PURE__*/React.createElement(designSystem.Button, {
	    style: {
	      borderColor: 'white',
	      background: '#facc15',
	      color: 'black'
	    },
	    variant: "contained",
	    color: "primary",
	    onClick: handleSubmit,
	    disabled: saving
	  }, saving ? translateMessage('audit-note-saving') : translateMessage('audit-note-submit'))), /*#__PURE__*/React.createElement(designSystem.Box, null, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontSize: "lg",
	    fontWeight: "bold",
	    mb: "md"
	  }, translateMessage('audit-timeline')), loading ? /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('audit-load-progress')) : entries.length === 0 ? /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('audit-timeline-empty')) : /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      display: 'flex',
	      flexDirection: 'column',
	      gap: 16
	    }
	  }, entries.map(entry => {
	    const adminLabel = entry.adminEmail ?? translateMessage('audit-unknown-admin');
	    const timestamp = formatTimestamp(entry.createdAt);
	    const fromLabel = entry.fromStatus ? translateLabel(`status.${entry.fromStatus}`, resource.id) : translateMessage('status-unknown');
	    const toLabel = entry.toStatus ? translateLabel(`status.${entry.toStatus}`, resource.id) : translateMessage('status-unknown');
	    return /*#__PURE__*/React.createElement(designSystem.Box, {
	      key: entry.id,
	      style: {
	        border: '1px solid #E2E8F0',
	        borderRadius: 12,
	        padding: 16,
	        background: '#F8FAFC'
	      }
	    }, /*#__PURE__*/React.createElement(designSystem.Box, {
	      display: "flex",
	      alignItems: "center",
	      justifyContent: "space-between",
	      mb: "sm"
	    }, /*#__PURE__*/React.createElement(designSystem.Text, {
	      fontWeight: "600"
	    }, entry.type === 'NOTE' ? translateMessage('audit-note-entry') : translateMessage('audit-status-change', {
	      from: fromLabel,
	      to: toLabel
	    })), /*#__PURE__*/React.createElement(designSystem.Text, {
	      color: "grey60",
	      fontSize: "sm"
	    }, timestamp)), entry.type === 'STATUS_CHANGE' ? /*#__PURE__*/React.createElement(designSystem.Box, {
	      display: "flex",
	      alignItems: "center",
	      style: {
	        gap: 8
	      }
	    }, /*#__PURE__*/React.createElement(designSystem.Badge, {
	      outline: true
	    }, fromLabel), /*#__PURE__*/React.createElement(designSystem.Box, {
	      display: "flex",
	      alignItems: "center",
	      style: {
	        color: '#718096'
	      }
	    }, /*#__PURE__*/React.createElement(designSystem.Icon, {
	      icon: "ChevronRight",
	      size: 18
	    })), /*#__PURE__*/React.createElement(designSystem.Badge, {
	      outline: true
	    }, toLabel)) : entry.note ? /*#__PURE__*/React.createElement(designSystem.Text, null, entry.note) : null, /*#__PURE__*/React.createElement(designSystem.Text, {
	      color: "grey60",
	      fontSize: "sm",
	      mt: "sm"
	    }, translateMessage('audit-admin-label'), ": ", adminLabel));
	  })))));
	}

	const api$a = new adminjs.ApiClient();
	const formatMoney$5 = (value, currency = 'UAH') => {
	  try {
	    return new Intl.NumberFormat(undefined, {
	      style: 'currency',
	      currency,
	      minimumFractionDigits: 2,
	      maximumFractionDigits: 2
	    }).format(value);
	  } catch {
	    return value.toFixed(2);
	  }
	};
	function OrderShow(props) {
	  const {
	    record,
	    resource
	  } = props;
	  const recordId = record?.id;
	  const {
	    translateMessage
	  } = adminjs.useTranslation();
	  const [payload, setPayload] = react.useState(null);
	  const [loading, setLoading] = react.useState(false);
	  react.useEffect(() => {
	    if (!recordId) return;
	    let isActive = true;
	    setLoading(true);
	    api$a.recordAction({
	      resourceId: resource.id,
	      recordId,
	      actionName: 'financialBreakdown',
	      method: 'get'
	    }).then(response => {
	      if (!isActive) return;
	      setPayload(response.data.payload ?? null);
	    }).finally(() => {
	      if (!isActive) return;
	      setLoading(false);
	    });
	    return () => {
	      isActive = false;
	    };
	  }, [recordId, resource.id]);
	  const statusVariant = react.useMemo(() => {
	    switch (payload?.paymentStatus) {
	      case 'PAID':
	        return {
	          background: '#C6F6D5',
	          borderColor: '#38A169',
	          color: '#22543D'
	        };
	      case 'CANCELLED':
	        return {
	          background: '#FED7D7',
	          borderColor: '#E53E3E',
	          color: '#742A2A'
	        };
	      default:
	        return {
	          background: '#FEFCBF',
	          borderColor: '#D69E2E',
	          color: '#744210'
	        };
	    }
	  }, [payload?.paymentStatus]);
	  const paymentStatusLabel = react.useMemo(() => {
	    switch (payload?.paymentStatus) {
	      case 'PAID':
	        return translateMessage('payment-status-paid');
	      case 'CANCELLED':
	        return translateMessage('payment-status-cancelled');
	      default:
	        return translateMessage('payment-status-unpaid');
	    }
	  }, [payload?.paymentStatus, translateMessage]);
	  return /*#__PURE__*/React.createElement(designSystem.Box, null, /*#__PURE__*/React.createElement(designSystem.Box, {
	    variant: "white",
	    p: "xxl",
	    borderRadius: "xl",
	    boxShadow: "sm",
	    mb: "xl",
	    className: "admin-card--financial",
	    style: {
	      border: '1px solid #E2E8F0'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Box, {
	    display: "flex",
	    alignItems: "center",
	    justifyContent: "space-between",
	    mb: "lg"
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold"
	  }, translateMessage('financial-breakdown')), /*#__PURE__*/React.createElement(designSystem.Badge, {
	    outline: true,
	    style: {
	      background: statusVariant.background,
	      borderColor: statusVariant.borderColor,
	      color: statusVariant.color
	    }
	  }, paymentStatusLabel)), loading || !payload ? /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('financial-breakdown-loading')) : /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      display: 'grid',
	      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
	      gap: 16
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      padding: 14,
	      borderRadius: 12,
	      border: '1px solid #E2E8F0'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('subtotal')), /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold"
	  }, formatMoney$5(payload.subtotal))), /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      padding: 14,
	      borderRadius: 12,
	      border: '1px solid #E2E8F0'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('discounts')), /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold"
	  }, formatMoney$5(payload.discounts))), /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      padding: 14,
	      borderRadius: 12,
	      border: '1px solid #E2E8F0'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('shipping')), /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold"
	  }, formatMoney$5(payload.shipping))), /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      padding: 14,
	      borderRadius: 12,
	      border: '1px solid #E2E8F0'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('total')), /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold"
	  }, formatMoney$5(payload.total))))), /*#__PURE__*/React.createElement(adminjs.OriginalShow, props));
	}

	const api$9 = new adminjs.ApiClient();
	const extractPayload = payload => {
	  if (!payload || typeof payload !== 'object') {
	    return {
	      carrier: null,
	      trackingNumber: null
	    };
	  }
	  const maybe = payload;
	  return {
	    carrier: typeof maybe.carrier === 'string' ? maybe.carrier : null,
	    trackingNumber: typeof maybe.trackingNumber === 'string' ? maybe.trackingNumber : null
	  };
	};
	function OrderFulfillmentAction({
	  action,
	  record,
	  resource
	}) {
	  const recordId = record?.id;
	  const [carrier, setCarrier] = react.useState('');
	  const [trackingNumber, setTrackingNumber] = react.useState('');
	  const [loading, setLoading] = react.useState(false);
	  const [saving, setSaving] = react.useState(false);
	  const addNotice = adminjs.useNotice();
	  const addNoticeRef = react.useRef(addNotice);
	  const {
	    translateAction,
	    translateMessage
	  } = adminjs.useTranslation();
	  react.useEffect(() => {
	    addNoticeRef.current = addNotice;
	  }, [addNotice]);
	  const load = react.useCallback(() => {
	    if (!recordId) return;
	    let isActive = true;
	    setLoading(true);
	    api$9.recordAction({
	      resourceId: resource.id,
	      recordId,
	      actionName: action.name,
	      method: 'get'
	    }).then(response => {
	      if (!isActive) return;
	      const payload = extractPayload(response.data.payload);
	      setCarrier(payload.carrier ?? '');
	      setTrackingNumber(payload.trackingNumber ?? '');
	    }).catch(() => {
	      if (!isActive) return;
	      addNoticeRef.current({
	        message: 'fulfillment-load-failed',
	        type: 'error'
	      });
	    }).finally(() => {
	      if (!isActive) return;
	      setLoading(false);
	    });
	    return () => {
	      isActive = false;
	    };
	  }, [action.name, recordId, resource.id]);
	  react.useEffect(() => {
	    return load();
	  }, [load]);
	  if (!recordId) {
	    return /*#__PURE__*/React.createElement(designSystem.Box, {
	      variant: "white",
	      p: "xl"
	    }, /*#__PURE__*/React.createElement(designSystem.Text, null, translateMessage('fulfillment-load-failed')));
	  }
	  const title = translateAction(action.name, resource.id);
	  const handleSave = async () => {
	    setSaving(true);
	    try {
	      const formData = new FormData();
	      formData.append('carrier', carrier);
	      formData.append('trackingNumber', trackingNumber);
	      const response = await api$9.recordAction({
	        resourceId: resource.id,
	        recordId,
	        actionName: action.name,
	        method: 'post',
	        data: formData
	      });
	      if (response.data.notice) {
	        addNotice(response.data.notice);
	      }
	      const payload = extractPayload(response.data.payload);
	      setCarrier(payload.carrier ?? '');
	      setTrackingNumber(payload.trackingNumber ?? '');
	    } catch {
	      addNotice({
	        message: 'fulfillment-save-failed',
	        type: 'error'
	      });
	    } finally {
	      setSaving(false);
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
	  }, title)), loading ? /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('fulfillment-load-progress')) : /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      display: 'flex',
	      flexDirection: 'column',
	      gap: 16
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.FormGroup, null, /*#__PURE__*/React.createElement(designSystem.Label, null, translateMessage('fulfillment-carrier')), /*#__PURE__*/React.createElement(designSystem.Input, {
	    value: carrier,
	    onChange: e => setCarrier(e.target.value)
	  })), /*#__PURE__*/React.createElement(designSystem.FormGroup, null, /*#__PURE__*/React.createElement(designSystem.Label, null, translateMessage('fulfillment-tracking-number')), /*#__PURE__*/React.createElement(designSystem.Input, {
	    value: trackingNumber,
	    onChange: e => setTrackingNumber(e.target.value)
	  })), /*#__PURE__*/React.createElement(designSystem.Box, null, /*#__PURE__*/React.createElement(designSystem.Button, {
	    style: {
	      borderColor: 'white',
	      background: '#facc15',
	      color: 'black'
	    },
	    variant: "contained",
	    color: "primary",
	    onClick: handleSave,
	    disabled: saving
	  }, saving ? translateMessage('fulfillment-save-progress') : translateMessage('confirm')))));
	}

	const api$8 = new adminjs.ApiClient();
	const formatMoney$4 = (value, currency = 'UAH') => {
	  try {
	    return new Intl.NumberFormat(undefined, {
	      style: 'currency',
	      currency,
	      minimumFractionDigits: 2,
	      maximumFractionDigits: 2
	    }).format(value);
	  } catch {
	    return value.toFixed(2);
	  }
	};
	const normalizeFullName = (first, last) => {
	  const firstTrimmed = (first ?? '').trim();
	  const lastTrimmed = (last ?? '').trim();
	  if (!firstTrimmed && !lastTrimmed) return null;
	  if (!lastTrimmed) return firstTrimmed || null;
	  if (!firstTrimmed) return lastTrimmed || null;
	  const firstLower = firstTrimmed.toLocaleLowerCase();
	  const lastLower = lastTrimmed.toLocaleLowerCase();
	  if (firstLower.includes(lastLower)) {
	    return firstTrimmed;
	  }
	  return `${firstTrimmed} ${lastTrimmed}`;
	};
	function OrderPackingSlipAction({
	  action,
	  record,
	  resource
	}) {
	  const recordId = record?.id;
	  const [payload, setPayload] = react.useState(null);
	  const [loading, setLoading] = react.useState(false);
	  const addNotice = adminjs.useNotice();
	  const addNoticeRef = react.useRef(addNotice);
	  const {
	    translateAction,
	    translateMessage
	  } = adminjs.useTranslation();
	  react.useEffect(() => {
	    addNoticeRef.current = addNotice;
	  }, [addNotice]);
	  react.useEffect(() => {
	    if (!recordId) return;
	    let isActive = true;
	    setLoading(true);
	    api$8.recordAction({
	      resourceId: resource.id,
	      recordId,
	      actionName: action.name,
	      method: 'get'
	    }).then(response => {
	      if (!isActive) return;
	      setPayload(response.data.payload ?? null);
	    }).catch(() => {
	      if (!isActive) return;
	      addNoticeRef.current({
	        message: 'packing-slip-load-failed',
	        type: 'error'
	      });
	    }).finally(() => {
	      if (!isActive) return;
	      setLoading(false);
	    });
	    return () => {
	      isActive = false;
	    };
	  }, [action.name, recordId, resource.id]);
	  const title = translateAction(action.name, resource.id);
	  const customer = payload ? normalizeFullName(payload.contactName, payload.contactLastName) : null;
	  return /*#__PURE__*/React.createElement(designSystem.Box, {
	    variant: "white",
	    p: "xxl",
	    borderRadius: "xl",
	    boxShadow: "sm",
	    maxWidth: "920px",
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
	  }, title), /*#__PURE__*/React.createElement(designSystem.Button, {
	    variant: "contained",
	    color: "primary",
	    onClick: () => window.print(),
	    style: {
	      borderColor: 'white',
	      background: '#facc15',
	      color: 'black'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Icon, {
	    icon: "Printer"
	  }), translateMessage('packing-slip-print'))), loading || !payload ? /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, loading ? translateMessage('packing-slip-loading') : translateMessage('packing-slip-load-failed')) : /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      display: 'flex',
	      flexDirection: 'column',
	      gap: 16
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      display: 'grid',
	      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
	      gap: 12
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      border: '1px solid #E2E8F0',
	      borderRadius: 12,
	      padding: 14
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60",
	    fontSize: "sm"
	  }, translateMessage('packing-slip-order')), /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold"
	  }, payload.orderId), /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60",
	    fontSize: "sm"
	  }, new Date(payload.createdAt).toLocaleString())), /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      border: '1px solid #E2E8F0',
	      borderRadius: 12,
	      padding: 14
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60",
	    fontSize: "sm"
	  }, translateMessage('packing-slip-customer')), /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold"
	  }, customer ?? '-'), /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60",
	    fontSize: "sm"
	  }, payload.contactPhone ?? payload.contactEmail ?? '-')), /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      border: '1px solid #E2E8F0',
	      borderRadius: 12,
	      padding: 14
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60",
	    fontSize: "sm"
	  }, translateMessage('packing-slip-fulfillment')), /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold"
	  }, payload.carrier ?? '-'), /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60",
	    fontSize: "sm"
	  }, payload.trackingNumber ?? '-'))), /*#__PURE__*/React.createElement(designSystem.Table, null, /*#__PURE__*/React.createElement(designSystem.TableHead, null, /*#__PURE__*/React.createElement(designSystem.TableRow, null, /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('packing-slip-item')), /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('packing-slip-qty')), /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('packing-slip-unit')), /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('packing-slip-line')))), /*#__PURE__*/React.createElement(designSystem.TableBody, null, payload.items.map((item, index) => /*#__PURE__*/React.createElement(designSystem.TableRow, {
	    key: `${item.name}-${index}`
	  }, /*#__PURE__*/React.createElement(designSystem.TableCell, null, item.name), /*#__PURE__*/React.createElement(designSystem.TableCell, null, item.quantity), /*#__PURE__*/React.createElement(designSystem.TableCell, null, formatMoney$4(item.unitPrice)), /*#__PURE__*/React.createElement(designSystem.TableCell, null, formatMoney$4(item.price)))))), /*#__PURE__*/React.createElement(designSystem.Box, {
	    display: "flex",
	    justifyContent: "flex-end"
	  }, /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      border: '1px solid #E2E8F0',
	      borderRadius: 12,
	      padding: 14,
	      minWidth: 260
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60",
	    fontSize: "sm"
	  }, translateMessage('total')), /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontSize: "xl",
	    fontWeight: "bold"
	  }, formatMoney$4(payload.total))))));
	}

	const formatMoney$3 = (value, currency = 'UAH') => {
	  try {
	    return new Intl.NumberFormat(undefined, {
	      style: 'currency',
	      currency,
	      minimumFractionDigits: 2,
	      maximumFractionDigits: 2
	    }).format(value);
	  } catch {
	    return value.toFixed(2);
	  }
	};
	function OrderTotalList(props) {
	  const {
	    record,
	    property
	  } = props;
	  const raw = record.params[property.path];
	  const numeric = Number(raw ?? 0);
	  if (!Number.isFinite(numeric)) {
	    return String(raw ?? '');
	  }
	  return formatMoney$3(numeric);
	}

	const parseNumber = value => {
	  const normalized = value.trim();
	  if (!normalized) return null;
	  const numeric = Number(normalized);
	  return Number.isFinite(numeric) ? numeric : null;
	};
	const buildFilterJson = (min, max) => {
	  const minValue = parseNumber(min);
	  const maxValue = parseNumber(max);
	  if (minValue === null && maxValue === null) return '';
	  if (minValue !== null && maxValue !== null) return JSON.stringify({
	    gte: minValue,
	    lte: maxValue
	  });
	  if (minValue !== null) return JSON.stringify({
	    gte: minValue
	  });
	  return JSON.stringify({
	    lte: maxValue
	  });
	};
	function OrderTotalRangeFilter(props) {
	  const {
	    onChange,
	    property,
	    filter
	  } = props;
	  const {
	    translateProperty
	  } = adminjs.useTranslation();
	  const filterValue = filter[property.path];
	  const [min, setMin] = react.useState('');
	  const [max, setMax] = react.useState('');
	  react.useEffect(() => {
	    if (!filterValue) {
	      setMin('');
	      setMax('');
	      return;
	    }
	    try {
	      const parsed = JSON.parse(filterValue);
	      if (parsed && typeof parsed === 'object') {
	        const obj = parsed;
	        setMin(typeof obj.gte === 'number' ? String(obj.gte) : '');
	        setMax(typeof obj.lte === 'number' ? String(obj.lte) : '');
	      } else if (typeof parsed === 'number') {
	        setMin(String(parsed));
	        setMax('');
	      }
	    } catch {
	      // ignore
	    }
	  }, [filterValue]);
	  return /*#__PURE__*/React.createElement(designSystem.FormGroup, {
	    variant: "filter"
	  }, /*#__PURE__*/React.createElement(designSystem.Label, null, translateProperty(property.label, property.resourceId)), /*#__PURE__*/React.createElement(designSystem.Input, {
	    name: `filter-${property.path}-min`,
	    type: "number",
	    inputMode: "decimal",
	    placeholder: translateProperty('from'),
	    value: min,
	    onChange: e => {
	      const next = e.target.value;
	      setMin(next);
	      onChange(property.path, buildFilterJson(next, max));
	    }
	  }), /*#__PURE__*/React.createElement(designSystem.Input, {
	    name: `filter-${property.path}-max`,
	    type: "number",
	    inputMode: "decimal",
	    placeholder: translateProperty('to'),
	    value: max,
	    mt: "default",
	    onChange: e => {
	      const next = e.target.value;
	      setMax(next);
	      onChange(property.path, buildFilterJson(min, next));
	    }
	  }));
	}

	function SelectFilterWithPlaceholder(props) {
	  const {
	    property,
	    filter,
	    onChange
	  } = props;
	  const {
	    tl,
	    translateMessage,
	    translateProperty
	  } = adminjs.useTranslation();
	  const availableValues = property.availableValues ?? [];
	  const options = availableValues.map(option => ({
	    value: option.value,
	    label: tl(`${property.path}.${option.value}`, property.resourceId, {
	      defaultValue: option.label ?? String(option.value)
	    })
	  }));
	  const currentValue = filter[property.path] ?? '';
	  const selected = options.find(option => String(option.value) === String(currentValue)) ?? null;
	  return /*#__PURE__*/React.createElement(designSystem.FormGroup, {
	    variant: "filter"
	  }, /*#__PURE__*/React.createElement(designSystem.Label, null, translateProperty(property.label, property.resourceId)), /*#__PURE__*/React.createElement(designSystem.Select, {
	    variant: "filter",
	    isClearable: true,
	    placeholder: translateMessage('select-placeholder', {
	      defaultValue: 'Select...'
	    }),
	    options: options,
	    value: selected,
	    onChange: option => {
	      const value = option ? option.value : '';
	      onChange(property.path, value);
	    }
	  }));
	}

	const api$7 = new adminjs.ApiClient();
	const formatMoney$2 = (value, currency = 'UAH') => {
	  try {
	    return new Intl.NumberFormat(undefined, {
	      style: 'currency',
	      currency,
	      minimumFractionDigits: 2,
	      maximumFractionDigits: 2
	    }).format(value);
	  } catch {
	    return value.toFixed(2);
	  }
	};
	const formatDate$1 = value => {
	  if (!value) return '-';
	  const parsed = Date.parse(value);
	  return Number.isNaN(parsed) ? value : new Date(parsed).toLocaleString();
	};
	const getRootPath$2 = () => {
	  if (typeof window === 'undefined') return '';
	  const path = window.location.pathname ?? '';
	  const parts = path.split('/resources');
	  return parts[0] ?? '';
	};
	const buildRecordShowHref = (resourceId, recordId) => `${getRootPath$2()}/resources/${resourceId}/records/${recordId}/show`;
	function UserShow(props) {
	  const {
	    record,
	    resource
	  } = props;
	  const recordId = record?.id;
	  const {
	    translateMessage
	  } = adminjs.useTranslation();
	  const addNotice = adminjs.useNotice();
	  const [payload, setPayload] = react.useState(null);
	  const [loading, setLoading] = react.useState(false);
	  const [related, setRelated] = react.useState(null);
	  const [relatedLoading, setRelatedLoading] = react.useState(false);
	  const [localRecord, setLocalRecord] = react.useState(record);
	  const [adminStatus, setAdminStatus] = react.useState('ACTIVE');
	  const [adminNotes, setAdminNotes] = react.useState('');
	  const [savingMeta, setSavingMeta] = react.useState(false);
	  react.useEffect(() => {
	    setLocalRecord(record);
	    const nextStatus = record?.params?.adminStatus ?? 'ACTIVE';
	    const nextNotes = record?.params?.adminNotes ?? '';
	    setAdminStatus(nextStatus);
	    setAdminNotes(nextNotes);
	  }, [record?.id]);
	  react.useEffect(() => {
	    if (!recordId) return;
	    let isActive = true;
	    setLoading(true);
	    api$7.recordAction({
	      resourceId: resource.id,
	      recordId,
	      actionName: 'userKpis',
	      method: 'get'
	    }).then(response => {
	      if (!isActive) return;
	      setPayload(response.data.payload ?? null);
	    }).finally(() => {
	      if (!isActive) return;
	      setLoading(false);
	    });
	    return () => {
	      isActive = false;
	    };
	  }, [recordId, resource.id]);
	  react.useEffect(() => {
	    if (!recordId) return;
	    let isActive = true;
	    setRelatedLoading(true);
	    api$7.recordAction({
	      resourceId: resource.id,
	      recordId,
	      actionName: 'userRelatedData',
	      method: 'get'
	    }).then(response => {
	      if (!isActive) return;
	      setRelated(response.data.payload ?? null);
	    }).finally(() => {
	      if (!isActive) return;
	      setRelatedLoading(false);
	    });
	    return () => {
	      isActive = false;
	    };
	  }, [recordId, resource.id]);
	  const statusOptions = react.useMemo(() => [{
	    value: 'ACTIVE',
	    label: translateMessage('user-status-active')
	  }, {
	    value: 'SUSPENDED',
	    label: translateMessage('user-status-suspended')
	  }, {
	    value: 'BLOCKED',
	    label: translateMessage('user-status-blocked')
	  }], [translateMessage]);
	  const selectedStatusOption = statusOptions.find(option => option.value === adminStatus) ?? statusOptions[0] ?? null;
	  const lastOrderText = react.useMemo(() => {
	    if (!payload?.lastOrderDate) return '-';
	    const parsed = Date.parse(payload.lastOrderDate);
	    return Number.isNaN(parsed) ? payload.lastOrderDate : new Date(parsed).toLocaleString();
	  }, [payload?.lastOrderDate]);
	  const statusBadgeStyle = react.useMemo(() => {
	    if (adminStatus === 'BLOCKED') {
	      return {
	        background: '#FED7D7',
	        borderColor: '#E53E3E',
	        color: '#742A2A'
	      };
	    }
	    if (adminStatus === 'SUSPENDED') {
	      return {
	        background: '#FEEBC8',
	        borderColor: '#DD6B20',
	        color: '#7B341E'
	      };
	    }
	    return {
	      background: '#C6F6D5',
	      borderColor: '#38A169',
	      color: '#22543D'
	    };
	  }, [adminStatus]);
	  const isDirty = react.useMemo(() => {
	    const baseStatus = localRecord?.params?.adminStatus ?? 'ACTIVE';
	    const baseNotes = localRecord?.params?.adminNotes ?? '';
	    return adminStatus !== baseStatus || adminNotes !== baseNotes;
	  }, [adminStatus, adminNotes, localRecord?.params?.adminNotes, localRecord?.params?.adminStatus]);
	  const handleSaveMeta = async () => {
	    if (!localRecord?.id || savingMeta) return;
	    setSavingMeta(true);
	    try {
	      const formData = new FormData();
	      formData.append('adminStatus', adminStatus);
	      formData.append('adminNotes', adminNotes);
	      const response = await api$7.recordAction({
	        resourceId: resource.id,
	        recordId: localRecord.id,
	        actionName: 'updateUserAdminMeta',
	        method: 'post',
	        data: formData
	      });
	      if (response.data.notice) {
	        addNotice(response.data.notice);
	      }
	      if (response.data.record) {
	        setLocalRecord(response.data.record);
	        setAdminStatus(response.data.record?.params?.adminStatus ?? 'ACTIVE');
	        setAdminNotes(response.data.record?.params?.adminNotes ?? '');
	      }
	    } catch {
	      addNotice({
	        message: 'user-admin-update-failed',
	        type: 'error'
	      });
	    } finally {
	      setSavingMeta(false);
	    }
	  };
	  return /*#__PURE__*/React.createElement(designSystem.Box, null, /*#__PURE__*/React.createElement(designSystem.Box, {
	    variant: "white",
	    p: "xxl",
	    borderRadius: "xl",
	    boxShadow: "sm",
	    mb: "xl",
	    style: {
	      border: '1px solid #E2E8F0'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold",
	    mb: "lg"
	  }, translateMessage('customer-flags')), /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      display: 'grid',
	      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
	      gap: 16
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      padding: 14,
	      borderRadius: 12,
	      border: '1px solid #E2E8F0'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60",
	    mb: "sm"
	  }, translateMessage('customer-status')), /*#__PURE__*/React.createElement(designSystem.Box, {
	    display: "flex",
	    alignItems: "center",
	    justifyContent: "space-between"
	  }, /*#__PURE__*/React.createElement(designSystem.Badge, {
	    fontSize: "md",
	    outline: true,
	    style: statusBadgeStyle
	  }, selectedStatusOption?.label ?? adminStatus)), /*#__PURE__*/React.createElement(designSystem.Box, {
	    mt: "md"
	  }, /*#__PURE__*/React.createElement(designSystem.FormGroup, {
	    label: translateMessage('customer-status-change'),
	    mb: "0"
	  }, /*#__PURE__*/React.createElement(designSystem.Select, {
	    isClearable: false,
	    options: statusOptions,
	    value: selectedStatusOption,
	    onChange: option => {
	      const value = option?.value ?? 'ACTIVE';
	      setAdminStatus(value);
	    }
	  })))), /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      padding: 14,
	      borderRadius: 12,
	      border: '1px solid #E2E8F0'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Label, {
	    htmlFor: "admin-notes"
	  }, translateMessage('customer-internal-notes')), /*#__PURE__*/React.createElement("textarea", {
	    id: "admin-notes",
	    value: adminNotes,
	    onChange: event => setAdminNotes(event.target.value),
	    placeholder: translateMessage('customer-internal-notes-placeholder'),
	    rows: 5,
	    style: {
	      width: '100%',
	      resize: 'vertical',
	      padding: '12px 14px',
	      borderRadius: 8,
	      border: '1px solid #E2E8F0',
	      fontSize: 14,
	      marginTop: 12
	    }
	  }))), /*#__PURE__*/React.createElement(designSystem.Box, {
	    mt: "xl",
	    display: "flex",
	    style: {
	      gap: 12,
	      flexWrap: 'wrap'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Button, {
	    style: {
	      borderColor: 'white',
	      background: '#facc15',
	      color: 'black'
	    },
	    variant: "contained",
	    color: "primary",
	    onClick: handleSaveMeta,
	    disabled: !isDirty || savingMeta
	  }, savingMeta ? translateMessage('customer-flags-saving') : translateMessage('customer-flags-save')))), /*#__PURE__*/React.createElement(designSystem.Box, {
	    variant: "white",
	    p: "xxl",
	    borderRadius: "xl",
	    boxShadow: "sm",
	    mb: "xl",
	    className: "admin-card--kpis",
	    style: {
	      border: '1px solid #E2E8F0'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold",
	    mb: "lg"
	  }, translateMessage('customer-kpis')), loading || !payload ? /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('customer-kpis-loading')) : /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      display: 'grid',
	      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
	      gap: 16
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      padding: 14,
	      borderRadius: 12,
	      border: '1px solid #E2E8F0'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('customer-kpis-total-orders')), /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold"
	  }, payload.totalOrders)), /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      padding: 14,
	      borderRadius: 12,
	      border: '1px solid #E2E8F0'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('customer-kpis-ltv')), /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold"
	  }, formatMoney$2(payload.lifetimeValue))), /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      padding: 14,
	      borderRadius: 12,
	      border: '1px solid #E2E8F0'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('customer-kpis-aov')), /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold"
	  }, formatMoney$2(payload.averageOrderValue))), /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      padding: 14,
	      borderRadius: 12,
	      border: '1px solid #E2E8F0'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('customer-kpis-last-order')), /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold"
	  }, lastOrderText)))), /*#__PURE__*/React.createElement(designSystem.Box, {
	    variant: "white",
	    p: "xxl",
	    borderRadius: "xl",
	    boxShadow: "sm",
	    mb: "xl",
	    style: {
	      border: '1px solid #E2E8F0'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold",
	    mb: "lg"
	  }, translateMessage('customer-related')), relatedLoading || !related ? /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('customer-related-loading')) : /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      display: 'grid',
	      gridTemplateColumns: '1fr',
	      gap: 18
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Box, null, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold",
	    mb: "sm"
	  }, translateMessage('customer-related-orders')), related.orders.length ? /*#__PURE__*/React.createElement(designSystem.Table, null, /*#__PURE__*/React.createElement(designSystem.TableHead, null, /*#__PURE__*/React.createElement(designSystem.TableRow, null, /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('customer-related-order-id')), /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('customer-related-order-status')), /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('customer-related-order-total')), /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('customer-related-order-created')))), /*#__PURE__*/React.createElement(designSystem.TableBody, null, related.orders.map(order => /*#__PURE__*/React.createElement(designSystem.TableRow, {
	    key: order.id
	  }, /*#__PURE__*/React.createElement(designSystem.TableCell, null, /*#__PURE__*/React.createElement("a", {
	    href: buildRecordShowHref('Order', order.id),
	    style: {
	      fontWeight: 600
	    }
	  }, order.id)), /*#__PURE__*/React.createElement(designSystem.TableCell, null, order.status), /*#__PURE__*/React.createElement(designSystem.TableCell, null, formatMoney$2(order.total)), /*#__PURE__*/React.createElement(designSystem.TableCell, null, formatDate$1(order.createdAt)))))) : /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('customer-related-empty'))), /*#__PURE__*/React.createElement(designSystem.Box, null, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold",
	    mb: "sm"
	  }, translateMessage('customer-related-reviews')), related.reviews.length ? /*#__PURE__*/React.createElement(designSystem.Table, null, /*#__PURE__*/React.createElement(designSystem.TableHead, null, /*#__PURE__*/React.createElement(designSystem.TableRow, null, /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('customer-related-review-product')), /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('customer-related-review-rating')), /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('customer-related-review-comment')), /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('customer-related-review-created')))), /*#__PURE__*/React.createElement(designSystem.TableBody, null, related.reviews.map(review => /*#__PURE__*/React.createElement(designSystem.TableRow, {
	    key: review.id
	  }, /*#__PURE__*/React.createElement(designSystem.TableCell, null, /*#__PURE__*/React.createElement("a", {
	    href: buildRecordShowHref('Product', review.productId),
	    style: {
	      fontWeight: 600
	    }
	  }, review.productName)), /*#__PURE__*/React.createElement(designSystem.TableCell, null, review.rating), /*#__PURE__*/React.createElement(designSystem.TableCell, null, /*#__PURE__*/React.createElement(designSystem.Text, {
	    style: {
	      maxWidth: 420,
	      whiteSpace: 'nowrap',
	      overflow: 'hidden',
	      textOverflow: 'ellipsis'
	    }
	  }, review.comment)), /*#__PURE__*/React.createElement(designSystem.TableCell, null, formatDate$1(review.createdAt)))))) : /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('customer-related-empty'))), /*#__PURE__*/React.createElement(designSystem.Box, null, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold",
	    mb: "sm"
	  }, translateMessage('customer-related-wishlist')), related.wishlist.length ? /*#__PURE__*/React.createElement(designSystem.Table, null, /*#__PURE__*/React.createElement(designSystem.TableHead, null, /*#__PURE__*/React.createElement(designSystem.TableRow, null, /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('customer-related-product')), /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('customer-related-added')))), /*#__PURE__*/React.createElement(designSystem.TableBody, null, related.wishlist.map(item => /*#__PURE__*/React.createElement(designSystem.TableRow, {
	    key: `${item.productId}:${item.createdAt}`
	  }, /*#__PURE__*/React.createElement(designSystem.TableCell, null, /*#__PURE__*/React.createElement("a", {
	    href: buildRecordShowHref('Product', item.productId),
	    style: {
	      fontWeight: 600
	    }
	  }, item.productName)), /*#__PURE__*/React.createElement(designSystem.TableCell, null, formatDate$1(item.createdAt)))))) : /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('customer-related-empty'))), /*#__PURE__*/React.createElement(designSystem.Box, null, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold",
	    mb: "sm"
	  }, translateMessage('customer-related-recently-viewed')), related.recentlyViewed.length ? /*#__PURE__*/React.createElement(designSystem.Table, null, /*#__PURE__*/React.createElement(designSystem.TableHead, null, /*#__PURE__*/React.createElement(designSystem.TableRow, null, /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('customer-related-product')), /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('customer-related-updated')))), /*#__PURE__*/React.createElement(designSystem.TableBody, null, related.recentlyViewed.map(item => /*#__PURE__*/React.createElement(designSystem.TableRow, {
	    key: `${item.productId}:${item.createdAt}`
	  }, /*#__PURE__*/React.createElement(designSystem.TableCell, null, /*#__PURE__*/React.createElement("a", {
	    href: buildRecordShowHref('Product', item.productId),
	    style: {
	      fontWeight: 600
	    }
	  }, item.productName)), /*#__PURE__*/React.createElement(designSystem.TableCell, null, formatDate$1(item.createdAt)))))) : /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('customer-related-empty'))))), /*#__PURE__*/React.createElement(adminjs.OriginalShow, props));
	}

	const api$6 = new adminjs.ApiClient();
	const formatDate = value => {
	  if (!value) return '-';
	  const parsed = Date.parse(value);
	  return Number.isNaN(parsed) ? value : new Date(parsed).toLocaleString();
	};
	const formatMoney$1 = value => {
	  if (value == null) return '-';
	  try {
	    return new Intl.NumberFormat(undefined, {
	      style: 'currency',
	      currency: 'UAH',
	      minimumFractionDigits: 2,
	      maximumFractionDigits: 2
	    }).format(value);
	  } catch {
	    return value.toFixed(2);
	  }
	};
	const getRootPath$1 = () => {
	  if (typeof window === 'undefined') return '';
	  const path = window.location.pathname ?? '';
	  const parts = path.split('/resources');
	  return parts[0] ?? '';
	};
	const buildUserShowHref = (resourceId, userId) => `${getRootPath$1()}/resources/${resourceId}/records/${userId}/show`;
	const buildUserListHref = (resourceId, filters) => {
	  const root = getRootPath$1();
	  const params = new URLSearchParams();
	  for (const [key, value] of Object.entries(filters)) {
	    params.set(`filters.${key}`, value);
	  }
	  return `${root}/resources/${resourceId}?${params.toString()}`;
	};
	function UsersTable({
	  resourceId,
	  users,
	  showLastOrder,
	  showLtv
	}) {
	  const {
	    translateMessage
	  } = adminjs.useTranslation();
	  if (!users.length) {
	    return /*#__PURE__*/React.createElement(designSystem.Text, {
	      color: "grey60"
	    }, translateMessage('user-segments-empty'));
	  }
	  return /*#__PURE__*/React.createElement(designSystem.Table, null, /*#__PURE__*/React.createElement(designSystem.TableHead, null, /*#__PURE__*/React.createElement(designSystem.TableRow, null, /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('user-segments-col-name')), /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('user-segments-col-email')), showLtv ? /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('user-segments-col-ltv')) : null, showLastOrder ? /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('user-segments-col-last-order')) : null, /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('user-segments-col-created')))), /*#__PURE__*/React.createElement(designSystem.TableBody, null, users.map(user => /*#__PURE__*/React.createElement(designSystem.TableRow, {
	    key: user.id
	  }, /*#__PURE__*/React.createElement(designSystem.TableCell, null, /*#__PURE__*/React.createElement("a", {
	    href: buildUserShowHref(resourceId, user.id),
	    style: {
	      fontWeight: 600
	    }
	  }, user.name)), /*#__PURE__*/React.createElement(designSystem.TableCell, null, user.email ?? '-'), showLtv ? /*#__PURE__*/React.createElement(designSystem.TableCell, null, formatMoney$1(user.lifetimeValue)) : null, showLastOrder ? /*#__PURE__*/React.createElement(designSystem.TableCell, null, formatDate(user.lastOrderAt)) : null, /*#__PURE__*/React.createElement(designSystem.TableCell, null, formatDate(user.createdAt))))));
	}
	function UserSegments({
	  resource
	}) {
	  const {
	    translateMessage
	  } = adminjs.useTranslation();
	  const [payload, setPayload] = react.useState(null);
	  const [loading, setLoading] = react.useState(false);
	  react.useEffect(() => {
	    let isActive = true;
	    setLoading(true);
	    api$6.resourceAction({
	      resourceId: resource.id,
	      actionName: 'userSegments',
	      method: 'get'
	    }).then(response => {
	      if (!isActive) return;
	      setPayload(response.data.payload ?? null);
	    }).finally(() => {
	      if (!isActive) return;
	      setLoading(false);
	    });
	    return () => {
	      isActive = false;
	    };
	  }, [resource.id]);
	  const previewLimitText = react.useMemo(() => {
	    if (!payload) return '';
	    return translateMessage('user-segments-preview', {
	      limit: payload.config.previewLimit
	    });
	  }, [payload, translateMessage]);
	  if (loading || !payload) {
	    return /*#__PURE__*/React.createElement(designSystem.Box, {
	      variant: "white",
	      p: "xxl",
	      borderRadius: "xl",
	      boxShadow: "sm",
	      style: {
	        border: '1px solid #E2E8F0'
	      }
	    }, /*#__PURE__*/React.createElement(designSystem.Text, {
	      color: "grey60"
	    }, translateMessage('user-segments-loading')));
	  }
	  return /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      display: 'flex',
	      flexDirection: 'column',
	      gap: 18
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Box, {
	    variant: "white",
	    p: "xxl",
	    borderRadius: "xl",
	    boxShadow: "sm",
	    style: {
	      border: '1px solid #E2E8F0'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontSize: "xl",
	    fontWeight: "bold",
	    mb: "sm"
	  }, translateMessage('user-segments-title')), /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60",
	    mb: "md"
	  }, translateMessage('user-segments-purpose')), /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, previewLimitText)), /*#__PURE__*/React.createElement(designSystem.Box, {
	    variant: "white",
	    p: "xxl",
	    borderRadius: "xl",
	    boxShadow: "sm",
	    style: {
	      border: '1px solid #E2E8F0'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Box, {
	    display: "flex",
	    alignItems: "center",
	    justifyContent: "space-between",
	    mb: "lg"
	  }, /*#__PURE__*/React.createElement(designSystem.Box, null, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold"
	  }, translateMessage('user-segments-subscribed')), /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('user-segments-subscribed-desc'))), /*#__PURE__*/React.createElement(designSystem.Box, {
	    display: "flex",
	    alignItems: "center",
	    style: {
	      gap: 12
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Badge, {
	    outline: true
	  }, payload.counts.subscribed), /*#__PURE__*/React.createElement("a", {
	    href: buildUserListHref(resource.id, {
	      subscribed: 'true'
	    })
	  }, /*#__PURE__*/React.createElement(designSystem.Button, {
	    variant: "outlined"
	  }, translateMessage('user-segments-open'))))), /*#__PURE__*/React.createElement(UsersTable, {
	    resourceId: resource.id,
	    users: payload.lists.subscribed
	  })), /*#__PURE__*/React.createElement(designSystem.Box, {
	    variant: "white",
	    p: "xxl",
	    borderRadius: "xl",
	    boxShadow: "sm",
	    style: {
	      border: '1px solid #E2E8F0'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Box, {
	    display: "flex",
	    alignItems: "center",
	    justifyContent: "space-between",
	    mb: "lg"
	  }, /*#__PURE__*/React.createElement(designSystem.Box, null, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold"
	  }, translateMessage('user-segments-verified')), /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('user-segments-verified-desc'))), /*#__PURE__*/React.createElement(designSystem.Box, {
	    display: "flex",
	    alignItems: "center",
	    style: {
	      gap: 12
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Badge, {
	    outline: true
	  }, payload.counts.verified), /*#__PURE__*/React.createElement("a", {
	    href: buildUserListHref(resource.id, {
	      emailVerified: 'true'
	    })
	  }, /*#__PURE__*/React.createElement(designSystem.Button, {
	    variant: "outlined"
	  }, translateMessage('user-segments-open'))))), /*#__PURE__*/React.createElement(UsersTable, {
	    resourceId: resource.id,
	    users: payload.lists.verified
	  })), /*#__PURE__*/React.createElement(designSystem.Box, {
	    variant: "white",
	    p: "xxl",
	    borderRadius: "xl",
	    boxShadow: "sm",
	    style: {
	      border: '1px solid #E2E8F0'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Box, {
	    display: "flex",
	    alignItems: "center",
	    justifyContent: "space-between",
	    mb: "lg"
	  }, /*#__PURE__*/React.createElement(designSystem.Box, null, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold"
	  }, translateMessage('user-segments-unverified')), /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('user-segments-unverified-desc'))), /*#__PURE__*/React.createElement(designSystem.Box, {
	    display: "flex",
	    alignItems: "center",
	    style: {
	      gap: 12
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Badge, {
	    outline: true
	  }, payload.counts.unverified), /*#__PURE__*/React.createElement("a", {
	    href: buildUserListHref(resource.id, {
	      emailVerified: 'false'
	    })
	  }, /*#__PURE__*/React.createElement(designSystem.Button, {
	    variant: "outlined"
	  }, translateMessage('user-segments-open'))))), /*#__PURE__*/React.createElement(UsersTable, {
	    resourceId: resource.id,
	    users: payload.lists.unverified
	  })), /*#__PURE__*/React.createElement(designSystem.Box, {
	    variant: "white",
	    p: "xxl",
	    borderRadius: "xl",
	    boxShadow: "sm",
	    style: {
	      border: '1px solid #E2E8F0'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Box, {
	    display: "flex",
	    alignItems: "center",
	    justifyContent: "space-between",
	    mb: "lg"
	  }, /*#__PURE__*/React.createElement(designSystem.Box, null, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold"
	  }, translateMessage('user-segments-high-spenders')), /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('user-segments-high-spenders-desc', {
	    min: String(payload.config.highSpenderMinLtv)
	  }))), /*#__PURE__*/React.createElement(designSystem.Box, {
	    display: "flex",
	    alignItems: "center",
	    style: {
	      gap: 12
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Badge, {
	    outline: true
	  }, payload.counts.highSpenders ?? '-'))), /*#__PURE__*/React.createElement(UsersTable, {
	    resourceId: resource.id,
	    users: payload.lists.highSpenders,
	    showLtv: true,
	    showLastOrder: true
	  })), /*#__PURE__*/React.createElement(designSystem.Box, {
	    variant: "white",
	    p: "xxl",
	    borderRadius: "xl",
	    boxShadow: "sm",
	    style: {
	      border: '1px solid #E2E8F0'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Box, {
	    display: "flex",
	    alignItems: "center",
	    justifyContent: "space-between",
	    mb: "lg"
	  }, /*#__PURE__*/React.createElement(designSystem.Box, null, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold"
	  }, translateMessage('user-segments-inactive')), /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('user-segments-inactive-desc', {
	    days: String(payload.config.inactiveDays)
	  }))), /*#__PURE__*/React.createElement(designSystem.Box, {
	    display: "flex",
	    alignItems: "center",
	    style: {
	      gap: 12
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Badge, {
	    outline: true
	  }, payload.counts.inactive))), /*#__PURE__*/React.createElement(UsersTable, {
	    resourceId: resource.id,
	    users: payload.lists.inactive,
	    showLastOrder: true
	  })));
	}

	const api$5 = new adminjs.ApiClient();
	const toLocalInputValue = value => {
	  if (!value) return '';
	  const parsed = Date.parse(value);
	  if (Number.isNaN(parsed)) return '';
	  const d = new Date(parsed);
	  const pad = n => String(n).padStart(2, '0');
	  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
	};
	const formatMoney = (value, currency = 'UAH') => {
	  try {
	    return new Intl.NumberFormat(undefined, {
	      style: 'currency',
	      currency,
	      minimumFractionDigits: 2,
	      maximumFractionDigits: 2
	    }).format(value);
	  } catch {
	    return value.toFixed(2);
	  }
	};
	function ProductScheduleDiscountAction({
	  action,
	  record,
	  resource
	}) {
	  const addNotice = adminjs.useNotice();
	  const {
	    translateAction,
	    translateMessage
	  } = adminjs.useTranslation();
	  const productName = react.useMemo(() => String(record?.params?.name ?? ''), [record?.params?.name]);
	  const productSlug = react.useMemo(() => String(record?.params?.slug ?? ''), [record?.params?.slug]);
	  const productStatus = react.useMemo(() => String(record?.params?.status ?? ''), [record?.params?.status]);
	  const basePrice = react.useMemo(() => Number(record?.params?.basePrice ?? 0), [record?.params?.basePrice]);
	  const initialDiscountPrice = react.useMemo(() => record?.params?.discountPrice != null ? String(record?.params?.discountPrice) : '', [record?.params?.discountPrice]);
	  const initialStart = react.useMemo(() => toLocalInputValue(record?.params?.discountStartAt ?? null), [record?.params?.discountStartAt]);
	  const initialEnd = react.useMemo(() => toLocalInputValue(record?.params?.discountEndAt ?? null), [record?.params?.discountEndAt]);
	  const [discountPrice, setDiscountPrice] = react.useState(initialDiscountPrice);
	  const [discountStartAt, setDiscountStartAt] = react.useState(initialStart);
	  const [discountEndAt, setDiscountEndAt] = react.useState(initialEnd);
	  const [saving, setSaving] = react.useState(false);
	  const title = translateAction(action.name, resource.id);
	  const clientValidationError = react.useMemo(() => {
	    const hasWindow = Boolean(discountStartAt || discountEndAt);
	    if (hasWindow && (!discountStartAt || !discountEndAt)) {
	      return translateMessage('discount-window-invalid');
	    }
	    if (discountStartAt && discountEndAt) {
	      const start = new Date(discountStartAt);
	      const end = new Date(discountEndAt);
	      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && start.getTime() >= end.getTime()) {
	        return translateMessage('discount-window-invalid');
	      }
	    }
	    if (hasWindow && !discountPrice.trim()) {
	      return translateMessage('discount-price-required');
	    }
	    if (discountPrice.trim()) {
	      const parsed = Number(discountPrice);
	      if (!Number.isFinite(parsed) || !(parsed > 0) || !(parsed < basePrice)) {
	        return translateMessage('discount-price-invalid');
	      }
	    }
	    return null;
	  }, [basePrice, discountEndAt, discountPrice, discountStartAt, translateMessage]);
	  const currentSummary = react.useMemo(() => {
	    const dp = record?.params?.discountPrice != null ? Number(record?.params?.discountPrice) : null;
	    if (!dp) return translateMessage('discount-none');
	    const start = record?.params?.discountStartAt ?? null;
	    const end = record?.params?.discountEndAt ?? null;
	    if (!start && !end) return translateMessage('discount-always', {
	      price: formatMoney(dp)
	    });
	    return translateMessage('discount-window', {
	      price: formatMoney(dp),
	      start: start ? new Date(start).toLocaleString() : '-',
	      end: end ? new Date(end).toLocaleString() : '-'
	    });
	  }, [record?.params?.discountEndAt, record?.params?.discountPrice, record?.params?.discountStartAt, translateMessage]);
	  const handleSave = async () => {
	    if (!record?.id || saving) return;
	    if (clientValidationError) {
	      addNotice({
	        message: clientValidationError,
	        type: 'error'
	      });
	      return;
	    }
	    setSaving(true);
	    try {
	      const formData = new FormData();
	      formData.append('discountPrice', discountPrice);
	      formData.append('discountStartAt', discountStartAt ? new Date(discountStartAt).toISOString() : '');
	      formData.append('discountEndAt', discountEndAt ? new Date(discountEndAt).toISOString() : '');
	      const response = await api$5.recordAction({
	        resourceId: resource.id,
	        recordId: record.id,
	        actionName: action.name,
	        method: 'post',
	        data: formData
	      });
	      if (response.data.notice) addNotice(response.data.notice);
	    } catch {
	      addNotice({
	        message: 'discount-schedule-failed',
	        type: 'error'
	      });
	    } finally {
	      setSaving(false);
	    }
	  };
	  return /*#__PURE__*/React.createElement(designSystem.Box, {
	    variant: "white",
	    p: "xxl",
	    borderRadius: "xl",
	    boxShadow: "sm",
	    maxWidth: "720px",
	    style: {
	      border: '1px solid #E2E8F0'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontSize: "xl",
	    fontWeight: "bold",
	    mb: "md"
	  }, title), productName ? /*#__PURE__*/React.createElement(designSystem.Box, {
	    mb: "lg"
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold"
	  }, productName), /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, productSlug ? `${productSlug}` : null, productStatus ? `${productSlug ? ' • ' : ''}${productStatus}` : null)) : null, /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60",
	    mb: "lg"
	  }, translateMessage('discount-base-price'), ": ", formatMoney(basePrice)), /*#__PURE__*/React.createElement(designSystem.Text, {
	    mb: "xl"
	  }, currentSummary), /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      display: 'grid',
	      gridTemplateColumns: '1fr',
	      gap: 16
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.FormGroup, {
	    label: translateMessage('discount-price-label'),
	    mb: "0"
	  }, /*#__PURE__*/React.createElement("input", {
	    type: "number",
	    step: "0.01",
	    value: discountPrice,
	    onChange: e => setDiscountPrice(e.target.value),
	    placeholder: "0.00",
	    style: {
	      width: '100%',
	      padding: '10px 12px',
	      borderRadius: 8,
	      border: '1px solid #E2E8F0',
	      fontSize: 14
	    }
	  })), /*#__PURE__*/React.createElement(designSystem.Box, null, /*#__PURE__*/React.createElement(designSystem.Label, {
	    htmlFor: "discountStartAt"
	  }, translateMessage('discount-start')), /*#__PURE__*/React.createElement("input", {
	    id: "discountStartAt",
	    type: "datetime-local",
	    value: discountStartAt,
	    onChange: e => setDiscountStartAt(e.target.value),
	    style: {
	      width: '100%',
	      padding: '10px 12px',
	      borderRadius: 8,
	      border: '1px solid #E2E8F0',
	      marginTop: 10,
	      fontSize: 14
	    }
	  })), /*#__PURE__*/React.createElement(designSystem.Box, null, /*#__PURE__*/React.createElement(designSystem.Label, {
	    htmlFor: "discountEndAt"
	  }, translateMessage('discount-end')), /*#__PURE__*/React.createElement("input", {
	    id: "discountEndAt",
	    type: "datetime-local",
	    value: discountEndAt,
	    onChange: e => setDiscountEndAt(e.target.value),
	    style: {
	      width: '100%',
	      padding: '10px 12px',
	      borderRadius: 8,
	      border: '1px solid #E2E8F0',
	      marginTop: 10,
	      fontSize: 14
	    }
	  }))), clientValidationError ? /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "red60",
	    mt: "lg"
	  }, clientValidationError) : null, /*#__PURE__*/React.createElement(designSystem.Box, {
	    mt: "xl"
	  }, /*#__PURE__*/React.createElement(designSystem.Button, {
	    style: {
	      borderColor: 'white',
	      background: '#facc15',
	      color: 'black'
	    },
	    variant: "contained",
	    color: "primary",
	    onClick: handleSave,
	    disabled: saving
	  }, saving ? translateMessage('discount-saving') : translateMessage('discount-save'))));
	}

	function ProductNameList(props) {
	  const {
	    record,
	    property
	  } = props;
	  const name = String(record.params[property.path] ?? '');
	  const imageUrl = record.params.imageUrl ?? null;
	  return /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      display: 'flex',
	      alignItems: 'center',
	      gap: 14,
	      minWidth: 260
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      width: 64,
	      height: 64,
	      borderRadius: 10,
	      border: '1px solid #E2E8F0',
	      background: '#F8FAFC',
	      overflow: 'hidden',
	      flexShrink: 0
	    }
	  }, imageUrl ? /*#__PURE__*/React.createElement("img", {
	    src: imageUrl,
	    alt: "",
	    style: {
	      width: '100%',
	      height: '100%',
	      objectFit: 'cover',
	      display: 'block'
	    },
	    loading: "lazy"
	  }) : null), /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      display: 'flex',
	      flexDirection: 'column',
	      gap: 4,
	      minWidth: 0
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    style: {
	      fontWeight: 600,
	      whiteSpace: 'nowrap',
	      overflow: 'hidden',
	      textOverflow: 'ellipsis'
	    }
	  }, name)));
	}

	const actionButtonStyle$7 = {
	  borderColor: 'white',
	  background: '#facc15',
	  color: 'black'
	};
	const getRootPath = () => {
	  if (typeof window === 'undefined') return '';
	  const path = window.location.pathname ?? '';
	  const parts = path.split('/resources');
	  return parts[0] ?? '';
	};
	const buildListHref = (resourceId, filters) => {
	  const root = getRootPath();
	  const params = new URLSearchParams();
	  for (const [key, value] of Object.entries(filters)) {
	    params.set(`filters.${key}`, value);
	  }
	  const query = params.toString();
	  return `${root}/resources/${resourceId}${query ? `?${query}` : ''}`;
	};
	const daysAgoIso = days => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
	function ProductList(props) {
	  const {
	    resource
	  } = props;
	  const {
	    translateMessage
	  } = adminjs.useTranslation();
	  const views = [{
	    key: 'in-stock',
	    filters: {
	      inStock: 'true'
	    }
	  }, {
	    key: 'low-stock',
	    filters: {
	      inStock: 'true',
	      stock: JSON.stringify({
	        lte: 5
	      })
	    }
	  }, {
	    key: 'discounted',
	    filters: {
	      discountPrice: JSON.stringify({
	        not: null
	      })
	    }
	  }, {
	    key: 'no-image',
	    filters: {
	      imageUrl: JSON.stringify({
	        equals: null
	      })
	    }
	  }, {
	    key: 'recently-updated',
	    filters: {
	      updatedAt: JSON.stringify({
	        gte: daysAgoIso(7)
	      })
	    }
	  }, {
	    key: 'draft',
	    filters: {
	      status: 'DRAFT'
	    }
	  }];
	  return /*#__PURE__*/React.createElement(designSystem.Box, null, /*#__PURE__*/React.createElement(designSystem.Box, {
	    variant: "white",
	    p: "lg",
	    borderRadius: "xl",
	    boxShadow: "sm",
	    mb: "xl",
	    style: {
	      border: '1px solid #E2E8F0',
	      display: 'flex',
	      alignItems: 'center',
	      gap: 12,
	      flexWrap: 'wrap'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold"
	  }, translateMessage('product-views-title')), /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      display: 'flex',
	      gap: 10,
	      flexWrap: 'wrap'
	    }
	  }, views.map(view => /*#__PURE__*/React.createElement("a", {
	    key: view.key,
	    href: buildListHref(resource.id, view.filters)
	  }, /*#__PURE__*/React.createElement(designSystem.Button, {
	    variant: "contained",
	    color: "primary",
	    style: actionButtonStyle$7
	  }, translateMessage(`product-views-${view.key}`)))), /*#__PURE__*/React.createElement("a", {
	    href: buildListHref(resource.id, {})
	  }, /*#__PURE__*/React.createElement(designSystem.Button, {
	    variant: "outlined"
	  }, translateMessage('product-views-clear'))))), /*#__PURE__*/React.createElement(adminjs.OriginalList, props));
	}

	function ProductShow(props) {
	  const {
	    record
	  } = props;
	  const {
	    translateMessage
	  } = adminjs.useTranslation();
	  const name = String(record?.params?.name ?? '');
	  const imageUrl = record?.params?.imageUrl ?? null;
	  const status = String(record?.params?.status ?? '');
	  const [isOpen, setIsOpen] = react.useState(false);
	  const openImage = e => {
	    if (e) e.stopPropagation();
	    if (!imageUrl) return;
	    setIsOpen(true);
	  };
	  return /*#__PURE__*/React.createElement(designSystem.Box, null, isOpen && imageUrl ? /*#__PURE__*/React.createElement(designSystem.Modal, {
	    onClose: () => setIsOpen(false),
	    onOverlayClick: () => setIsOpen(false),
	    style: {
	      width: '92vw',
	      maxWidth: 980,
	      padding: 24,
	      paddingTop: 48
	    }
	  }, /*#__PURE__*/React.createElement("img", {
	    src: imageUrl,
	    alt: translateMessage('product-image-modal-alt'),
	    style: {
	      width: '100%',
	      height: 'auto',
	      maxHeight: '78vh',
	      objectFit: 'contain',
	      borderRadius: 12,
	      background: '#F8FAFC',
	      display: 'block'
	    }
	  })) : null, /*#__PURE__*/React.createElement(designSystem.Box, {
	    variant: "white",
	    p: "xxl",
	    borderRadius: "xl",
	    boxShadow: "sm",
	    mb: "xl",
	    style: {
	      border: '1px solid #E2E8F0',
	      display: 'flex',
	      alignItems: 'center',
	      gap: 16
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      width: 160,
	      height: 160,
	      borderRadius: 18,
	      border: '1px solid #E2E8F0',
	      background: '#F8FAFC',
	      overflow: 'hidden',
	      flexShrink: 0
	    }
	  }, imageUrl ? /*#__PURE__*/React.createElement("button", {
	    type: "button",
	    onClick: openImage,
	    style: {
	      all: 'unset',
	      cursor: 'pointer',
	      display: 'block',
	      width: '100%',
	      height: '100%'
	    },
	    "aria-label": translateMessage('product-image-modal-open')
	  }, /*#__PURE__*/React.createElement("img", {
	    src: imageUrl,
	    alt: "",
	    style: {
	      width: '100%',
	      height: '100%',
	      objectFit: 'cover',
	      display: 'block'
	    },
	    loading: "lazy"
	  })) : null), /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      minWidth: 0
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold",
	    fontSize: "xl",
	    style: {
	      whiteSpace: 'nowrap',
	      overflow: 'hidden',
	      textOverflow: 'ellipsis'
	    }
	  }, name || 'Product'), status ? /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, status) : null)), /*#__PURE__*/React.createElement(adminjs.OriginalShow, props));
	}

	const api$4 = new adminjs.ApiClient();
	const actionButtonStyle$6 = {
	  borderColor: 'white',
	  background: '#facc15',
	  color: 'black'
	};
	const resolveRecordIds$4 = records => {
	  const fromProps = (records ?? []).map(r => r.id).filter(Boolean);
	  if (fromProps.length) return fromProps;
	  if (typeof window === 'undefined') return [];
	  const raw = new URLSearchParams(window.location.search).get('recordIds') ?? '';
	  return raw.split(',').map(id => id.trim()).filter(Boolean);
	};
	function ProductBulkSetCategoryAction({
	  action,
	  resource,
	  records
	}) {
	  const addNotice = adminjs.useNotice();
	  const {
	    translateAction,
	    translateMessage
	  } = adminjs.useTranslation();
	  const recordIds = react.useMemo(() => resolveRecordIds$4(records), [records]);
	  const [options, setOptions] = react.useState([]);
	  const [categoryId, setCategoryId] = react.useState('');
	  const [saving, setSaving] = react.useState(false);
	  const [loading, setLoading] = react.useState(false);
	  react.useEffect(() => {
	    if (!recordIds.length) return;
	    setLoading(true);
	    api$4.bulkAction({
	      resourceId: resource.id,
	      recordIds,
	      actionName: action.name,
	      method: 'get'
	    }).then(res => setOptions(res.data.payload?.options ?? [])).catch(() => setOptions([])).finally(() => setLoading(false));
	  }, [action.name, recordIds, resource.id]);
	  const title = translateAction(action.name, resource.id);
	  const hasOptions = options.length > 0;
	  const canSave = !loading && hasOptions && categoryId.trim().length > 0 && recordIds.length > 0;
	  const handleSave = async () => {
	    if (!canSave || saving) return;
	    setSaving(true);
	    try {
	      const formData = new FormData();
	      formData.append('categoryId', categoryId);
	      const response = await api$4.bulkAction({
	        resourceId: resource.id,
	        recordIds,
	        actionName: action.name,
	        method: 'post',
	        data: formData
	      });
	      if (response.data.notice) addNotice(response.data.notice);
	    } catch {
	      addNotice({
	        message: 'product-bulk-failed',
	        type: 'error'
	      });
	    } finally {
	      setSaving(false);
	    }
	  };
	  return /*#__PURE__*/React.createElement(designSystem.Box, {
	    variant: "white",
	    p: "xxl",
	    borderRadius: "xl",
	    boxShadow: "sm",
	    style: {
	      border: '1px solid #E2E8F0'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontSize: "xl",
	    fontWeight: "bold",
	    mb: "md"
	  }, title), /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60",
	    mb: "xl"
	  }, translateMessage('product-bulk-selected', {
	    count: recordIds.length
	  })), loading ? /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60",
	    mb: "xl"
	  }, translateMessage('product-bulk-options-loading')) : hasOptions ? /*#__PURE__*/React.createElement(designSystem.FormGroup, null, /*#__PURE__*/React.createElement(designSystem.Label, null, translateMessage('product-bulk-category')), /*#__PURE__*/React.createElement(designSystem.Select, {
	    value: categoryId,
	    onChange: e => setCategoryId(String(e?.target?.value ?? ''))
	  }, /*#__PURE__*/React.createElement("option", {
	    value: ""
	  }, translateMessage('select-placeholder')), options.map(o => /*#__PURE__*/React.createElement("option", {
	    key: o.id,
	    value: o.id
	  }, o.label)))) : /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60",
	    mb: "xl"
	  }, translateMessage('product-bulk-no-options')), hasOptions ? /*#__PURE__*/React.createElement(designSystem.Box, {
	    mt: "xl"
	  }, /*#__PURE__*/React.createElement(designSystem.Button, {
	    variant: "contained",
	    color: "primary",
	    style: actionButtonStyle$6,
	    disabled: !canSave || saving,
	    onClick: handleSave
	  }, saving ? translateMessage('product-bulk-saving') : translateMessage('product-bulk-apply'))) : null);
	}

	const api$3 = new adminjs.ApiClient();
	const actionButtonStyle$5 = {
	  borderColor: 'white',
	  background: '#facc15',
	  color: 'black'
	};
	const resolveRecordIds$3 = records => {
	  const fromProps = (records ?? []).map(r => r.id).filter(Boolean);
	  if (fromProps.length) return fromProps;
	  if (typeof window === 'undefined') return [];
	  const raw = new URLSearchParams(window.location.search).get('recordIds') ?? '';
	  return raw.split(',').map(id => id.trim()).filter(Boolean);
	};
	function ProductBulkSetBrandAction({
	  action,
	  resource,
	  records
	}) {
	  const addNotice = adminjs.useNotice();
	  const {
	    translateAction,
	    translateMessage
	  } = adminjs.useTranslation();
	  const recordIds = react.useMemo(() => resolveRecordIds$3(records), [records]);
	  const [options, setOptions] = react.useState([]);
	  const [brandId, setBrandId] = react.useState('');
	  const [saving, setSaving] = react.useState(false);
	  const [loading, setLoading] = react.useState(false);
	  react.useEffect(() => {
	    if (!recordIds.length) return;
	    setLoading(true);
	    api$3.bulkAction({
	      resourceId: resource.id,
	      recordIds,
	      actionName: action.name,
	      method: 'get'
	    }).then(res => setOptions(res.data.payload?.options ?? [])).catch(() => setOptions([])).finally(() => setLoading(false));
	  }, [action.name, recordIds, resource.id]);
	  const title = translateAction(action.name, resource.id);
	  const hasOptions = options.length > 0;
	  const canSave = !loading && hasOptions && brandId.trim().length > 0 && recordIds.length > 0;
	  const handleSave = async () => {
	    if (!canSave || saving) return;
	    setSaving(true);
	    try {
	      const formData = new FormData();
	      formData.append('brandId', brandId);
	      const response = await api$3.bulkAction({
	        resourceId: resource.id,
	        recordIds,
	        actionName: action.name,
	        method: 'post',
	        data: formData
	      });
	      if (response.data.notice) addNotice(response.data.notice);
	    } catch {
	      addNotice({
	        message: 'product-bulk-failed',
	        type: 'error'
	      });
	    } finally {
	      setSaving(false);
	    }
	  };
	  return /*#__PURE__*/React.createElement(designSystem.Box, {
	    variant: "white",
	    p: "xxl",
	    borderRadius: "xl",
	    boxShadow: "sm",
	    style: {
	      border: '1px solid #E2E8F0'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontSize: "xl",
	    fontWeight: "bold",
	    mb: "md"
	  }, title), /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60",
	    mb: "xl"
	  }, translateMessage('product-bulk-selected', {
	    count: recordIds.length
	  })), loading ? /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60",
	    mb: "xl"
	  }, translateMessage('product-bulk-options-loading')) : hasOptions ? /*#__PURE__*/React.createElement(designSystem.FormGroup, null, /*#__PURE__*/React.createElement(designSystem.Label, null, translateMessage('product-bulk-brand')), /*#__PURE__*/React.createElement(designSystem.Select, {
	    value: brandId,
	    onChange: e => setBrandId(String(e?.target?.value ?? ''))
	  }, /*#__PURE__*/React.createElement("option", {
	    value: ""
	  }, translateMessage('select-placeholder')), options.map(o => /*#__PURE__*/React.createElement("option", {
	    key: o.id,
	    value: o.id
	  }, o.label)))) : /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60",
	    mb: "xl"
	  }, translateMessage('product-bulk-no-options')), hasOptions ? /*#__PURE__*/React.createElement(designSystem.Box, {
	    mt: "xl"
	  }, /*#__PURE__*/React.createElement(designSystem.Button, {
	    variant: "contained",
	    color: "primary",
	    style: actionButtonStyle$5,
	    disabled: !canSave || saving,
	    onClick: handleSave
	  }, saving ? translateMessage('product-bulk-saving') : translateMessage('product-bulk-apply'))) : null);
	}

	const api$2 = new adminjs.ApiClient();
	const actionButtonStyle$4 = {
	  borderColor: 'white',
	  background: '#facc15',
	  color: 'black'
	};
	const resolveRecordIds$2 = records => {
	  const fromProps = (records ?? []).map(r => r.id).filter(Boolean);
	  if (fromProps.length) return fromProps;
	  if (typeof window === 'undefined') return [];
	  const raw = new URLSearchParams(window.location.search).get('recordIds') ?? '';
	  return raw.split(',').map(id => id.trim()).filter(Boolean);
	};
	function ProductBulkEditTagsAction({
	  action,
	  resource,
	  records
	}) {
	  const addNotice = adminjs.useNotice();
	  const {
	    translateAction,
	    translateMessage
	  } = adminjs.useTranslation();
	  const recordIds = react.useMemo(() => resolveRecordIds$2(records), [records]);
	  const [mode, setMode] = react.useState('add');
	  const [tags, setTags] = react.useState('');
	  const [saving, setSaving] = react.useState(false);
	  const title = translateAction(action.name, resource.id);
	  const canSave = recordIds.length > 0 && tags.trim().length > 0;
	  const handleSave = async () => {
	    if (!canSave || saving) return;
	    setSaving(true);
	    try {
	      const formData = new FormData();
	      formData.append('mode', mode);
	      formData.append('tags', tags);
	      const response = await api$2.bulkAction({
	        resourceId: resource.id,
	        recordIds,
	        actionName: action.name,
	        method: 'post',
	        data: formData
	      });
	      if (response.data.notice) addNotice(response.data.notice);
	    } catch {
	      addNotice({
	        message: 'product-bulk-failed',
	        type: 'error'
	      });
	    } finally {
	      setSaving(false);
	    }
	  };
	  return /*#__PURE__*/React.createElement(designSystem.Box, {
	    variant: "white",
	    p: "xxl",
	    borderRadius: "xl",
	    boxShadow: "sm",
	    style: {
	      border: '1px solid #E2E8F0'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontSize: "xl",
	    fontWeight: "bold",
	    mb: "md"
	  }, title), /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60",
	    mb: "xl"
	  }, translateMessage('product-bulk-selected', {
	    count: recordIds.length
	  })), /*#__PURE__*/React.createElement(designSystem.FormGroup, null, /*#__PURE__*/React.createElement(designSystem.Label, null, translateMessage('product-bulk-tags-mode')), /*#__PURE__*/React.createElement(designSystem.Select, {
	    value: mode,
	    onChange: e => setMode(String(e?.target?.value ?? 'add'))
	  }, /*#__PURE__*/React.createElement("option", {
	    value: "add"
	  }, translateMessage('product-bulk-tags-add')), /*#__PURE__*/React.createElement("option", {
	    value: "remove"
	  }, translateMessage('product-bulk-tags-remove')), /*#__PURE__*/React.createElement("option", {
	    value: "replace"
	  }, translateMessage('product-bulk-tags-replace')))), /*#__PURE__*/React.createElement(designSystem.FormGroup, null, /*#__PURE__*/React.createElement(designSystem.Label, null, translateMessage('product-bulk-tags')), /*#__PURE__*/React.createElement("input", {
	    value: tags,
	    onChange: e => setTags(e.target.value),
	    placeholder: "popular,new",
	    style: {
	      width: '100%',
	      padding: '10px 12px',
	      borderRadius: 8,
	      border: '1px solid #E2E8F0',
	      fontSize: 14
	    }
	  }), /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60",
	    mt: "default"
	  }, translateMessage('product-bulk-tags-hint'))), /*#__PURE__*/React.createElement(designSystem.Box, {
	    mt: "xl"
	  }, /*#__PURE__*/React.createElement(designSystem.Button, {
	    variant: "contained",
	    color: "primary",
	    style: actionButtonStyle$4,
	    disabled: !canSave || saving,
	    onClick: handleSave
	  }, saving ? translateMessage('product-bulk-saving') : translateMessage('product-bulk-apply'))));
	}

	const api$1 = new adminjs.ApiClient();
	const actionButtonStyle$3 = {
	  borderColor: 'white',
	  background: '#facc15',
	  color: 'black'
	};
	const resolveRecordIds$1 = records => {
	  const fromProps = (records ?? []).map(r => r.id).filter(Boolean);
	  if (fromProps.length) return fromProps;
	  if (typeof window === 'undefined') return [];
	  const raw = new URLSearchParams(window.location.search).get('recordIds') ?? '';
	  return raw.split(',').map(id => id.trim()).filter(Boolean);
	};
	function ProductBulkAdjustPriceAction({
	  action,
	  resource,
	  records
	}) {
	  const addNotice = adminjs.useNotice();
	  const {
	    translateAction,
	    translateMessage
	  } = adminjs.useTranslation();
	  const recordIds = react.useMemo(() => resolveRecordIds$1(records), [records]);
	  const [direction, setDirection] = react.useState('increase');
	  const [kind, setKind] = react.useState('percent');
	  const [value, setValue] = react.useState('10');
	  const [applyToDiscount, setApplyToDiscount] = react.useState(false);
	  const [saving, setSaving] = react.useState(false);
	  const title = translateAction(action.name, resource.id);
	  const parsedValue = Number(value);
	  const canSave = recordIds.length > 0 && Number.isFinite(parsedValue) && parsedValue > 0;
	  const handleSave = async () => {
	    if (!canSave || saving) return;
	    setSaving(true);
	    try {
	      const formData = new FormData();
	      formData.append('direction', direction);
	      formData.append('kind', kind);
	      formData.append('value', value);
	      formData.append('applyToDiscount', String(applyToDiscount));
	      const response = await api$1.bulkAction({
	        resourceId: resource.id,
	        recordIds,
	        actionName: action.name,
	        method: 'post',
	        data: formData
	      });
	      if (response.data.notice) addNotice(response.data.notice);
	    } catch {
	      addNotice({
	        message: 'product-bulk-failed',
	        type: 'error'
	      });
	    } finally {
	      setSaving(false);
	    }
	  };
	  return /*#__PURE__*/React.createElement(designSystem.Box, {
	    variant: "white",
	    p: "xxl",
	    borderRadius: "xl",
	    boxShadow: "sm",
	    style: {
	      border: '1px solid #E2E8F0'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontSize: "xl",
	    fontWeight: "bold",
	    mb: "md"
	  }, title), /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60",
	    mb: "xl"
	  }, translateMessage('product-bulk-selected', {
	    count: recordIds.length
	  })), /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      display: 'grid',
	      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
	      gap: 12
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.FormGroup, null, /*#__PURE__*/React.createElement(designSystem.Label, null, translateMessage('product-bulk-price-direction')), /*#__PURE__*/React.createElement(designSystem.Select, {
	    value: direction,
	    onChange: e => setDirection(String(e?.target?.value ?? 'increase'))
	  }, /*#__PURE__*/React.createElement("option", {
	    value: "increase"
	  }, translateMessage('product-bulk-price-increase')), /*#__PURE__*/React.createElement("option", {
	    value: "decrease"
	  }, translateMessage('product-bulk-price-decrease')))), /*#__PURE__*/React.createElement(designSystem.FormGroup, null, /*#__PURE__*/React.createElement(designSystem.Label, null, translateMessage('product-bulk-price-kind')), /*#__PURE__*/React.createElement(designSystem.Select, {
	    value: kind,
	    onChange: e => setKind(String(e?.target?.value ?? 'percent'))
	  }, /*#__PURE__*/React.createElement("option", {
	    value: "percent"
	  }, translateMessage('product-bulk-price-percent')), /*#__PURE__*/React.createElement("option", {
	    value: "fixed"
	  }, translateMessage('product-bulk-price-fixed')))), /*#__PURE__*/React.createElement(designSystem.FormGroup, null, /*#__PURE__*/React.createElement(designSystem.Label, null, translateMessage('product-bulk-price-value')), /*#__PURE__*/React.createElement("input", {
	    type: "number",
	    step: "0.01",
	    value: value,
	    onChange: e => setValue(e.target.value),
	    style: {
	      width: '100%',
	      padding: '10px 12px',
	      borderRadius: 8,
	      border: '1px solid #E2E8F0',
	      fontSize: 14
	    }
	  }))), /*#__PURE__*/React.createElement(designSystem.Box, {
	    mt: "lg"
	  }, /*#__PURE__*/React.createElement("label", {
	    style: {
	      display: 'flex',
	      gap: 10,
	      alignItems: 'center'
	    }
	  }, /*#__PURE__*/React.createElement("input", {
	    type: "checkbox",
	    checked: applyToDiscount,
	    onChange: e => setApplyToDiscount(e.target.checked)
	  }), /*#__PURE__*/React.createElement(designSystem.Text, null, translateMessage('product-bulk-price-apply-discount')))), /*#__PURE__*/React.createElement(designSystem.Box, {
	    mt: "xl"
	  }, /*#__PURE__*/React.createElement(designSystem.Button, {
	    variant: "contained",
	    color: "primary",
	    style: actionButtonStyle$3,
	    disabled: !canSave || saving,
	    onClick: handleSave
	  }, saving ? translateMessage('product-bulk-saving') : translateMessage('product-bulk-apply'))));
	}

	const api = new adminjs.ApiClient();
	const actionButtonStyle$2 = {
	  borderColor: 'white',
	  background: '#facc15',
	  color: 'black'
	};
	const resolveRecordIds = records => {
	  const fromProps = (records ?? []).map(r => r.id).filter(Boolean);
	  if (fromProps.length) return fromProps;
	  if (typeof window === 'undefined') return [];
	  const raw = new URLSearchParams(window.location.search).get('recordIds') ?? '';
	  return raw.split(',').map(id => id.trim()).filter(Boolean);
	};
	function ProductBulkToggleInStockAction({
	  action,
	  resource,
	  records
	}) {
	  const addNotice = adminjs.useNotice();
	  const {
	    translateAction,
	    translateMessage
	  } = adminjs.useTranslation();
	  const recordIds = react.useMemo(() => resolveRecordIds(records), [records]);
	  const [mode, setMode] = react.useState('toggle');
	  const [value, setValue] = react.useState('true');
	  const [saving, setSaving] = react.useState(false);
	  const title = translateAction(action.name, resource.id);
	  const canSave = recordIds.length > 0;
	  const handleSave = async () => {
	    if (!canSave || saving) return;
	    setSaving(true);
	    try {
	      const formData = new FormData();
	      formData.append('mode', mode);
	      formData.append('value', value);
	      const response = await api.bulkAction({
	        resourceId: resource.id,
	        recordIds,
	        actionName: action.name,
	        method: 'post',
	        data: formData
	      });
	      if (response.data.notice) addNotice(response.data.notice);
	    } catch {
	      addNotice({
	        message: 'product-bulk-failed',
	        type: 'error'
	      });
	    } finally {
	      setSaving(false);
	    }
	  };
	  return /*#__PURE__*/React.createElement(designSystem.Box, {
	    variant: "white",
	    p: "xxl",
	    borderRadius: "xl",
	    boxShadow: "sm",
	    style: {
	      border: '1px solid #E2E8F0'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontSize: "xl",
	    fontWeight: "bold",
	    mb: "md"
	  }, title), /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60",
	    mb: "xl"
	  }, translateMessage('product-bulk-selected', {
	    count: recordIds.length
	  })), /*#__PURE__*/React.createElement(designSystem.FormGroup, null, /*#__PURE__*/React.createElement(designSystem.Label, null, translateMessage('product-bulk-stock-mode')), /*#__PURE__*/React.createElement(designSystem.Select, {
	    value: mode,
	    onChange: e => setMode(String(e?.target?.value ?? 'toggle'))
	  }, /*#__PURE__*/React.createElement("option", {
	    value: "toggle"
	  }, translateMessage('product-bulk-stock-toggle')), /*#__PURE__*/React.createElement("option", {
	    value: "set"
	  }, translateMessage('product-bulk-stock-set')))), mode === 'set' ? /*#__PURE__*/React.createElement(designSystem.FormGroup, null, /*#__PURE__*/React.createElement(designSystem.Label, null, translateMessage('product-bulk-stock-value')), /*#__PURE__*/React.createElement(designSystem.Select, {
	    value: value,
	    onChange: e => setValue(String(e?.target?.value ?? 'true'))
	  }, /*#__PURE__*/React.createElement("option", {
	    value: "true"
	  }, translateMessage('labels.inStock.true')), /*#__PURE__*/React.createElement("option", {
	    value: "false"
	  }, translateMessage('labels.inStock.false')))) : null, /*#__PURE__*/React.createElement(designSystem.Box, {
	    mt: "xl"
	  }, /*#__PURE__*/React.createElement(designSystem.Button, {
	    variant: "contained",
	    color: "primary",
	    style: actionButtonStyle$2,
	    disabled: !canSave || saving,
	    onClick: handleSave
	  }, saving ? translateMessage('product-bulk-saving') : translateMessage('product-bulk-apply'))));
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
	    onClick: goTo('resources/Product/actions/new')
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
	const labelStyle = {
	  fontSize: 14
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
	  const [email, setEmail] = react.useState('test@com');
	  const [password, setPassword] = react.useState('test');
	  const handleEmailChange = event => {
	    setEmail(event.target.value);
	  };
	  const handlePasswordChange = event => {
	    setPassword(event.target.value);
	  };
	  return /*#__PURE__*/React.createElement(designSystem.Box, {
	    variant: "grey",
	    flex: true,
	    className: "admin-login-page",
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
	    required: true,
	    style: labelStyle
	  }, translateComponent('Login.properties.email')), /*#__PURE__*/React.createElement(designSystem.Input, {
	    name: "email",
	    type: "email",
	    autoComplete: "off",
	    placeholder: translateComponent('Login.properties.email'),
	    value: email,
	    onChange: handleEmailChange
	  })), /*#__PURE__*/React.createElement(designSystem.FormGroup, null, /*#__PURE__*/React.createElement(designSystem.Label, {
	    required: true,
	    style: labelStyle
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
	  const supportedLngsRaw = i18n?.options?.supportedLngs;
	  const supportedLngs = Array.isArray(supportedLngsRaw) ? supportedLngsRaw : [];
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
	  const logoutPath = paths?.logoutPath ?? `${rootPath}/logout`;
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
	    paths: {
	      logoutPath
	    }
	  }) : null);
	}

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	/**
	 * Checks if `value` is `null` or `undefined`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is nullish, else `false`.
	 * @example
	 *
	 * _.isNil(null);
	 * // => true
	 *
	 * _.isNil(void 0);
	 * // => true
	 *
	 * _.isNil(NaN);
	 * // => false
	 */

	function isNil(value) {
	  return value == null;
	}

	var isNil_1 = isNil;

	var isNil$1 = /*@__PURE__*/getDefaultExportFromCjs(isNil_1);

	/**
	 * A specialized version of `_.map` for arrays without support for iteratee
	 * shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the new mapped array.
	 */

	function arrayMap$2(array, iteratee) {
	  var index = -1,
	      length = array == null ? 0 : array.length,
	      result = Array(length);

	  while (++index < length) {
	    result[index] = iteratee(array[index], index, array);
	  }
	  return result;
	}

	var _arrayMap = arrayMap$2;

	/**
	 * Removes all key-value entries from the list cache.
	 *
	 * @private
	 * @name clear
	 * @memberOf ListCache
	 */

	function listCacheClear$1() {
	  this.__data__ = [];
	  this.size = 0;
	}

	var _listCacheClear = listCacheClear$1;

	/**
	 * Performs a
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * comparison between two values to determine if they are equivalent.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 * var other = { 'a': 1 };
	 *
	 * _.eq(object, object);
	 * // => true
	 *
	 * _.eq(object, other);
	 * // => false
	 *
	 * _.eq('a', 'a');
	 * // => true
	 *
	 * _.eq('a', Object('a'));
	 * // => false
	 *
	 * _.eq(NaN, NaN);
	 * // => true
	 */

	function eq$3(value, other) {
	  return value === other || (value !== value && other !== other);
	}

	var eq_1 = eq$3;

	var eq$2 = eq_1;

	/**
	 * Gets the index at which the `key` is found in `array` of key-value pairs.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} key The key to search for.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function assocIndexOf$4(array, key) {
	  var length = array.length;
	  while (length--) {
	    if (eq$2(array[length][0], key)) {
	      return length;
	    }
	  }
	  return -1;
	}

	var _assocIndexOf = assocIndexOf$4;

	var assocIndexOf$3 = _assocIndexOf;

	/** Used for built-in method references. */
	var arrayProto = Array.prototype;

	/** Built-in value references. */
	var splice = arrayProto.splice;

	/**
	 * Removes `key` and its value from the list cache.
	 *
	 * @private
	 * @name delete
	 * @memberOf ListCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function listCacheDelete$1(key) {
	  var data = this.__data__,
	      index = assocIndexOf$3(data, key);

	  if (index < 0) {
	    return false;
	  }
	  var lastIndex = data.length - 1;
	  if (index == lastIndex) {
	    data.pop();
	  } else {
	    splice.call(data, index, 1);
	  }
	  --this.size;
	  return true;
	}

	var _listCacheDelete = listCacheDelete$1;

	var assocIndexOf$2 = _assocIndexOf;

	/**
	 * Gets the list cache value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf ListCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function listCacheGet$1(key) {
	  var data = this.__data__,
	      index = assocIndexOf$2(data, key);

	  return index < 0 ? undefined : data[index][1];
	}

	var _listCacheGet = listCacheGet$1;

	var assocIndexOf$1 = _assocIndexOf;

	/**
	 * Checks if a list cache value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf ListCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function listCacheHas$1(key) {
	  return assocIndexOf$1(this.__data__, key) > -1;
	}

	var _listCacheHas = listCacheHas$1;

	var assocIndexOf = _assocIndexOf;

	/**
	 * Sets the list cache `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf ListCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the list cache instance.
	 */
	function listCacheSet$1(key, value) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);

	  if (index < 0) {
	    ++this.size;
	    data.push([key, value]);
	  } else {
	    data[index][1] = value;
	  }
	  return this;
	}

	var _listCacheSet = listCacheSet$1;

	var listCacheClear = _listCacheClear,
	    listCacheDelete = _listCacheDelete,
	    listCacheGet = _listCacheGet,
	    listCacheHas = _listCacheHas,
	    listCacheSet = _listCacheSet;

	/**
	 * Creates an list cache object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function ListCache$4(entries) {
	  var index = -1,
	      length = entries == null ? 0 : entries.length;

	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	// Add methods to `ListCache`.
	ListCache$4.prototype.clear = listCacheClear;
	ListCache$4.prototype['delete'] = listCacheDelete;
	ListCache$4.prototype.get = listCacheGet;
	ListCache$4.prototype.has = listCacheHas;
	ListCache$4.prototype.set = listCacheSet;

	var _ListCache = ListCache$4;

	var ListCache$3 = _ListCache;

	/**
	 * Removes all key-value entries from the stack.
	 *
	 * @private
	 * @name clear
	 * @memberOf Stack
	 */
	function stackClear$1() {
	  this.__data__ = new ListCache$3;
	  this.size = 0;
	}

	var _stackClear = stackClear$1;

	/**
	 * Removes `key` and its value from the stack.
	 *
	 * @private
	 * @name delete
	 * @memberOf Stack
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */

	function stackDelete$1(key) {
	  var data = this.__data__,
	      result = data['delete'](key);

	  this.size = data.size;
	  return result;
	}

	var _stackDelete = stackDelete$1;

	/**
	 * Gets the stack value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Stack
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */

	function stackGet$1(key) {
	  return this.__data__.get(key);
	}

	var _stackGet = stackGet$1;

	/**
	 * Checks if a stack value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Stack
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */

	function stackHas$1(key) {
	  return this.__data__.has(key);
	}

	var _stackHas = stackHas$1;

	/** Detect free variable `global` from Node.js. */

	var freeGlobal$1 = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

	var _freeGlobal = freeGlobal$1;

	var freeGlobal = _freeGlobal;

	/** Detect free variable `self`. */
	var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

	/** Used as a reference to the global object. */
	var root$8 = freeGlobal || freeSelf || Function('return this')();

	var _root = root$8;

	var root$7 = _root;

	/** Built-in value references. */
	var Symbol$4 = root$7.Symbol;

	var _Symbol = Symbol$4;

	var Symbol$3 = _Symbol;

	/** Used for built-in method references. */
	var objectProto$d = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$a = objectProto$d.hasOwnProperty;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var nativeObjectToString$1 = objectProto$d.toString;

	/** Built-in value references. */
	var symToStringTag$1 = Symbol$3 ? Symbol$3.toStringTag : undefined;

	/**
	 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the raw `toStringTag`.
	 */
	function getRawTag$1(value) {
	  var isOwn = hasOwnProperty$a.call(value, symToStringTag$1),
	      tag = value[symToStringTag$1];

	  try {
	    value[symToStringTag$1] = undefined;
	    var unmasked = true;
	  } catch (e) {}

	  var result = nativeObjectToString$1.call(value);
	  if (unmasked) {
	    if (isOwn) {
	      value[symToStringTag$1] = tag;
	    } else {
	      delete value[symToStringTag$1];
	    }
	  }
	  return result;
	}

	var _getRawTag = getRawTag$1;

	/** Used for built-in method references. */

	var objectProto$c = Object.prototype;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var nativeObjectToString = objectProto$c.toString;

	/**
	 * Converts `value` to a string using `Object.prototype.toString`.
	 *
	 * @private
	 * @param {*} value The value to convert.
	 * @returns {string} Returns the converted string.
	 */
	function objectToString$1(value) {
	  return nativeObjectToString.call(value);
	}

	var _objectToString = objectToString$1;

	var Symbol$2 = _Symbol,
	    getRawTag = _getRawTag,
	    objectToString = _objectToString;

	/** `Object#toString` result references. */
	var nullTag = '[object Null]',
	    undefinedTag = '[object Undefined]';

	/** Built-in value references. */
	var symToStringTag = Symbol$2 ? Symbol$2.toStringTag : undefined;

	/**
	 * The base implementation of `getTag` without fallbacks for buggy environments.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	function baseGetTag$5(value) {
	  if (value == null) {
	    return value === undefined ? undefinedTag : nullTag;
	  }
	  return (symToStringTag && symToStringTag in Object(value))
	    ? getRawTag(value)
	    : objectToString(value);
	}

	var _baseGetTag = baseGetTag$5;

	/**
	 * Checks if `value` is the
	 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
	 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */

	function isObject$5(value) {
	  var type = typeof value;
	  return value != null && (type == 'object' || type == 'function');
	}

	var isObject_1 = isObject$5;

	var baseGetTag$4 = _baseGetTag,
	    isObject$4 = isObject_1;

	/** `Object#toString` result references. */
	var asyncTag = '[object AsyncFunction]',
	    funcTag$1 = '[object Function]',
	    genTag = '[object GeneratorFunction]',
	    proxyTag = '[object Proxy]';

	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction$2(value) {
	  if (!isObject$4(value)) {
	    return false;
	  }
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 9 which returns 'object' for typed arrays and other constructors.
	  var tag = baseGetTag$4(value);
	  return tag == funcTag$1 || tag == genTag || tag == asyncTag || tag == proxyTag;
	}

	var isFunction_1 = isFunction$2;

	var root$6 = _root;

	/** Used to detect overreaching core-js shims. */
	var coreJsData$1 = root$6['__core-js_shared__'];

	var _coreJsData = coreJsData$1;

	var coreJsData = _coreJsData;

	/** Used to detect methods masquerading as native. */
	var maskSrcKey = (function() {
	  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
	  return uid ? ('Symbol(src)_1.' + uid) : '';
	}());

	/**
	 * Checks if `func` has its source masked.
	 *
	 * @private
	 * @param {Function} func The function to check.
	 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
	 */
	function isMasked$1(func) {
	  return !!maskSrcKey && (maskSrcKey in func);
	}

	var _isMasked = isMasked$1;

	/** Used for built-in method references. */

	var funcProto$1 = Function.prototype;

	/** Used to resolve the decompiled source of functions. */
	var funcToString$1 = funcProto$1.toString;

	/**
	 * Converts `func` to its source code.
	 *
	 * @private
	 * @param {Function} func The function to convert.
	 * @returns {string} Returns the source code.
	 */
	function toSource$2(func) {
	  if (func != null) {
	    try {
	      return funcToString$1.call(func);
	    } catch (e) {}
	    try {
	      return (func + '');
	    } catch (e) {}
	  }
	  return '';
	}

	var _toSource = toSource$2;

	var isFunction$1 = isFunction_1,
	    isMasked = _isMasked,
	    isObject$3 = isObject_1,
	    toSource$1 = _toSource;

	/**
	 * Used to match `RegExp`
	 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
	 */
	var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

	/** Used to detect host constructors (Safari). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;

	/** Used for built-in method references. */
	var funcProto = Function.prototype,
	    objectProto$b = Object.prototype;

	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;

	/** Used to check objects for own properties. */
	var hasOwnProperty$9 = objectProto$b.hasOwnProperty;

	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  funcToString.call(hasOwnProperty$9).replace(reRegExpChar, '\\$&')
	  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	);

	/**
	 * The base implementation of `_.isNative` without bad shim checks.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function,
	 *  else `false`.
	 */
	function baseIsNative$1(value) {
	  if (!isObject$3(value) || isMasked(value)) {
	    return false;
	  }
	  var pattern = isFunction$1(value) ? reIsNative : reIsHostCtor;
	  return pattern.test(toSource$1(value));
	}

	var _baseIsNative = baseIsNative$1;

	/**
	 * Gets the value at `key` of `object`.
	 *
	 * @private
	 * @param {Object} [object] The object to query.
	 * @param {string} key The key of the property to get.
	 * @returns {*} Returns the property value.
	 */

	function getValue$1(object, key) {
	  return object == null ? undefined : object[key];
	}

	var _getValue = getValue$1;

	var baseIsNative = _baseIsNative,
	    getValue = _getValue;

	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative$7(object, key) {
	  var value = getValue(object, key);
	  return baseIsNative(value) ? value : undefined;
	}

	var _getNative = getNative$7;

	var getNative$6 = _getNative,
	    root$5 = _root;

	/* Built-in method references that are verified to be native. */
	var Map$3 = getNative$6(root$5, 'Map');

	var _Map = Map$3;

	var getNative$5 = _getNative;

	/* Built-in method references that are verified to be native. */
	var nativeCreate$4 = getNative$5(Object, 'create');

	var _nativeCreate = nativeCreate$4;

	var nativeCreate$3 = _nativeCreate;

	/**
	 * Removes all key-value entries from the hash.
	 *
	 * @private
	 * @name clear
	 * @memberOf Hash
	 */
	function hashClear$1() {
	  this.__data__ = nativeCreate$3 ? nativeCreate$3(null) : {};
	  this.size = 0;
	}

	var _hashClear = hashClear$1;

	/**
	 * Removes `key` and its value from the hash.
	 *
	 * @private
	 * @name delete
	 * @memberOf Hash
	 * @param {Object} hash The hash to modify.
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */

	function hashDelete$1(key) {
	  var result = this.has(key) && delete this.__data__[key];
	  this.size -= result ? 1 : 0;
	  return result;
	}

	var _hashDelete = hashDelete$1;

	var nativeCreate$2 = _nativeCreate;

	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED$2 = '__lodash_hash_undefined__';

	/** Used for built-in method references. */
	var objectProto$a = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$8 = objectProto$a.hasOwnProperty;

	/**
	 * Gets the hash value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Hash
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function hashGet$1(key) {
	  var data = this.__data__;
	  if (nativeCreate$2) {
	    var result = data[key];
	    return result === HASH_UNDEFINED$2 ? undefined : result;
	  }
	  return hasOwnProperty$8.call(data, key) ? data[key] : undefined;
	}

	var _hashGet = hashGet$1;

	var nativeCreate$1 = _nativeCreate;

	/** Used for built-in method references. */
	var objectProto$9 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$7 = objectProto$9.hasOwnProperty;

	/**
	 * Checks if a hash value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Hash
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function hashHas$1(key) {
	  var data = this.__data__;
	  return nativeCreate$1 ? (data[key] !== undefined) : hasOwnProperty$7.call(data, key);
	}

	var _hashHas = hashHas$1;

	var nativeCreate = _nativeCreate;

	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

	/**
	 * Sets the hash `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Hash
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the hash instance.
	 */
	function hashSet$1(key, value) {
	  var data = this.__data__;
	  this.size += this.has(key) ? 0 : 1;
	  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED$1 : value;
	  return this;
	}

	var _hashSet = hashSet$1;

	var hashClear = _hashClear,
	    hashDelete = _hashDelete,
	    hashGet = _hashGet,
	    hashHas = _hashHas,
	    hashSet = _hashSet;

	/**
	 * Creates a hash object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Hash$1(entries) {
	  var index = -1,
	      length = entries == null ? 0 : entries.length;

	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	// Add methods to `Hash`.
	Hash$1.prototype.clear = hashClear;
	Hash$1.prototype['delete'] = hashDelete;
	Hash$1.prototype.get = hashGet;
	Hash$1.prototype.has = hashHas;
	Hash$1.prototype.set = hashSet;

	var _Hash = Hash$1;

	var Hash = _Hash,
	    ListCache$2 = _ListCache,
	    Map$2 = _Map;

	/**
	 * Removes all key-value entries from the map.
	 *
	 * @private
	 * @name clear
	 * @memberOf MapCache
	 */
	function mapCacheClear$1() {
	  this.size = 0;
	  this.__data__ = {
	    'hash': new Hash,
	    'map': new (Map$2 || ListCache$2),
	    'string': new Hash
	  };
	}

	var _mapCacheClear = mapCacheClear$1;

	/**
	 * Checks if `value` is suitable for use as unique object key.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
	 */

	function isKeyable$1(value) {
	  var type = typeof value;
	  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
	    ? (value !== '__proto__')
	    : (value === null);
	}

	var _isKeyable = isKeyable$1;

	var isKeyable = _isKeyable;

	/**
	 * Gets the data for `map`.
	 *
	 * @private
	 * @param {Object} map The map to query.
	 * @param {string} key The reference key.
	 * @returns {*} Returns the map data.
	 */
	function getMapData$4(map, key) {
	  var data = map.__data__;
	  return isKeyable(key)
	    ? data[typeof key == 'string' ? 'string' : 'hash']
	    : data.map;
	}

	var _getMapData = getMapData$4;

	var getMapData$3 = _getMapData;

	/**
	 * Removes `key` and its value from the map.
	 *
	 * @private
	 * @name delete
	 * @memberOf MapCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function mapCacheDelete$1(key) {
	  var result = getMapData$3(this, key)['delete'](key);
	  this.size -= result ? 1 : 0;
	  return result;
	}

	var _mapCacheDelete = mapCacheDelete$1;

	var getMapData$2 = _getMapData;

	/**
	 * Gets the map value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf MapCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function mapCacheGet$1(key) {
	  return getMapData$2(this, key).get(key);
	}

	var _mapCacheGet = mapCacheGet$1;

	var getMapData$1 = _getMapData;

	/**
	 * Checks if a map value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf MapCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function mapCacheHas$1(key) {
	  return getMapData$1(this, key).has(key);
	}

	var _mapCacheHas = mapCacheHas$1;

	var getMapData = _getMapData;

	/**
	 * Sets the map `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf MapCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the map cache instance.
	 */
	function mapCacheSet$1(key, value) {
	  var data = getMapData(this, key),
	      size = data.size;

	  data.set(key, value);
	  this.size += data.size == size ? 0 : 1;
	  return this;
	}

	var _mapCacheSet = mapCacheSet$1;

	var mapCacheClear = _mapCacheClear,
	    mapCacheDelete = _mapCacheDelete,
	    mapCacheGet = _mapCacheGet,
	    mapCacheHas = _mapCacheHas,
	    mapCacheSet = _mapCacheSet;

	/**
	 * Creates a map cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function MapCache$3(entries) {
	  var index = -1,
	      length = entries == null ? 0 : entries.length;

	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	// Add methods to `MapCache`.
	MapCache$3.prototype.clear = mapCacheClear;
	MapCache$3.prototype['delete'] = mapCacheDelete;
	MapCache$3.prototype.get = mapCacheGet;
	MapCache$3.prototype.has = mapCacheHas;
	MapCache$3.prototype.set = mapCacheSet;

	var _MapCache = MapCache$3;

	var ListCache$1 = _ListCache,
	    Map$1 = _Map,
	    MapCache$2 = _MapCache;

	/** Used as the size to enable large array optimizations. */
	var LARGE_ARRAY_SIZE = 200;

	/**
	 * Sets the stack `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Stack
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the stack cache instance.
	 */
	function stackSet$1(key, value) {
	  var data = this.__data__;
	  if (data instanceof ListCache$1) {
	    var pairs = data.__data__;
	    if (!Map$1 || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
	      pairs.push([key, value]);
	      this.size = ++data.size;
	      return this;
	    }
	    data = this.__data__ = new MapCache$2(pairs);
	  }
	  data.set(key, value);
	  this.size = data.size;
	  return this;
	}

	var _stackSet = stackSet$1;

	var ListCache = _ListCache,
	    stackClear = _stackClear,
	    stackDelete = _stackDelete,
	    stackGet = _stackGet,
	    stackHas = _stackHas,
	    stackSet = _stackSet;

	/**
	 * Creates a stack cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Stack$2(entries) {
	  var data = this.__data__ = new ListCache(entries);
	  this.size = data.size;
	}

	// Add methods to `Stack`.
	Stack$2.prototype.clear = stackClear;
	Stack$2.prototype['delete'] = stackDelete;
	Stack$2.prototype.get = stackGet;
	Stack$2.prototype.has = stackHas;
	Stack$2.prototype.set = stackSet;

	var _Stack = Stack$2;

	/** Used to stand-in for `undefined` hash values. */

	var HASH_UNDEFINED = '__lodash_hash_undefined__';

	/**
	 * Adds `value` to the array cache.
	 *
	 * @private
	 * @name add
	 * @memberOf SetCache
	 * @alias push
	 * @param {*} value The value to cache.
	 * @returns {Object} Returns the cache instance.
	 */
	function setCacheAdd$1(value) {
	  this.__data__.set(value, HASH_UNDEFINED);
	  return this;
	}

	var _setCacheAdd = setCacheAdd$1;

	/**
	 * Checks if `value` is in the array cache.
	 *
	 * @private
	 * @name has
	 * @memberOf SetCache
	 * @param {*} value The value to search for.
	 * @returns {number} Returns `true` if `value` is found, else `false`.
	 */

	function setCacheHas$1(value) {
	  return this.__data__.has(value);
	}

	var _setCacheHas = setCacheHas$1;

	var MapCache$1 = _MapCache,
	    setCacheAdd = _setCacheAdd,
	    setCacheHas = _setCacheHas;

	/**
	 *
	 * Creates an array cache object to store unique values.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [values] The values to cache.
	 */
	function SetCache$1(values) {
	  var index = -1,
	      length = values == null ? 0 : values.length;

	  this.__data__ = new MapCache$1;
	  while (++index < length) {
	    this.add(values[index]);
	  }
	}

	// Add methods to `SetCache`.
	SetCache$1.prototype.add = SetCache$1.prototype.push = setCacheAdd;
	SetCache$1.prototype.has = setCacheHas;

	var _SetCache = SetCache$1;

	/**
	 * A specialized version of `_.some` for arrays without support for iteratee
	 * shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {boolean} Returns `true` if any element passes the predicate check,
	 *  else `false`.
	 */

	function arraySome$1(array, predicate) {
	  var index = -1,
	      length = array == null ? 0 : array.length;

	  while (++index < length) {
	    if (predicate(array[index], index, array)) {
	      return true;
	    }
	  }
	  return false;
	}

	var _arraySome = arraySome$1;

	/**
	 * Checks if a `cache` value for `key` exists.
	 *
	 * @private
	 * @param {Object} cache The cache to query.
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */

	function cacheHas$1(cache, key) {
	  return cache.has(key);
	}

	var _cacheHas = cacheHas$1;

	var SetCache = _SetCache,
	    arraySome = _arraySome,
	    cacheHas = _cacheHas;

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG$5 = 1,
	    COMPARE_UNORDERED_FLAG$3 = 2;

	/**
	 * A specialized version of `baseIsEqualDeep` for arrays with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Array} array The array to compare.
	 * @param {Array} other The other array to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} stack Tracks traversed `array` and `other` objects.
	 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
	 */
	function equalArrays$2(array, other, bitmask, customizer, equalFunc, stack) {
	  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$5,
	      arrLength = array.length,
	      othLength = other.length;

	  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
	    return false;
	  }
	  // Check that cyclic values are equal.
	  var arrStacked = stack.get(array);
	  var othStacked = stack.get(other);
	  if (arrStacked && othStacked) {
	    return arrStacked == other && othStacked == array;
	  }
	  var index = -1,
	      result = true,
	      seen = (bitmask & COMPARE_UNORDERED_FLAG$3) ? new SetCache : undefined;

	  stack.set(array, other);
	  stack.set(other, array);

	  // Ignore non-index properties.
	  while (++index < arrLength) {
	    var arrValue = array[index],
	        othValue = other[index];

	    if (customizer) {
	      var compared = isPartial
	        ? customizer(othValue, arrValue, index, other, array, stack)
	        : customizer(arrValue, othValue, index, array, other, stack);
	    }
	    if (compared !== undefined) {
	      if (compared) {
	        continue;
	      }
	      result = false;
	      break;
	    }
	    // Recursively compare arrays (susceptible to call stack limits).
	    if (seen) {
	      if (!arraySome(other, function(othValue, othIndex) {
	            if (!cacheHas(seen, othIndex) &&
	                (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
	              return seen.push(othIndex);
	            }
	          })) {
	        result = false;
	        break;
	      }
	    } else if (!(
	          arrValue === othValue ||
	            equalFunc(arrValue, othValue, bitmask, customizer, stack)
	        )) {
	      result = false;
	      break;
	    }
	  }
	  stack['delete'](array);
	  stack['delete'](other);
	  return result;
	}

	var _equalArrays = equalArrays$2;

	var root$4 = _root;

	/** Built-in value references. */
	var Uint8Array$1 = root$4.Uint8Array;

	var _Uint8Array = Uint8Array$1;

	/**
	 * Converts `map` to its key-value pairs.
	 *
	 * @private
	 * @param {Object} map The map to convert.
	 * @returns {Array} Returns the key-value pairs.
	 */

	function mapToArray$1(map) {
	  var index = -1,
	      result = Array(map.size);

	  map.forEach(function(value, key) {
	    result[++index] = [key, value];
	  });
	  return result;
	}

	var _mapToArray = mapToArray$1;

	/**
	 * Converts `set` to an array of its values.
	 *
	 * @private
	 * @param {Object} set The set to convert.
	 * @returns {Array} Returns the values.
	 */

	function setToArray$1(set) {
	  var index = -1,
	      result = Array(set.size);

	  set.forEach(function(value) {
	    result[++index] = value;
	  });
	  return result;
	}

	var _setToArray = setToArray$1;

	var Symbol$1 = _Symbol,
	    Uint8Array = _Uint8Array,
	    eq$1 = eq_1,
	    equalArrays$1 = _equalArrays,
	    mapToArray = _mapToArray,
	    setToArray = _setToArray;

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG$4 = 1,
	    COMPARE_UNORDERED_FLAG$2 = 2;

	/** `Object#toString` result references. */
	var boolTag$1 = '[object Boolean]',
	    dateTag$1 = '[object Date]',
	    errorTag$1 = '[object Error]',
	    mapTag$2 = '[object Map]',
	    numberTag$1 = '[object Number]',
	    regexpTag$1 = '[object RegExp]',
	    setTag$2 = '[object Set]',
	    stringTag$1 = '[object String]',
	    symbolTag$1 = '[object Symbol]';

	var arrayBufferTag$1 = '[object ArrayBuffer]',
	    dataViewTag$2 = '[object DataView]';

	/** Used to convert symbols to primitives and strings. */
	var symbolProto$1 = Symbol$1 ? Symbol$1.prototype : undefined,
	    symbolValueOf = symbolProto$1 ? symbolProto$1.valueOf : undefined;

	/**
	 * A specialized version of `baseIsEqualDeep` for comparing objects of
	 * the same `toStringTag`.
	 *
	 * **Note:** This function only supports comparing values with tags of
	 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {string} tag The `toStringTag` of the objects to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} stack Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalByTag$1(object, other, tag, bitmask, customizer, equalFunc, stack) {
	  switch (tag) {
	    case dataViewTag$2:
	      if ((object.byteLength != other.byteLength) ||
	          (object.byteOffset != other.byteOffset)) {
	        return false;
	      }
	      object = object.buffer;
	      other = other.buffer;

	    case arrayBufferTag$1:
	      if ((object.byteLength != other.byteLength) ||
	          !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
	        return false;
	      }
	      return true;

	    case boolTag$1:
	    case dateTag$1:
	    case numberTag$1:
	      // Coerce booleans to `1` or `0` and dates to milliseconds.
	      // Invalid dates are coerced to `NaN`.
	      return eq$1(+object, +other);

	    case errorTag$1:
	      return object.name == other.name && object.message == other.message;

	    case regexpTag$1:
	    case stringTag$1:
	      // Coerce regexes to strings and treat strings, primitives and objects,
	      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
	      // for more details.
	      return object == (other + '');

	    case mapTag$2:
	      var convert = mapToArray;

	    case setTag$2:
	      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$4;
	      convert || (convert = setToArray);

	      if (object.size != other.size && !isPartial) {
	        return false;
	      }
	      // Assume cyclic values are equal.
	      var stacked = stack.get(object);
	      if (stacked) {
	        return stacked == other;
	      }
	      bitmask |= COMPARE_UNORDERED_FLAG$2;

	      // Recursively compare objects (susceptible to call stack limits).
	      stack.set(object, other);
	      var result = equalArrays$1(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
	      stack['delete'](object);
	      return result;

	    case symbolTag$1:
	      if (symbolValueOf) {
	        return symbolValueOf.call(object) == symbolValueOf.call(other);
	      }
	  }
	  return false;
	}

	var _equalByTag = equalByTag$1;

	/**
	 * Appends the elements of `values` to `array`.
	 *
	 * @private
	 * @param {Array} array The array to modify.
	 * @param {Array} values The values to append.
	 * @returns {Array} Returns `array`.
	 */

	function arrayPush$2(array, values) {
	  var index = -1,
	      length = values.length,
	      offset = array.length;

	  while (++index < length) {
	    array[offset + index] = values[index];
	  }
	  return array;
	}

	var _arrayPush = arrayPush$2;

	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(document.body.children);
	 * // => false
	 *
	 * _.isArray('abc');
	 * // => false
	 *
	 * _.isArray(_.noop);
	 * // => false
	 */

	var isArray$8 = Array.isArray;

	var isArray_1 = isArray$8;

	var arrayPush$1 = _arrayPush,
	    isArray$7 = isArray_1;

	/**
	 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
	 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
	 * symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @param {Function} symbolsFunc The function to get the symbols of `object`.
	 * @returns {Array} Returns the array of property names and symbols.
	 */
	function baseGetAllKeys$2(object, keysFunc, symbolsFunc) {
	  var result = keysFunc(object);
	  return isArray$7(object) ? result : arrayPush$1(result, symbolsFunc(object));
	}

	var _baseGetAllKeys = baseGetAllKeys$2;

	/**
	 * A specialized version of `_.filter` for arrays without support for
	 * iteratee shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {Array} Returns the new filtered array.
	 */

	function arrayFilter$1(array, predicate) {
	  var index = -1,
	      length = array == null ? 0 : array.length,
	      resIndex = 0,
	      result = [];

	  while (++index < length) {
	    var value = array[index];
	    if (predicate(value, index, array)) {
	      result[resIndex++] = value;
	    }
	  }
	  return result;
	}

	var _arrayFilter = arrayFilter$1;

	/**
	 * This method returns a new empty array.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.13.0
	 * @category Util
	 * @returns {Array} Returns the new empty array.
	 * @example
	 *
	 * var arrays = _.times(2, _.stubArray);
	 *
	 * console.log(arrays);
	 * // => [[], []]
	 *
	 * console.log(arrays[0] === arrays[1]);
	 * // => false
	 */

	function stubArray$2() {
	  return [];
	}

	var stubArray_1 = stubArray$2;

	var arrayFilter = _arrayFilter,
	    stubArray$1 = stubArray_1;

	/** Used for built-in method references. */
	var objectProto$8 = Object.prototype;

	/** Built-in value references. */
	var propertyIsEnumerable$1 = objectProto$8.propertyIsEnumerable;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeGetSymbols$1 = Object.getOwnPropertySymbols;

	/**
	 * Creates an array of the own enumerable symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of symbols.
	 */
	var getSymbols$2 = !nativeGetSymbols$1 ? stubArray$1 : function(object) {
	  if (object == null) {
	    return [];
	  }
	  object = Object(object);
	  return arrayFilter(nativeGetSymbols$1(object), function(symbol) {
	    return propertyIsEnumerable$1.call(object, symbol);
	  });
	};

	var _getSymbols = getSymbols$2;

	/**
	 * The base implementation of `_.times` without support for iteratee shorthands
	 * or max array length checks.
	 *
	 * @private
	 * @param {number} n The number of times to invoke `iteratee`.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the array of results.
	 */

	function baseTimes$1(n, iteratee) {
	  var index = -1,
	      result = Array(n);

	  while (++index < n) {
	    result[index] = iteratee(index);
	  }
	  return result;
	}

	var _baseTimes = baseTimes$1;

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */

	function isObjectLike$5(value) {
	  return value != null && typeof value == 'object';
	}

	var isObjectLike_1 = isObjectLike$5;

	var baseGetTag$3 = _baseGetTag,
	    isObjectLike$4 = isObjectLike_1;

	/** `Object#toString` result references. */
	var argsTag$2 = '[object Arguments]';

	/**
	 * The base implementation of `_.isArguments`.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
	 */
	function baseIsArguments$1(value) {
	  return isObjectLike$4(value) && baseGetTag$3(value) == argsTag$2;
	}

	var _baseIsArguments = baseIsArguments$1;

	var baseIsArguments = _baseIsArguments,
	    isObjectLike$3 = isObjectLike_1;

	/** Used for built-in method references. */
	var objectProto$7 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$6 = objectProto$7.hasOwnProperty;

	/** Built-in value references. */
	var propertyIsEnumerable = objectProto$7.propertyIsEnumerable;

	/**
	 * Checks if `value` is likely an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
	 *  else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */
	var isArguments$2 = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
	  return isObjectLike$3(value) && hasOwnProperty$6.call(value, 'callee') &&
	    !propertyIsEnumerable.call(value, 'callee');
	};

	var isArguments_1 = isArguments$2;

	var isBuffer$2 = {exports: {}};

	/**
	 * This method returns `false`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.13.0
	 * @category Util
	 * @returns {boolean} Returns `false`.
	 * @example
	 *
	 * _.times(2, _.stubFalse);
	 * // => [false, false]
	 */

	function stubFalse() {
	  return false;
	}

	var stubFalse_1 = stubFalse;

	isBuffer$2.exports;

	(function (module, exports$1) {
		var root = _root,
		    stubFalse = stubFalse_1;

		/** Detect free variable `exports`. */
		var freeExports = exports$1 && !exports$1.nodeType && exports$1;

		/** Detect free variable `module`. */
		var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

		/** Detect the popular CommonJS extension `module.exports`. */
		var moduleExports = freeModule && freeModule.exports === freeExports;

		/** Built-in value references. */
		var Buffer = moduleExports ? root.Buffer : undefined;

		/* Built-in method references for those with the same name as other `lodash` methods. */
		var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

		/**
		 * Checks if `value` is a buffer.
		 *
		 * @static
		 * @memberOf _
		 * @since 4.3.0
		 * @category Lang
		 * @param {*} value The value to check.
		 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
		 * @example
		 *
		 * _.isBuffer(new Buffer(2));
		 * // => true
		 *
		 * _.isBuffer(new Uint8Array(2));
		 * // => false
		 */
		var isBuffer = nativeIsBuffer || stubFalse;

		module.exports = isBuffer; 
	} (isBuffer$2, isBuffer$2.exports));

	var isBufferExports = isBuffer$2.exports;

	/** Used as references for various `Number` constants. */

	var MAX_SAFE_INTEGER$1 = 9007199254740991;

	/** Used to detect unsigned integer values. */
	var reIsUint = /^(?:0|[1-9]\d*)$/;

	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */
	function isIndex$3(value, length) {
	  var type = typeof value;
	  length = length == null ? MAX_SAFE_INTEGER$1 : length;

	  return !!length &&
	    (type == 'number' ||
	      (type != 'symbol' && reIsUint.test(value))) &&
	        (value > -1 && value % 1 == 0 && value < length);
	}

	var _isIndex = isIndex$3;

	/** Used as references for various `Number` constants. */

	var MAX_SAFE_INTEGER = 9007199254740991;

	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This method is loosely based on
	 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 * @example
	 *
	 * _.isLength(3);
	 * // => true
	 *
	 * _.isLength(Number.MIN_VALUE);
	 * // => false
	 *
	 * _.isLength(Infinity);
	 * // => false
	 *
	 * _.isLength('3');
	 * // => false
	 */
	function isLength$3(value) {
	  return typeof value == 'number' &&
	    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}

	var isLength_1 = isLength$3;

	var baseGetTag$2 = _baseGetTag,
	    isLength$2 = isLength_1,
	    isObjectLike$2 = isObjectLike_1;

	/** `Object#toString` result references. */
	var argsTag$1 = '[object Arguments]',
	    arrayTag$1 = '[object Array]',
	    boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    funcTag = '[object Function]',
	    mapTag$1 = '[object Map]',
	    numberTag = '[object Number]',
	    objectTag$2 = '[object Object]',
	    regexpTag = '[object RegExp]',
	    setTag$1 = '[object Set]',
	    stringTag = '[object String]',
	    weakMapTag$1 = '[object WeakMap]';

	var arrayBufferTag = '[object ArrayBuffer]',
	    dataViewTag$1 = '[object DataView]',
	    float32Tag = '[object Float32Array]',
	    float64Tag = '[object Float64Array]',
	    int8Tag = '[object Int8Array]',
	    int16Tag = '[object Int16Array]',
	    int32Tag = '[object Int32Array]',
	    uint8Tag = '[object Uint8Array]',
	    uint8ClampedTag = '[object Uint8ClampedArray]',
	    uint16Tag = '[object Uint16Array]',
	    uint32Tag = '[object Uint32Array]';

	/** Used to identify `toStringTag` values of typed arrays. */
	var typedArrayTags = {};
	typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
	typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
	typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
	typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
	typedArrayTags[uint32Tag] = true;
	typedArrayTags[argsTag$1] = typedArrayTags[arrayTag$1] =
	typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
	typedArrayTags[dataViewTag$1] = typedArrayTags[dateTag] =
	typedArrayTags[errorTag] = typedArrayTags[funcTag] =
	typedArrayTags[mapTag$1] = typedArrayTags[numberTag] =
	typedArrayTags[objectTag$2] = typedArrayTags[regexpTag] =
	typedArrayTags[setTag$1] = typedArrayTags[stringTag] =
	typedArrayTags[weakMapTag$1] = false;

	/**
	 * The base implementation of `_.isTypedArray` without Node.js optimizations.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	 */
	function baseIsTypedArray$1(value) {
	  return isObjectLike$2(value) &&
	    isLength$2(value.length) && !!typedArrayTags[baseGetTag$2(value)];
	}

	var _baseIsTypedArray = baseIsTypedArray$1;

	/**
	 * The base implementation of `_.unary` without support for storing metadata.
	 *
	 * @private
	 * @param {Function} func The function to cap arguments for.
	 * @returns {Function} Returns the new capped function.
	 */

	function baseUnary$1(func) {
	  return function(value) {
	    return func(value);
	  };
	}

	var _baseUnary = baseUnary$1;

	var _nodeUtil = {exports: {}};

	_nodeUtil.exports;

	(function (module, exports$1) {
		var freeGlobal = _freeGlobal;

		/** Detect free variable `exports`. */
		var freeExports = exports$1 && !exports$1.nodeType && exports$1;

		/** Detect free variable `module`. */
		var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

		/** Detect the popular CommonJS extension `module.exports`. */
		var moduleExports = freeModule && freeModule.exports === freeExports;

		/** Detect free variable `process` from Node.js. */
		var freeProcess = moduleExports && freeGlobal.process;

		/** Used to access faster Node.js helpers. */
		var nodeUtil = (function() {
		  try {
		    // Use `util.types` for Node.js 10+.
		    var types = freeModule && freeModule.require && freeModule.require('util').types;

		    if (types) {
		      return types;
		    }

		    // Legacy `process.binding('util')` for Node.js < 10.
		    return freeProcess && freeProcess.binding && freeProcess.binding('util');
		  } catch (e) {}
		}());

		module.exports = nodeUtil; 
	} (_nodeUtil, _nodeUtil.exports));

	var _nodeUtilExports = _nodeUtil.exports;

	var baseIsTypedArray = _baseIsTypedArray,
	    baseUnary = _baseUnary,
	    nodeUtil = _nodeUtilExports;

	/* Node.js helper references. */
	var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

	/**
	 * Checks if `value` is classified as a typed array.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	 * @example
	 *
	 * _.isTypedArray(new Uint8Array);
	 * // => true
	 *
	 * _.isTypedArray([]);
	 * // => false
	 */
	var isTypedArray$2 = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

	var isTypedArray_1 = isTypedArray$2;

	var baseTimes = _baseTimes,
	    isArguments$1 = isArguments_1,
	    isArray$6 = isArray_1,
	    isBuffer$1 = isBufferExports,
	    isIndex$2 = _isIndex,
	    isTypedArray$1 = isTypedArray_1;

	/** Used for built-in method references. */
	var objectProto$6 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$5 = objectProto$6.hasOwnProperty;

	/**
	 * Creates an array of the enumerable property names of the array-like `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @param {boolean} inherited Specify returning inherited property names.
	 * @returns {Array} Returns the array of property names.
	 */
	function arrayLikeKeys$2(value, inherited) {
	  var isArr = isArray$6(value),
	      isArg = !isArr && isArguments$1(value),
	      isBuff = !isArr && !isArg && isBuffer$1(value),
	      isType = !isArr && !isArg && !isBuff && isTypedArray$1(value),
	      skipIndexes = isArr || isArg || isBuff || isType,
	      result = skipIndexes ? baseTimes(value.length, String) : [],
	      length = result.length;

	  for (var key in value) {
	    if ((inherited || hasOwnProperty$5.call(value, key)) &&
	        !(skipIndexes && (
	           // Safari 9 has enumerable `arguments.length` in strict mode.
	           key == 'length' ||
	           // Node.js 0.10 has enumerable non-index properties on buffers.
	           (isBuff && (key == 'offset' || key == 'parent')) ||
	           // PhantomJS 2 has enumerable non-index properties on typed arrays.
	           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
	           // Skip index properties.
	           isIndex$2(key, length)
	        ))) {
	      result.push(key);
	    }
	  }
	  return result;
	}

	var _arrayLikeKeys = arrayLikeKeys$2;

	/** Used for built-in method references. */

	var objectProto$5 = Object.prototype;

	/**
	 * Checks if `value` is likely a prototype object.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
	 */
	function isPrototype$2(value) {
	  var Ctor = value && value.constructor,
	      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$5;

	  return value === proto;
	}

	var _isPrototype = isPrototype$2;

	/**
	 * Creates a unary function that invokes `func` with its argument transformed.
	 *
	 * @private
	 * @param {Function} func The function to wrap.
	 * @param {Function} transform The argument transform.
	 * @returns {Function} Returns the new function.
	 */

	function overArg$2(func, transform) {
	  return function(arg) {
	    return func(transform(arg));
	  };
	}

	var _overArg = overArg$2;

	var overArg$1 = _overArg;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeKeys$1 = overArg$1(Object.keys, Object);

	var _nativeKeys = nativeKeys$1;

	var isPrototype$1 = _isPrototype,
	    nativeKeys = _nativeKeys;

	/** Used for built-in method references. */
	var objectProto$4 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$4 = objectProto$4.hasOwnProperty;

	/**
	 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function baseKeys$1(object) {
	  if (!isPrototype$1(object)) {
	    return nativeKeys(object);
	  }
	  var result = [];
	  for (var key in Object(object)) {
	    if (hasOwnProperty$4.call(object, key) && key != 'constructor') {
	      result.push(key);
	    }
	  }
	  return result;
	}

	var _baseKeys = baseKeys$1;

	var isFunction = isFunction_1,
	    isLength$1 = isLength_1;

	/**
	 * Checks if `value` is array-like. A value is considered array-like if it's
	 * not a function and has a `value.length` that's an integer greater than or
	 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 * @example
	 *
	 * _.isArrayLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLike(document.body.children);
	 * // => true
	 *
	 * _.isArrayLike('abc');
	 * // => true
	 *
	 * _.isArrayLike(_.noop);
	 * // => false
	 */
	function isArrayLike$2(value) {
	  return value != null && isLength$1(value.length) && !isFunction(value);
	}

	var isArrayLike_1 = isArrayLike$2;

	var arrayLikeKeys$1 = _arrayLikeKeys,
	    baseKeys = _baseKeys,
	    isArrayLike$1 = isArrayLike_1;

	/**
	 * Creates an array of the own enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects. See the
	 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
	 * for more details.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keys(new Foo);
	 * // => ['a', 'b'] (iteration order is not guaranteed)
	 *
	 * _.keys('hi');
	 * // => ['0', '1']
	 */
	function keys$2(object) {
	  return isArrayLike$1(object) ? arrayLikeKeys$1(object) : baseKeys(object);
	}

	var keys_1 = keys$2;

	var baseGetAllKeys$1 = _baseGetAllKeys,
	    getSymbols$1 = _getSymbols,
	    keys$1 = keys_1;

	/**
	 * Creates an array of own enumerable property names and symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names and symbols.
	 */
	function getAllKeys$1(object) {
	  return baseGetAllKeys$1(object, keys$1, getSymbols$1);
	}

	var _getAllKeys = getAllKeys$1;

	var getAllKeys = _getAllKeys;

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG$3 = 1;

	/** Used for built-in method references. */
	var objectProto$3 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$3 = objectProto$3.hasOwnProperty;

	/**
	 * A specialized version of `baseIsEqualDeep` for objects with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} stack Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalObjects$1(object, other, bitmask, customizer, equalFunc, stack) {
	  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$3,
	      objProps = getAllKeys(object),
	      objLength = objProps.length,
	      othProps = getAllKeys(other),
	      othLength = othProps.length;

	  if (objLength != othLength && !isPartial) {
	    return false;
	  }
	  var index = objLength;
	  while (index--) {
	    var key = objProps[index];
	    if (!(isPartial ? key in other : hasOwnProperty$3.call(other, key))) {
	      return false;
	    }
	  }
	  // Check that cyclic values are equal.
	  var objStacked = stack.get(object);
	  var othStacked = stack.get(other);
	  if (objStacked && othStacked) {
	    return objStacked == other && othStacked == object;
	  }
	  var result = true;
	  stack.set(object, other);
	  stack.set(other, object);

	  var skipCtor = isPartial;
	  while (++index < objLength) {
	    key = objProps[index];
	    var objValue = object[key],
	        othValue = other[key];

	    if (customizer) {
	      var compared = isPartial
	        ? customizer(othValue, objValue, key, other, object, stack)
	        : customizer(objValue, othValue, key, object, other, stack);
	    }
	    // Recursively compare objects (susceptible to call stack limits).
	    if (!(compared === undefined
	          ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
	          : compared
	        )) {
	      result = false;
	      break;
	    }
	    skipCtor || (skipCtor = key == 'constructor');
	  }
	  if (result && !skipCtor) {
	    var objCtor = object.constructor,
	        othCtor = other.constructor;

	    // Non `Object` object instances with different constructors are not equal.
	    if (objCtor != othCtor &&
	        ('constructor' in object && 'constructor' in other) &&
	        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
	          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
	      result = false;
	    }
	  }
	  stack['delete'](object);
	  stack['delete'](other);
	  return result;
	}

	var _equalObjects = equalObjects$1;

	var getNative$4 = _getNative,
	    root$3 = _root;

	/* Built-in method references that are verified to be native. */
	var DataView$1 = getNative$4(root$3, 'DataView');

	var _DataView = DataView$1;

	var getNative$3 = _getNative,
	    root$2 = _root;

	/* Built-in method references that are verified to be native. */
	var Promise$2 = getNative$3(root$2, 'Promise');

	var _Promise = Promise$2;

	var getNative$2 = _getNative,
	    root$1 = _root;

	/* Built-in method references that are verified to be native. */
	var Set$1 = getNative$2(root$1, 'Set');

	var _Set = Set$1;

	var getNative$1 = _getNative,
	    root = _root;

	/* Built-in method references that are verified to be native. */
	var WeakMap$1 = getNative$1(root, 'WeakMap');

	var _WeakMap = WeakMap$1;

	var DataView = _DataView,
	    Map = _Map,
	    Promise$1 = _Promise,
	    Set = _Set,
	    WeakMap = _WeakMap,
	    baseGetTag$1 = _baseGetTag,
	    toSource = _toSource;

	/** `Object#toString` result references. */
	var mapTag = '[object Map]',
	    objectTag$1 = '[object Object]',
	    promiseTag = '[object Promise]',
	    setTag = '[object Set]',
	    weakMapTag = '[object WeakMap]';

	var dataViewTag = '[object DataView]';

	/** Used to detect maps, sets, and weakmaps. */
	var dataViewCtorString = toSource(DataView),
	    mapCtorString = toSource(Map),
	    promiseCtorString = toSource(Promise$1),
	    setCtorString = toSource(Set),
	    weakMapCtorString = toSource(WeakMap);

	/**
	 * Gets the `toStringTag` of `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	var getTag$1 = baseGetTag$1;

	// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
	if ((DataView && getTag$1(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
	    (Map && getTag$1(new Map) != mapTag) ||
	    (Promise$1 && getTag$1(Promise$1.resolve()) != promiseTag) ||
	    (Set && getTag$1(new Set) != setTag) ||
	    (WeakMap && getTag$1(new WeakMap) != weakMapTag)) {
	  getTag$1 = function(value) {
	    var result = baseGetTag$1(value),
	        Ctor = result == objectTag$1 ? value.constructor : undefined,
	        ctorString = Ctor ? toSource(Ctor) : '';

	    if (ctorString) {
	      switch (ctorString) {
	        case dataViewCtorString: return dataViewTag;
	        case mapCtorString: return mapTag;
	        case promiseCtorString: return promiseTag;
	        case setCtorString: return setTag;
	        case weakMapCtorString: return weakMapTag;
	      }
	    }
	    return result;
	  };
	}

	var _getTag = getTag$1;

	var Stack$1 = _Stack,
	    equalArrays = _equalArrays,
	    equalByTag = _equalByTag,
	    equalObjects = _equalObjects,
	    getTag = _getTag,
	    isArray$5 = isArray_1,
	    isBuffer = isBufferExports,
	    isTypedArray = isTypedArray_1;

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG$2 = 1;

	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    objectTag = '[object Object]';

	/** Used for built-in method references. */
	var objectProto$2 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$2 = objectProto$2.hasOwnProperty;

	/**
	 * A specialized version of `baseIsEqual` for arrays and objects which performs
	 * deep comparisons and tracks traversed objects enabling objects with circular
	 * references to be compared.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function baseIsEqualDeep$1(object, other, bitmask, customizer, equalFunc, stack) {
	  var objIsArr = isArray$5(object),
	      othIsArr = isArray$5(other),
	      objTag = objIsArr ? arrayTag : getTag(object),
	      othTag = othIsArr ? arrayTag : getTag(other);

	  objTag = objTag == argsTag ? objectTag : objTag;
	  othTag = othTag == argsTag ? objectTag : othTag;

	  var objIsObj = objTag == objectTag,
	      othIsObj = othTag == objectTag,
	      isSameTag = objTag == othTag;

	  if (isSameTag && isBuffer(object)) {
	    if (!isBuffer(other)) {
	      return false;
	    }
	    objIsArr = true;
	    objIsObj = false;
	  }
	  if (isSameTag && !objIsObj) {
	    stack || (stack = new Stack$1);
	    return (objIsArr || isTypedArray(object))
	      ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
	      : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
	  }
	  if (!(bitmask & COMPARE_PARTIAL_FLAG$2)) {
	    var objIsWrapped = objIsObj && hasOwnProperty$2.call(object, '__wrapped__'),
	        othIsWrapped = othIsObj && hasOwnProperty$2.call(other, '__wrapped__');

	    if (objIsWrapped || othIsWrapped) {
	      var objUnwrapped = objIsWrapped ? object.value() : object,
	          othUnwrapped = othIsWrapped ? other.value() : other;

	      stack || (stack = new Stack$1);
	      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
	    }
	  }
	  if (!isSameTag) {
	    return false;
	  }
	  stack || (stack = new Stack$1);
	  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
	}

	var _baseIsEqualDeep = baseIsEqualDeep$1;

	var baseIsEqualDeep = _baseIsEqualDeep,
	    isObjectLike$1 = isObjectLike_1;

	/**
	 * The base implementation of `_.isEqual` which supports partial comparisons
	 * and tracks traversed objects.
	 *
	 * @private
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @param {boolean} bitmask The bitmask flags.
	 *  1 - Unordered comparison
	 *  2 - Partial comparison
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 */
	function baseIsEqual$2(value, other, bitmask, customizer, stack) {
	  if (value === other) {
	    return true;
	  }
	  if (value == null || other == null || (!isObjectLike$1(value) && !isObjectLike$1(other))) {
	    return value !== value && other !== other;
	  }
	  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual$2, stack);
	}

	var _baseIsEqual = baseIsEqual$2;

	var Stack = _Stack,
	    baseIsEqual$1 = _baseIsEqual;

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG$1 = 1,
	    COMPARE_UNORDERED_FLAG$1 = 2;

	/**
	 * The base implementation of `_.isMatch` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Object} object The object to inspect.
	 * @param {Object} source The object of property values to match.
	 * @param {Array} matchData The property names, values, and compare flags to match.
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
	 */
	function baseIsMatch$1(object, source, matchData, customizer) {
	  var index = matchData.length,
	      length = index,
	      noCustomizer = !customizer;

	  if (object == null) {
	    return !length;
	  }
	  object = Object(object);
	  while (index--) {
	    var data = matchData[index];
	    if ((noCustomizer && data[2])
	          ? data[1] !== object[data[0]]
	          : !(data[0] in object)
	        ) {
	      return false;
	    }
	  }
	  while (++index < length) {
	    data = matchData[index];
	    var key = data[0],
	        objValue = object[key],
	        srcValue = data[1];

	    if (noCustomizer && data[2]) {
	      if (objValue === undefined && !(key in object)) {
	        return false;
	      }
	    } else {
	      var stack = new Stack;
	      if (customizer) {
	        var result = customizer(objValue, srcValue, key, object, source, stack);
	      }
	      if (!(result === undefined
	            ? baseIsEqual$1(srcValue, objValue, COMPARE_PARTIAL_FLAG$1 | COMPARE_UNORDERED_FLAG$1, customizer, stack)
	            : result
	          )) {
	        return false;
	      }
	    }
	  }
	  return true;
	}

	var _baseIsMatch = baseIsMatch$1;

	var isObject$2 = isObject_1;

	/**
	 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` if suitable for strict
	 *  equality comparisons, else `false`.
	 */
	function isStrictComparable$2(value) {
	  return value === value && !isObject$2(value);
	}

	var _isStrictComparable = isStrictComparable$2;

	var isStrictComparable$1 = _isStrictComparable,
	    keys = keys_1;

	/**
	 * Gets the property names, values, and compare flags of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the match data of `object`.
	 */
	function getMatchData$1(object) {
	  var result = keys(object),
	      length = result.length;

	  while (length--) {
	    var key = result[length],
	        value = object[key];

	    result[length] = [key, value, isStrictComparable$1(value)];
	  }
	  return result;
	}

	var _getMatchData = getMatchData$1;

	/**
	 * A specialized version of `matchesProperty` for source values suitable
	 * for strict equality comparisons, i.e. `===`.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @param {*} srcValue The value to match.
	 * @returns {Function} Returns the new spec function.
	 */

	function matchesStrictComparable$2(key, srcValue) {
	  return function(object) {
	    if (object == null) {
	      return false;
	    }
	    return object[key] === srcValue &&
	      (srcValue !== undefined || (key in Object(object)));
	  };
	}

	var _matchesStrictComparable = matchesStrictComparable$2;

	var baseIsMatch = _baseIsMatch,
	    getMatchData = _getMatchData,
	    matchesStrictComparable$1 = _matchesStrictComparable;

	/**
	 * The base implementation of `_.matches` which doesn't clone `source`.
	 *
	 * @private
	 * @param {Object} source The object of property values to match.
	 * @returns {Function} Returns the new spec function.
	 */
	function baseMatches$1(source) {
	  var matchData = getMatchData(source);
	  if (matchData.length == 1 && matchData[0][2]) {
	    return matchesStrictComparable$1(matchData[0][0], matchData[0][1]);
	  }
	  return function(object) {
	    return object === source || baseIsMatch(object, source, matchData);
	  };
	}

	var _baseMatches = baseMatches$1;

	var baseGetTag = _baseGetTag,
	    isObjectLike = isObjectLike_1;

	/** `Object#toString` result references. */
	var symbolTag = '[object Symbol]';

	/**
	 * Checks if `value` is classified as a `Symbol` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
	 * @example
	 *
	 * _.isSymbol(Symbol.iterator);
	 * // => true
	 *
	 * _.isSymbol('abc');
	 * // => false
	 */
	function isSymbol$3(value) {
	  return typeof value == 'symbol' ||
	    (isObjectLike(value) && baseGetTag(value) == symbolTag);
	}

	var isSymbol_1 = isSymbol$3;

	var isArray$4 = isArray_1,
	    isSymbol$2 = isSymbol_1;

	/** Used to match property names within property paths. */
	var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
	    reIsPlainProp = /^\w*$/;

	/**
	 * Checks if `value` is a property name and not a property path.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {Object} [object] The object to query keys on.
	 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
	 */
	function isKey$3(value, object) {
	  if (isArray$4(value)) {
	    return false;
	  }
	  var type = typeof value;
	  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
	      value == null || isSymbol$2(value)) {
	    return true;
	  }
	  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
	    (object != null && value in Object(object));
	}

	var _isKey = isKey$3;

	var MapCache = _MapCache;

	/** Error message constants. */
	var FUNC_ERROR_TEXT = 'Expected a function';

	/**
	 * Creates a function that memoizes the result of `func`. If `resolver` is
	 * provided, it determines the cache key for storing the result based on the
	 * arguments provided to the memoized function. By default, the first argument
	 * provided to the memoized function is used as the map cache key. The `func`
	 * is invoked with the `this` binding of the memoized function.
	 *
	 * **Note:** The cache is exposed as the `cache` property on the memoized
	 * function. Its creation may be customized by replacing the `_.memoize.Cache`
	 * constructor with one whose instances implement the
	 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
	 * method interface of `clear`, `delete`, `get`, `has`, and `set`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Function
	 * @param {Function} func The function to have its output memoized.
	 * @param {Function} [resolver] The function to resolve the cache key.
	 * @returns {Function} Returns the new memoized function.
	 * @example
	 *
	 * var object = { 'a': 1, 'b': 2 };
	 * var other = { 'c': 3, 'd': 4 };
	 *
	 * var values = _.memoize(_.values);
	 * values(object);
	 * // => [1, 2]
	 *
	 * values(other);
	 * // => [3, 4]
	 *
	 * object.a = 2;
	 * values(object);
	 * // => [1, 2]
	 *
	 * // Modify the result cache.
	 * values.cache.set(object, ['a', 'b']);
	 * values(object);
	 * // => ['a', 'b']
	 *
	 * // Replace `_.memoize.Cache`.
	 * _.memoize.Cache = WeakMap;
	 */
	function memoize$1(func, resolver) {
	  if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  var memoized = function() {
	    var args = arguments,
	        key = resolver ? resolver.apply(this, args) : args[0],
	        cache = memoized.cache;

	    if (cache.has(key)) {
	      return cache.get(key);
	    }
	    var result = func.apply(this, args);
	    memoized.cache = cache.set(key, result) || cache;
	    return result;
	  };
	  memoized.cache = new (memoize$1.Cache || MapCache);
	  return memoized;
	}

	// Expose `MapCache`.
	memoize$1.Cache = MapCache;

	var memoize_1 = memoize$1;

	var memoize = memoize_1;

	/** Used as the maximum memoize cache size. */
	var MAX_MEMOIZE_SIZE = 500;

	/**
	 * A specialized version of `_.memoize` which clears the memoized function's
	 * cache when it exceeds `MAX_MEMOIZE_SIZE`.
	 *
	 * @private
	 * @param {Function} func The function to have its output memoized.
	 * @returns {Function} Returns the new memoized function.
	 */
	function memoizeCapped$1(func) {
	  var result = memoize(func, function(key) {
	    if (cache.size === MAX_MEMOIZE_SIZE) {
	      cache.clear();
	    }
	    return key;
	  });

	  var cache = result.cache;
	  return result;
	}

	var _memoizeCapped = memoizeCapped$1;

	var memoizeCapped = _memoizeCapped;

	/** Used to match property names within property paths. */
	var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

	/** Used to match backslashes in property paths. */
	var reEscapeChar = /\\(\\)?/g;

	/**
	 * Converts `string` to a property path array.
	 *
	 * @private
	 * @param {string} string The string to convert.
	 * @returns {Array} Returns the property path array.
	 */
	var stringToPath$1 = memoizeCapped(function(string) {
	  var result = [];
	  if (string.charCodeAt(0) === 46 /* . */) {
	    result.push('');
	  }
	  string.replace(rePropName, function(match, number, quote, subString) {
	    result.push(quote ? subString.replace(reEscapeChar, '$1') : (number || match));
	  });
	  return result;
	});

	var _stringToPath = stringToPath$1;

	var Symbol = _Symbol,
	    arrayMap$1 = _arrayMap,
	    isArray$3 = isArray_1,
	    isSymbol$1 = isSymbol_1;

	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol ? Symbol.prototype : undefined,
	    symbolToString = symbolProto ? symbolProto.toString : undefined;

	/**
	 * The base implementation of `_.toString` which doesn't convert nullish
	 * values to empty strings.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {string} Returns the string.
	 */
	function baseToString$1(value) {
	  // Exit early for strings to avoid a performance hit in some environments.
	  if (typeof value == 'string') {
	    return value;
	  }
	  if (isArray$3(value)) {
	    // Recursively convert values (susceptible to call stack limits).
	    return arrayMap$1(value, baseToString$1) + '';
	  }
	  if (isSymbol$1(value)) {
	    return symbolToString ? symbolToString.call(value) : '';
	  }
	  var result = (value + '');
	  return (result == '0' && (1 / value) == -Infinity) ? '-0' : result;
	}

	var _baseToString = baseToString$1;

	var baseToString = _baseToString;

	/**
	 * Converts `value` to a string. An empty string is returned for `null`
	 * and `undefined` values. The sign of `-0` is preserved.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {string} Returns the converted string.
	 * @example
	 *
	 * _.toString(null);
	 * // => ''
	 *
	 * _.toString(-0);
	 * // => '-0'
	 *
	 * _.toString([1, 2, 3]);
	 * // => '1,2,3'
	 */
	function toString$1(value) {
	  return value == null ? '' : baseToString(value);
	}

	var toString_1 = toString$1;

	var isArray$2 = isArray_1,
	    isKey$2 = _isKey,
	    stringToPath = _stringToPath,
	    toString = toString_1;

	/**
	 * Casts `value` to a path array if it's not one.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @param {Object} [object] The object to query keys on.
	 * @returns {Array} Returns the cast property path array.
	 */
	function castPath$4(value, object) {
	  if (isArray$2(value)) {
	    return value;
	  }
	  return isKey$2(value, object) ? [value] : stringToPath(toString(value));
	}

	var _castPath = castPath$4;

	var isSymbol = isSymbol_1;

	/**
	 * Converts `value` to a string key if it's not a string or symbol.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @returns {string|symbol} Returns the key.
	 */
	function toKey$5(value) {
	  if (typeof value == 'string' || isSymbol(value)) {
	    return value;
	  }
	  var result = (value + '');
	  return (result == '0' && (1 / value) == -Infinity) ? '-0' : result;
	}

	var _toKey = toKey$5;

	var castPath$3 = _castPath,
	    toKey$4 = _toKey;

	/**
	 * The base implementation of `_.get` without support for default values.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path of the property to get.
	 * @returns {*} Returns the resolved value.
	 */
	function baseGet$3(object, path) {
	  path = castPath$3(path, object);

	  var index = 0,
	      length = path.length;

	  while (object != null && index < length) {
	    object = object[toKey$4(path[index++])];
	  }
	  return (index && index == length) ? object : undefined;
	}

	var _baseGet = baseGet$3;

	var baseGet$2 = _baseGet;

	/**
	 * Gets the value at `path` of `object`. If the resolved value is
	 * `undefined`, the `defaultValue` is returned in its place.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.7.0
	 * @category Object
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path of the property to get.
	 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
	 * @returns {*} Returns the resolved value.
	 * @example
	 *
	 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
	 *
	 * _.get(object, 'a[0].b.c');
	 * // => 3
	 *
	 * _.get(object, ['a', '0', 'b', 'c']);
	 * // => 3
	 *
	 * _.get(object, 'a.b.c', 'default');
	 * // => 'default'
	 */
	function get$1(object, path, defaultValue) {
	  var result = object == null ? undefined : baseGet$2(object, path);
	  return result === undefined ? defaultValue : result;
	}

	var get_1 = get$1;

	/**
	 * The base implementation of `_.hasIn` without support for deep paths.
	 *
	 * @private
	 * @param {Object} [object] The object to query.
	 * @param {Array|string} key The key to check.
	 * @returns {boolean} Returns `true` if `key` exists, else `false`.
	 */

	function baseHasIn$1(object, key) {
	  return object != null && key in Object(object);
	}

	var _baseHasIn = baseHasIn$1;

	var castPath$2 = _castPath,
	    isArguments = isArguments_1,
	    isArray$1 = isArray_1,
	    isIndex$1 = _isIndex,
	    isLength = isLength_1,
	    toKey$3 = _toKey;

	/**
	 * Checks if `path` exists on `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path to check.
	 * @param {Function} hasFunc The function to check properties.
	 * @returns {boolean} Returns `true` if `path` exists, else `false`.
	 */
	function hasPath$1(object, path, hasFunc) {
	  path = castPath$2(path, object);

	  var index = -1,
	      length = path.length,
	      result = false;

	  while (++index < length) {
	    var key = toKey$3(path[index]);
	    if (!(result = object != null && hasFunc(object, key))) {
	      break;
	    }
	    object = object[key];
	  }
	  if (result || ++index != length) {
	    return result;
	  }
	  length = object == null ? 0 : object.length;
	  return !!length && isLength(length) && isIndex$1(key, length) &&
	    (isArray$1(object) || isArguments(object));
	}

	var _hasPath = hasPath$1;

	var baseHasIn = _baseHasIn,
	    hasPath = _hasPath;

	/**
	 * Checks if `path` is a direct or inherited property of `object`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Object
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path to check.
	 * @returns {boolean} Returns `true` if `path` exists, else `false`.
	 * @example
	 *
	 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
	 *
	 * _.hasIn(object, 'a');
	 * // => true
	 *
	 * _.hasIn(object, 'a.b');
	 * // => true
	 *
	 * _.hasIn(object, ['a', 'b']);
	 * // => true
	 *
	 * _.hasIn(object, 'b');
	 * // => false
	 */
	function hasIn$1(object, path) {
	  return object != null && hasPath(object, path, baseHasIn);
	}

	var hasIn_1 = hasIn$1;

	var baseIsEqual = _baseIsEqual,
	    get = get_1,
	    hasIn = hasIn_1,
	    isKey$1 = _isKey,
	    isStrictComparable = _isStrictComparable,
	    matchesStrictComparable = _matchesStrictComparable,
	    toKey$2 = _toKey;

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1,
	    COMPARE_UNORDERED_FLAG = 2;

	/**
	 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
	 *
	 * @private
	 * @param {string} path The path of the property to get.
	 * @param {*} srcValue The value to match.
	 * @returns {Function} Returns the new spec function.
	 */
	function baseMatchesProperty$1(path, srcValue) {
	  if (isKey$1(path) && isStrictComparable(srcValue)) {
	    return matchesStrictComparable(toKey$2(path), srcValue);
	  }
	  return function(object) {
	    var objValue = get(object, path);
	    return (objValue === undefined && objValue === srcValue)
	      ? hasIn(object, path)
	      : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
	  };
	}

	var _baseMatchesProperty = baseMatchesProperty$1;

	/**
	 * This method returns the first argument it receives.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Util
	 * @param {*} value Any value.
	 * @returns {*} Returns `value`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 *
	 * console.log(_.identity(object) === object);
	 * // => true
	 */

	function identity$1(value) {
	  return value;
	}

	var identity_1 = identity$1;

	/**
	 * The base implementation of `_.property` without support for deep paths.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 */

	function baseProperty$1(key) {
	  return function(object) {
	    return object == null ? undefined : object[key];
	  };
	}

	var _baseProperty = baseProperty$1;

	var baseGet$1 = _baseGet;

	/**
	 * A specialized version of `baseProperty` which supports deep paths.
	 *
	 * @private
	 * @param {Array|string} path The path of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 */
	function basePropertyDeep$1(path) {
	  return function(object) {
	    return baseGet$1(object, path);
	  };
	}

	var _basePropertyDeep = basePropertyDeep$1;

	var baseProperty = _baseProperty,
	    basePropertyDeep = _basePropertyDeep,
	    isKey = _isKey,
	    toKey$1 = _toKey;

	/**
	 * Creates a function that returns the value at `path` of a given object.
	 *
	 * @static
	 * @memberOf _
	 * @since 2.4.0
	 * @category Util
	 * @param {Array|string} path The path of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 * @example
	 *
	 * var objects = [
	 *   { 'a': { 'b': 2 } },
	 *   { 'a': { 'b': 1 } }
	 * ];
	 *
	 * _.map(objects, _.property('a.b'));
	 * // => [2, 1]
	 *
	 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
	 * // => [1, 2]
	 */
	function property$1(path) {
	  return isKey(path) ? baseProperty(toKey$1(path)) : basePropertyDeep(path);
	}

	var property_1 = property$1;

	var baseMatches = _baseMatches,
	    baseMatchesProperty = _baseMatchesProperty,
	    identity = identity_1,
	    isArray = isArray_1,
	    property = property_1;

	/**
	 * The base implementation of `_.iteratee`.
	 *
	 * @private
	 * @param {*} [value=_.identity] The value to convert to an iteratee.
	 * @returns {Function} Returns the iteratee.
	 */
	function baseIteratee$1(value) {
	  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
	  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
	  if (typeof value == 'function') {
	    return value;
	  }
	  if (value == null) {
	    return identity;
	  }
	  if (typeof value == 'object') {
	    return isArray(value)
	      ? baseMatchesProperty(value[0], value[1])
	      : baseMatches(value);
	  }
	  return property(value);
	}

	var _baseIteratee = baseIteratee$1;

	var getNative = _getNative;

	var defineProperty$1 = (function() {
	  try {
	    var func = getNative(Object, 'defineProperty');
	    func({}, '', {});
	    return func;
	  } catch (e) {}
	}());

	var _defineProperty = defineProperty$1;

	var defineProperty = _defineProperty;

	/**
	 * The base implementation of `assignValue` and `assignMergeValue` without
	 * value checks.
	 *
	 * @private
	 * @param {Object} object The object to modify.
	 * @param {string} key The key of the property to assign.
	 * @param {*} value The value to assign.
	 */
	function baseAssignValue$1(object, key, value) {
	  if (key == '__proto__' && defineProperty) {
	    defineProperty(object, key, {
	      'configurable': true,
	      'enumerable': true,
	      'value': value,
	      'writable': true
	    });
	  } else {
	    object[key] = value;
	  }
	}

	var _baseAssignValue = baseAssignValue$1;

	var baseAssignValue = _baseAssignValue,
	    eq = eq_1;

	/** Used for built-in method references. */
	var objectProto$1 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$1 = objectProto$1.hasOwnProperty;

	/**
	 * Assigns `value` to `key` of `object` if the existing value is not equivalent
	 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * for equality comparisons.
	 *
	 * @private
	 * @param {Object} object The object to modify.
	 * @param {string} key The key of the property to assign.
	 * @param {*} value The value to assign.
	 */
	function assignValue$1(object, key, value) {
	  var objValue = object[key];
	  if (!(hasOwnProperty$1.call(object, key) && eq(objValue, value)) ||
	      (value === undefined && !(key in object))) {
	    baseAssignValue(object, key, value);
	  }
	}

	var _assignValue = assignValue$1;

	var assignValue = _assignValue,
	    castPath$1 = _castPath,
	    isIndex = _isIndex,
	    isObject$1 = isObject_1,
	    toKey = _toKey;

	/**
	 * The base implementation of `_.set`.
	 *
	 * @private
	 * @param {Object} object The object to modify.
	 * @param {Array|string} path The path of the property to set.
	 * @param {*} value The value to set.
	 * @param {Function} [customizer] The function to customize path creation.
	 * @returns {Object} Returns `object`.
	 */
	function baseSet$1(object, path, value, customizer) {
	  if (!isObject$1(object)) {
	    return object;
	  }
	  path = castPath$1(path, object);

	  var index = -1,
	      length = path.length,
	      lastIndex = length - 1,
	      nested = object;

	  while (nested != null && ++index < length) {
	    var key = toKey(path[index]),
	        newValue = value;

	    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
	      return object;
	    }

	    if (index != lastIndex) {
	      var objValue = nested[key];
	      newValue = customizer ? customizer(objValue, key, nested) : undefined;
	      if (newValue === undefined) {
	        newValue = isObject$1(objValue)
	          ? objValue
	          : (isIndex(path[index + 1]) ? [] : {});
	      }
	    }
	    assignValue(nested, key, newValue);
	    nested = nested[key];
	  }
	  return object;
	}

	var _baseSet = baseSet$1;

	var baseGet = _baseGet,
	    baseSet = _baseSet,
	    castPath = _castPath;

	/**
	 * The base implementation of  `_.pickBy` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Object} object The source object.
	 * @param {string[]} paths The property paths to pick.
	 * @param {Function} predicate The function invoked per property.
	 * @returns {Object} Returns the new object.
	 */
	function basePickBy$1(object, paths, predicate) {
	  var index = -1,
	      length = paths.length,
	      result = {};

	  while (++index < length) {
	    var path = paths[index],
	        value = baseGet(object, path);

	    if (predicate(value, path)) {
	      baseSet(result, castPath(path, object), value);
	    }
	  }
	  return result;
	}

	var _basePickBy = basePickBy$1;

	var overArg = _overArg;

	/** Built-in value references. */
	var getPrototype$1 = overArg(Object.getPrototypeOf, Object);

	var _getPrototype = getPrototype$1;

	var arrayPush = _arrayPush,
	    getPrototype = _getPrototype,
	    getSymbols = _getSymbols,
	    stubArray = stubArray_1;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeGetSymbols = Object.getOwnPropertySymbols;

	/**
	 * Creates an array of the own and inherited enumerable symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of symbols.
	 */
	var getSymbolsIn$1 = !nativeGetSymbols ? stubArray : function(object) {
	  var result = [];
	  while (object) {
	    arrayPush(result, getSymbols(object));
	    object = getPrototype(object);
	  }
	  return result;
	};

	var _getSymbolsIn = getSymbolsIn$1;

	/**
	 * This function is like
	 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
	 * except that it includes inherited enumerable properties.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */

	function nativeKeysIn$1(object) {
	  var result = [];
	  if (object != null) {
	    for (var key in Object(object)) {
	      result.push(key);
	    }
	  }
	  return result;
	}

	var _nativeKeysIn = nativeKeysIn$1;

	var isObject = isObject_1,
	    isPrototype = _isPrototype,
	    nativeKeysIn = _nativeKeysIn;

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function baseKeysIn$1(object) {
	  if (!isObject(object)) {
	    return nativeKeysIn(object);
	  }
	  var isProto = isPrototype(object),
	      result = [];

	  for (var key in object) {
	    if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
	      result.push(key);
	    }
	  }
	  return result;
	}

	var _baseKeysIn = baseKeysIn$1;

	var arrayLikeKeys = _arrayLikeKeys,
	    baseKeysIn = _baseKeysIn,
	    isArrayLike = isArrayLike_1;

	/**
	 * Creates an array of the own and inherited enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keysIn(new Foo);
	 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
	 */
	function keysIn$1(object) {
	  return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
	}

	var keysIn_1 = keysIn$1;

	var baseGetAllKeys = _baseGetAllKeys,
	    getSymbolsIn = _getSymbolsIn,
	    keysIn = keysIn_1;

	/**
	 * Creates an array of own and inherited enumerable property names and
	 * symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names and symbols.
	 */
	function getAllKeysIn$1(object) {
	  return baseGetAllKeys(object, keysIn, getSymbolsIn);
	}

	var _getAllKeysIn = getAllKeysIn$1;

	var arrayMap = _arrayMap,
	    baseIteratee = _baseIteratee,
	    basePickBy = _basePickBy,
	    getAllKeysIn = _getAllKeysIn;

	/**
	 * Creates an object composed of the `object` properties `predicate` returns
	 * truthy for. The predicate is invoked with two arguments: (value, key).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Object
	 * @param {Object} object The source object.
	 * @param {Function} [predicate=_.identity] The function invoked per property.
	 * @returns {Object} Returns the new object.
	 * @example
	 *
	 * var object = { 'a': 1, 'b': '2', 'c': 3 };
	 *
	 * _.pickBy(object, _.isNumber);
	 * // => { 'a': 1, 'c': 3 }
	 */
	function pickBy(object, predicate) {
	  if (object == null) {
	    return {};
	  }
	  var props = arrayMap(getAllKeysIn(object), function(prop) {
	    return [prop];
	  });
	  predicate = baseIteratee(predicate);
	  return basePickBy(object, props, function(value, path) {
	    return predicate(value, path[0]);
	  });
	}

	var pickBy_1 = pickBy;

	var pickBy$1 = /*@__PURE__*/getDefaultExportFromCjs(pickBy_1);

	function FilterDrawer(props) {
	  const {
	    resource
	  } = props;
	  const properties = resource.filterProperties;
	  const [filter, setFilter] = react.useState({});
	  const {
	    translateButton,
	    translateLabel
	  } = adminjs.useTranslation();
	  const initialLoad = react.useRef(true);
	  const {
	    isVisible,
	    toggleFilter
	  } = adminjs.useFilterDrawer();
	  const {
	    storeParams,
	    clearParams,
	    filters
	  } = adminjs.useQueryParams();
	  react.useEffect(() => {
	    if (initialLoad.current) {
	      initialLoad.current = false;
	    } else {
	      setFilter({});
	    }
	  }, [resource.id]);
	  const handleSubmit = event => {
	    event.preventDefault();
	    storeParams({
	      filters: pickBy$1(filter, v => !isNil$1(v)),
	      page: '1'
	    });
	  };
	  const handleReset = event => {
	    event.preventDefault();
	    clearParams('filters');
	    setFilter({});
	  };
	  react.useEffect(() => {
	    if (filters) {
	      setFilter(filters);
	    }
	  }, [filters]);
	  const handleChange = (propertyOrRecord, value) => {
	    if (typeof propertyOrRecord !== 'string') {
	      throw new Error('you can not pass RecordJSON to filters');
	    }
	    setFilter({
	      ...filter,
	      [propertyOrRecord]: typeof value === 'string' && !value.length ? undefined : value
	    });
	  };
	  const getResourceElementCss = (resourceId, suffix) => `${resourceId}-${suffix}`;
	  const contentTag = getResourceElementCss(resource.id, 'filter-drawer');
	  const cssContent = getResourceElementCss(resource.id, 'filter-drawer-content');
	  const cssFooter = getResourceElementCss(resource.id, 'filter-drawer-footer');
	  const cssButtonApply = getResourceElementCss(resource.id, 'filter-drawer-button-apply');
	  const cssButtonReset = getResourceElementCss(resource.id, 'filter-drawer-button-reset');
	  return /*#__PURE__*/React.createElement(React.Fragment, null, isVisible ? /*#__PURE__*/React.createElement("div", {
	    className: "admin-filter-overlay",
	    onClick: toggleFilter,
	    role: "button",
	    tabIndex: -1,
	    "aria-label": "Close filters"
	  }) : null, /*#__PURE__*/React.createElement(designSystem.Drawer, {
	    variant: "filter",
	    isHidden: !isVisible,
	    as: "form",
	    onSubmit: handleSubmit,
	    onReset: handleReset,
	    "data-css": contentTag
	  }, /*#__PURE__*/React.createElement(designSystem.DrawerContent, {
	    "data-css": cssContent
	  }, /*#__PURE__*/React.createElement(designSystem.Box, {
	    flex: true,
	    justifyContent: "space-between"
	  }, /*#__PURE__*/React.createElement(designSystem.H3, null, translateLabel('filters', resource.id)), /*#__PURE__*/React.createElement(designSystem.Button, {
	    type: "button",
	    variant: "light",
	    size: "icon",
	    rounded: true,
	    color: "text",
	    onClick: toggleFilter
	  }, /*#__PURE__*/React.createElement(designSystem.Icon, {
	    icon: "X"
	  }))), /*#__PURE__*/React.createElement(designSystem.Box, {
	    my: "x3"
	  }, properties.map(property => /*#__PURE__*/React.createElement(adminjs.BasePropertyComponent, {
	    key: property.propertyPath,
	    where: "filter",
	    onChange: handleChange,
	    property: property,
	    filter: filter,
	    resource: resource
	  })))), /*#__PURE__*/React.createElement(designSystem.DrawerFooter, {
	    "data-css": cssFooter
	  }, /*#__PURE__*/React.createElement(designSystem.Button, {
	    type: "button",
	    variant: "light",
	    onClick: handleReset,
	    "data-css": cssButtonReset
	  }, translateButton('resetFilter', resource.id)), /*#__PURE__*/React.createElement(designSystem.Button, {
	    type: "submit",
	    variant: "contained",
	    "data-css": cssButtonApply
	  }, translateButton('applyChanges', resource.id)))));
	}

	AdminJS.UserComponents = {};
	AdminJS.UserComponents.OrderStatusAction = OrderStatusAction;
	AdminJS.UserComponents.CancelOrderAction = CancelOrderAction;
	AdminJS.UserComponents.OrderAuditTimelineAction = OrderAuditTimelineAction;
	AdminJS.UserComponents.OrderShow = OrderShow;
	AdminJS.UserComponents.OrderFulfillmentAction = OrderFulfillmentAction;
	AdminJS.UserComponents.OrderPackingSlipAction = OrderPackingSlipAction;
	AdminJS.UserComponents.OrderTotalList = OrderTotalList;
	AdminJS.UserComponents.OrderTotalRangeFilter = OrderTotalRangeFilter;
	AdminJS.UserComponents.SelectFilterWithPlaceholder = SelectFilterWithPlaceholder;
	AdminJS.UserComponents.UserShow = UserShow;
	AdminJS.UserComponents.UserSegments = UserSegments;
	AdminJS.UserComponents.ProductScheduleDiscountAction = ProductScheduleDiscountAction;
	AdminJS.UserComponents.ProductNameList = ProductNameList;
	AdminJS.UserComponents.ProductList = ProductList;
	AdminJS.UserComponents.ProductShow = ProductShow;
	AdminJS.UserComponents.ProductBulkSetCategoryAction = ProductBulkSetCategoryAction;
	AdminJS.UserComponents.ProductBulkSetBrandAction = ProductBulkSetBrandAction;
	AdminJS.UserComponents.ProductBulkEditTagsAction = ProductBulkEditTagsAction;
	AdminJS.UserComponents.ProductBulkAdjustPriceAction = ProductBulkAdjustPriceAction;
	AdminJS.UserComponents.ProductBulkToggleInStockAction = ProductBulkToggleInStockAction;
	AdminJS.UserComponents.Dashboard = Dashboard;
	AdminJS.UserComponents.Login = Login;
	AdminJS.UserComponents.LoggedIn = LoggedIn;
	AdminJS.UserComponents.TopBar = TopBar;
	AdminJS.UserComponents.FilterDrawer = FilterDrawer;

})(React, AdminJS, AdminJSDesignSystem);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9PcmRlclN0YXR1c0FjdGlvbi50c3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9DYW5jZWxPcmRlckFjdGlvbi50c3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9PcmRlckF1ZGl0VGltZWxpbmVBY3Rpb24udHN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvT3JkZXJTaG93LnRzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL09yZGVyRnVsZmlsbG1lbnRBY3Rpb24udHN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvT3JkZXJQYWNraW5nU2xpcEFjdGlvbi50c3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9PcmRlclRvdGFsTGlzdC50c3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9PcmRlclRvdGFsUmFuZ2VGaWx0ZXIudHN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvU2VsZWN0RmlsdGVyV2l0aFBsYWNlaG9sZGVyLnRzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL1VzZXJTaG93LnRzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL1VzZXJTZWdtZW50cy50c3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9Qcm9kdWN0U2NoZWR1bGVEaXNjb3VudEFjdGlvbi50c3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9Qcm9kdWN0TmFtZUxpc3QudHN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvUHJvZHVjdExpc3QudHN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvUHJvZHVjdFNob3cudHN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvUHJvZHVjdEJ1bGtTZXRDYXRlZ29yeUFjdGlvbi50c3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9Qcm9kdWN0QnVsa1NldEJyYW5kQWN0aW9uLnRzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL1Byb2R1Y3RCdWxrRWRpdFRhZ3NBY3Rpb24udHN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvUHJvZHVjdEJ1bGtBZGp1c3RQcmljZUFjdGlvbi50c3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9Qcm9kdWN0QnVsa1RvZ2dsZUluU3RvY2tBY3Rpb24udHN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvRGFzaGJvYXJkLnRzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL0xvZ2luLnRzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL0xvZ2dlZEluLnRzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL1RvcEJhci50c3giLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL2lzTmlsLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYXJyYXlNYXAuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19saXN0Q2FjaGVDbGVhci5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvZXEuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19hc3NvY0luZGV4T2YuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19saXN0Q2FjaGVEZWxldGUuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19saXN0Q2FjaGVHZXQuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19saXN0Q2FjaGVIYXMuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19saXN0Q2FjaGVTZXQuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19MaXN0Q2FjaGUuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19zdGFja0NsZWFyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fc3RhY2tEZWxldGUuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19zdGFja0dldC5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX3N0YWNrSGFzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZnJlZUdsb2JhbC5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX3Jvb3QuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19TeW1ib2wuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19nZXRSYXdUYWcuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19vYmplY3RUb1N0cmluZy5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VHZXRUYWcuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL2lzT2JqZWN0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9pc0Z1bmN0aW9uLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fY29yZUpzRGF0YS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2lzTWFza2VkLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fdG9Tb3VyY2UuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlSXNOYXRpdmUuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19nZXRWYWx1ZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldE5hdGl2ZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX01hcC5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX25hdGl2ZUNyZWF0ZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2hhc2hDbGVhci5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2hhc2hEZWxldGUuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19oYXNoR2V0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faGFzaEhhcy5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2hhc2hTZXQuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19IYXNoLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbWFwQ2FjaGVDbGVhci5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2lzS2V5YWJsZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldE1hcERhdGEuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19tYXBDYWNoZURlbGV0ZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX21hcENhY2hlR2V0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbWFwQ2FjaGVIYXMuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19tYXBDYWNoZVNldC5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX01hcENhY2hlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fc3RhY2tTZXQuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19TdGFjay5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX3NldENhY2hlQWRkLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fc2V0Q2FjaGVIYXMuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19TZXRDYWNoZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2FycmF5U29tZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2NhY2hlSGFzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZXF1YWxBcnJheXMuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19VaW50OEFycmF5LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbWFwVG9BcnJheS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX3NldFRvQXJyYXkuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19lcXVhbEJ5VGFnLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYXJyYXlQdXNoLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9pc0FycmF5LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUdldEFsbEtleXMuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19hcnJheUZpbHRlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvc3R1YkFycmF5LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZ2V0U3ltYm9scy5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VUaW1lcy5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNPYmplY3RMaWtlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUlzQXJndW1lbnRzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9pc0FyZ3VtZW50cy5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvc3R1YkZhbHNlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9pc0J1ZmZlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2lzSW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL2lzTGVuZ3RoLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUlzVHlwZWRBcnJheS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VVbmFyeS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX25vZGVVdGlsLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9pc1R5cGVkQXJyYXkuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19hcnJheUxpa2VLZXlzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faXNQcm90b3R5cGUuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19vdmVyQXJnLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbmF0aXZlS2V5cy5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VLZXlzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9pc0FycmF5TGlrZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gva2V5cy5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldEFsbEtleXMuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19lcXVhbE9iamVjdHMuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19EYXRhVmlldy5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX1Byb21pc2UuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19TZXQuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19XZWFrTWFwLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZ2V0VGFnLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUlzRXF1YWxEZWVwLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUlzRXF1YWwuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlSXNNYXRjaC5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2lzU3RyaWN0Q29tcGFyYWJsZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldE1hdGNoRGF0YS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX21hdGNoZXNTdHJpY3RDb21wYXJhYmxlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZU1hdGNoZXMuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL2lzU3ltYm9sLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faXNLZXkuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL21lbW9pemUuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19tZW1vaXplQ2FwcGVkLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fc3RyaW5nVG9QYXRoLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZVRvU3RyaW5nLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC90b1N0cmluZy5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Nhc3RQYXRoLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fdG9LZXkuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlR2V0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9nZXQuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlSGFzSW4uanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19oYXNQYXRoLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9oYXNJbi5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VNYXRjaGVzUHJvcGVydHkuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL2lkZW50aXR5LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZVByb3BlcnR5LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZVByb3BlcnR5RGVlcC5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvcHJvcGVydHkuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlSXRlcmF0ZWUuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19kZWZpbmVQcm9wZXJ0eS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VBc3NpZ25WYWx1ZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Fzc2lnblZhbHVlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZVNldC5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VQaWNrQnkuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19nZXRQcm90b3R5cGUuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19nZXRTeW1ib2xzSW4uanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19uYXRpdmVLZXlzSW4uanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlS2V5c0luLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9rZXlzSW4uanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19nZXRBbGxLZXlzSW4uanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL3BpY2tCeS5qcyIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL0ZpbHRlckRyYXdlci50c3giLCJlbnRyeS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VNZW1vLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEFwaUNsaWVudCwgdHlwZSBBY3Rpb25Qcm9wcywgdXNlTm90aWNlLCB1c2VUcmFuc2xhdGlvbiB9IGZyb20gJ2FkbWluanMnO1xuaW1wb3J0IHsgQmFkZ2UsIEJveCwgQnV0dG9uLCBGb3JtR3JvdXAsIFNlbGVjdCwgVGV4dCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xuXG50eXBlIE9yZGVyU3RhdHVzID0gJ1BFTkRJTkcnIHwgJ1BBSUQnIHwgJ1NISVBQRUQnIHwgJ0RFTElWRVJFRCcgfCAnQ0FOQ0VMTEVEJztcbnR5cGUgU3RhdHVzT3B0aW9uID0geyB2YWx1ZTogT3JkZXJTdGF0dXM7IGxhYmVsOiBzdHJpbmcgfTtcblxuY29uc3QgYXBpID0gbmV3IEFwaUNsaWVudCgpO1xuXG5jb25zdCBzdGF0dXNlczogT3JkZXJTdGF0dXNbXSA9IFsnUEVORElORycsICdQQUlEJywgJ1NISVBQRUQnLCAnREVMSVZFUkVEJywgJ0NBTkNFTExFRCddO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBPcmRlclN0YXR1c0FjdGlvbih7IGFjdGlvbiwgcmVjb3JkLCByZXNvdXJjZSB9OiBBY3Rpb25Qcm9wcykge1xuXHRjb25zdCBbbG9jYWxSZWNvcmQsIHNldExvY2FsUmVjb3JkXSA9IHVzZVN0YXRlKHJlY29yZCk7XG5cdGNvbnN0IFtzZWxlY3RlZFN0YXR1cywgc2V0U2VsZWN0ZWRTdGF0dXNdID0gdXNlU3RhdGU8T3JkZXJTdGF0dXM+KFxuXHRcdChyZWNvcmQ/LnBhcmFtcy5zdGF0dXMgYXMgT3JkZXJTdGF0dXMpID8/ICdQRU5ESU5HJ1xuXHQpO1xuXHRjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG5cdGNvbnN0IGFkZE5vdGljZSA9IHVzZU5vdGljZSgpO1xuXHRjb25zdCB7IHRyYW5zbGF0ZUFjdGlvbiwgdHJhbnNsYXRlTGFiZWwsIHRyYW5zbGF0ZU1lc3NhZ2UgfSA9IHVzZVRyYW5zbGF0aW9uKCk7XG5cblx0aWYgKCFsb2NhbFJlY29yZCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8Qm94IHZhcmlhbnQ9J3doaXRlJyBwPSd4bCc+XG5cdFx0XHRcdDxUZXh0Pnt0cmFuc2xhdGVNZXNzYWdlKCdzdGF0dXMtdXBkYXRlLWZhaWxlZCcpfTwvVGV4dD5cblx0XHRcdDwvQm94PlxuXHRcdCk7XG5cdH1cblxuXHRjb25zdCBjdXJyZW50U3RhdHVzID0gbG9jYWxSZWNvcmQucGFyYW1zLnN0YXR1cyBhcyBPcmRlclN0YXR1cyB8IHVuZGVmaW5lZDtcblx0Y29uc3Qgc3RhdHVzT3B0aW9ucyA9IHVzZU1lbW88U3RhdHVzT3B0aW9uW10+KFxuXHRcdCgpID0+XG5cdFx0XHRzdGF0dXNlcy5tYXAoKHN0YXR1cykgPT4gKHtcblx0XHRcdFx0dmFsdWU6IHN0YXR1cyxcblx0XHRcdFx0bGFiZWw6IHRyYW5zbGF0ZUxhYmVsKGBzdGF0dXMuJHtzdGF0dXN9YCwgcmVzb3VyY2UuaWQpLFxuXHRcdFx0fSkpLFxuXHRcdFtyZXNvdXJjZS5pZCwgdHJhbnNsYXRlTGFiZWxdXG5cdCk7XG5cdGNvbnN0IGN1cnJlbnRMYWJlbCA9IGN1cnJlbnRTdGF0dXNcblx0XHQ/IHRyYW5zbGF0ZUxhYmVsKGBzdGF0dXMuJHtjdXJyZW50U3RhdHVzfWAsIHJlc291cmNlLmlkKVxuXHRcdDogdHJhbnNsYXRlTWVzc2FnZSgnc3RhdHVzLXVua25vd24nKTtcblx0Y29uc3Qgc2VsZWN0ZWRPcHRpb24gPSBzdGF0dXNPcHRpb25zLmZpbmQoKG9wdGlvbikgPT4gb3B0aW9uLnZhbHVlID09PSBzZWxlY3RlZFN0YXR1cykgPz8gbnVsbDtcblx0Y29uc3QgbmV4dExhYmVsID0gc2VsZWN0ZWRTdGF0dXMgPyB0cmFuc2xhdGVMYWJlbChgc3RhdHVzLiR7c2VsZWN0ZWRTdGF0dXN9YCwgcmVzb3VyY2UuaWQpIDogbnVsbDtcblxuXHRjb25zdCBoYW5kbGVDbGljayA9IGFzeW5jICgpID0+IHtcblx0XHRpZiAoIWxvY2FsUmVjb3JkIHx8ICFzZWxlY3RlZFN0YXR1cykgcmV0dXJuO1xuXHRcdHNldExvYWRpbmcodHJ1ZSk7XG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG5cdFx0XHRmb3JtRGF0YS5hcHBlbmQoJ3N0YXR1cycsIHNlbGVjdGVkU3RhdHVzKTtcblx0XHRcdGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXBpLnJlY29yZEFjdGlvbih7XG5cdFx0XHRcdHJlc291cmNlSWQ6IHJlc291cmNlLmlkLFxuXHRcdFx0XHRyZWNvcmRJZDogbG9jYWxSZWNvcmQuaWQsXG5cdFx0XHRcdGFjdGlvbk5hbWU6IGFjdGlvbi5uYW1lLFxuXHRcdFx0XHRtZXRob2Q6ICdwb3N0Jyxcblx0XHRcdFx0ZGF0YTogZm9ybURhdGEsXG5cdFx0XHR9KTtcblx0XHRcdGlmIChyZXNwb25zZS5kYXRhLm5vdGljZT8udHlwZSA9PT0gJ2Vycm9yJykge1xuXHRcdFx0XHRhZGROb3RpY2UocmVzcG9uc2UuZGF0YS5ub3RpY2UpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YWRkTm90aWNlKHtcblx0XHRcdFx0XHRtZXNzYWdlOiAnc3RhdHVzLXVwZGF0ZWQnLFxuXHRcdFx0XHRcdHR5cGU6ICdzdWNjZXNzJyxcblx0XHRcdFx0XHRvcHRpb25zOiB7IHN0YXR1czogbmV4dExhYmVsID8/IHNlbGVjdGVkU3RhdHVzIH0sXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHJlc3BvbnNlLmRhdGEucmVjb3JkKSB7XG5cdFx0XHRcdHNldExvY2FsUmVjb3JkKHJlc3BvbnNlLmRhdGEucmVjb3JkKTtcblx0XHRcdH1cblx0XHR9IGNhdGNoIHtcblx0XHRcdGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdzdGF0dXMtdXBkYXRlLWZhaWxlZCcsIHR5cGU6ICdlcnJvcicgfSk7XG5cdFx0fSBmaW5hbGx5IHtcblx0XHRcdHNldExvYWRpbmcoZmFsc2UpO1xuXHRcdH1cblx0fTtcblxuXHRjb25zdCBidXR0b25MYWJlbCA9IGxvYWRpbmdcblx0XHQ/IHRyYW5zbGF0ZU1lc3NhZ2UoJ3N0YXR1cy11cGRhdGUtcHJvZ3Jlc3MnKVxuXHRcdDogdHJhbnNsYXRlTWVzc2FnZSgnYXBwbHktc3RhdHVzJyk7XG5cdGNvbnN0IHRpdGxlID0gdHJhbnNsYXRlQWN0aW9uKGFjdGlvbi5uYW1lLCByZXNvdXJjZS5pZCk7XG5cblx0cmV0dXJuIChcblx0XHQ8Qm94XG5cdFx0XHR2YXJpYW50PSd3aGl0ZSdcblx0XHRcdHA9J3h4bCdcblx0XHRcdGJvcmRlclJhZGl1cz0neGwnXG5cdFx0XHRib3hTaGFkb3c9J3NtJ1xuXHRcdFx0bWF4V2lkdGg9JzY4MHB4J1xuXHRcdFx0c3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnIH19XG5cdFx0PlxuXHRcdFx0PEJveCBkaXNwbGF5PSdmbGV4JyBhbGlnbkl0ZW1zPSdjZW50ZXInIGp1c3RpZnlDb250ZW50PSdzcGFjZS1iZXR3ZWVuJyBtYj0neGwnPlxuXHRcdFx0XHQ8VGV4dCBmb250U2l6ZT0neGwnIGZvbnRXZWlnaHQ9J2JvbGQnPlxuXHRcdFx0XHRcdHt0aXRsZX1cblx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0PC9Cb3g+XG5cdFx0XHQ8Qm94IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGdhcDogMjQgfX0+XG5cdFx0XHRcdDxCb3ggZGlzcGxheT0nZmxleCcgYWxpZ25JdGVtcz0nY2VudGVyJz5cblx0XHRcdFx0XHQ8VGV4dCBmb250U2l6ZT0nbGcnIGZvbnRXZWlnaHQ9JzUwMCcgbXI9J2xnJz5cblx0XHRcdFx0XHRcdHt0cmFuc2xhdGVNZXNzYWdlKCdjdXJyZW50LXN0YXR1cycpfVxuXHRcdFx0XHRcdDwvVGV4dD5cblx0XHRcdFx0XHQ8QmFkZ2Vcblx0XHRcdFx0XHRcdGZvbnRTaXplPSdtZCdcblx0XHRcdFx0XHRcdG91dGxpbmVcblx0XHRcdFx0XHRcdHN0eWxlPXt7XG5cdFx0XHRcdFx0XHRcdGJhY2tncm91bmQ6ICcjQzZGNkQ1Jyxcblx0XHRcdFx0XHRcdFx0Ym9yZGVyQ29sb3I6ICcjMzhBMTY5Jyxcblx0XHRcdFx0XHRcdFx0Y29sb3I6ICcjMjI1NDNEJyxcblx0XHRcdFx0XHRcdH19XG5cdFx0XHRcdFx0PlxuXHRcdFx0XHRcdFx0e2N1cnJlbnRMYWJlbH1cblx0XHRcdFx0XHQ8L0JhZGdlPlxuXHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0PEZvcm1Hcm91cCBsYWJlbD17dHJhbnNsYXRlTWVzc2FnZSgnc2VsZWN0LXN0YXR1cycpfSBtYj0nMCc+XG5cdFx0XHRcdFx0PFNlbGVjdFxuXHRcdFx0XHRcdFx0aXNDbGVhcmFibGU9e2ZhbHNlfVxuXHRcdFx0XHRcdFx0b3B0aW9ucz17c3RhdHVzT3B0aW9uc31cblx0XHRcdFx0XHRcdHZhbHVlPXtzZWxlY3RlZE9wdGlvbn1cblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsob3B0aW9uOiBTdGF0dXNPcHRpb24gfCBudWxsKSA9PiB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IHZhbHVlID0gb3B0aW9uPy52YWx1ZTtcblx0XHRcdFx0XHRcdFx0c2V0U2VsZWN0ZWRTdGF0dXModmFsdWUgPz8gY3VycmVudFN0YXR1cyA/PyAnUEVORElORycpO1xuXHRcdFx0XHRcdFx0fX1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQ8L0Zvcm1Hcm91cD5cblx0XHRcdFx0e25leHRMYWJlbCA/IChcblx0XHRcdFx0XHQ8Qm94IGRpc3BsYXk9J2ZsZXgnIGFsaWduSXRlbXM9J2NlbnRlcic+XG5cdFx0XHRcdFx0XHQ8VGV4dCBmb250V2VpZ2h0PSc1MDAnIGZvbnRTaXplPSdsZycgbXI9J2xnJz5cblx0XHRcdFx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoJ25ldy1zdGF0dXMnKX1cblx0XHRcdFx0XHRcdDwvVGV4dD5cblx0XHRcdFx0XHRcdDxCYWRnZVxuXHRcdFx0XHRcdFx0XHRmb250U2l6ZT0nbWQnXG5cdFx0XHRcdFx0XHRcdG91dGxpbmVcblx0XHRcdFx0XHRcdFx0c3R5bGU9e3tcblx0XHRcdFx0XHRcdFx0XHRiYWNrZ3JvdW5kOiAnI0M2RjZENScsXG5cdFx0XHRcdFx0XHRcdFx0Ym9yZGVyQ29sb3I6ICcjMzhBMTY5Jyxcblx0XHRcdFx0XHRcdFx0XHRjb2xvcjogJyMyMjU0M0QnLFxuXHRcdFx0XHRcdFx0XHR9fVxuXHRcdFx0XHRcdFx0PlxuXHRcdFx0XHRcdFx0XHR7bmV4dExhYmVsfVxuXHRcdFx0XHRcdFx0PC9CYWRnZT5cblx0XHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0KSA6IG51bGx9XG5cdFx0XHRcdDxCb3g+XG5cdFx0XHRcdFx0PEJ1dHRvblxuXHRcdFx0XHRcdFx0c3R5bGU9e3tcblx0XHRcdFx0XHRcdFx0Ym9yZGVyQ29sb3I6ICd3aGl0ZScsXG5cdFx0XHRcdFx0XHRcdGJhY2tncm91bmQ6ICcjZmFjYzE1Jyxcblx0XHRcdFx0XHRcdFx0Y29sb3I6ICdibGFjaycsXG5cdFx0XHRcdFx0XHR9fVxuXHRcdFx0XHRcdFx0dmFyaWFudD0nY29udGFpbmVkJ1xuXHRcdFx0XHRcdFx0Y29sb3I9J3ByaW1hcnknXG5cdFx0XHRcdFx0XHRvbkNsaWNrPXtoYW5kbGVDbGlja31cblx0XHRcdFx0XHRcdGRpc2FibGVkPXshc2VsZWN0ZWRTdGF0dXMgfHwgbG9hZGluZ31cblx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHR7YnV0dG9uTGFiZWx9XG5cdFx0XHRcdFx0PC9CdXR0b24+XG5cdFx0XHRcdDwvQm94PlxuXHRcdFx0PC9Cb3g+XG5cdFx0PC9Cb3g+XG5cdCk7XG59XG4iLCJpbXBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEFwaUNsaWVudCwgdHlwZSBBY3Rpb25Qcm9wcywgdXNlTm90aWNlLCB1c2VUcmFuc2xhdGlvbiB9IGZyb20gJ2FkbWluanMnO1xuaW1wb3J0IHsgQm94LCBCdXR0b24sIFRleHQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcblxuY29uc3QgYXBpID0gbmV3IEFwaUNsaWVudCgpO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBDYW5jZWxPcmRlckFjdGlvbih7IGFjdGlvbiwgcmVjb3JkLCByZXNvdXJjZSB9OiBBY3Rpb25Qcm9wcykge1xuXHRjb25zdCBbbG9jYWxSZWNvcmQsIHNldExvY2FsUmVjb3JkXSA9IHVzZVN0YXRlKHJlY29yZCk7XG5cdGNvbnN0IFtyZWZ1bmRQYXltZW50LCBzZXRSZWZ1bmRQYXltZW50XSA9IHVzZVN0YXRlKGZhbHNlKTtcblx0Y29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuXHRjb25zdCBhZGROb3RpY2UgPSB1c2VOb3RpY2UoKTtcblx0Y29uc3QgeyB0cmFuc2xhdGVBY3Rpb24sIHRyYW5zbGF0ZU1lc3NhZ2UgfSA9IHVzZVRyYW5zbGF0aW9uKCk7XG5cblx0aWYgKCFsb2NhbFJlY29yZCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8Qm94IHZhcmlhbnQ9J3doaXRlJyBwPSd4bCc+XG5cdFx0XHRcdDxUZXh0Pnt0cmFuc2xhdGVNZXNzYWdlKCdzdGF0dXMtdXBkYXRlLWZhaWxlZCcpfTwvVGV4dD5cblx0XHRcdDwvQm94PlxuXHRcdCk7XG5cdH1cblxuXHRjb25zdCBzdHJpcGVTZXNzaW9uSWQgPSBsb2NhbFJlY29yZC5wYXJhbXMuc3RyaXBlU2Vzc2lvbklkIGFzIHN0cmluZyB8IHVuZGVmaW5lZDtcblx0Y29uc3QgY2FuUmVmdW5kID0gQm9vbGVhbihzdHJpcGVTZXNzaW9uSWQpO1xuXHRjb25zdCB0aXRsZSA9IHRyYW5zbGF0ZUFjdGlvbihhY3Rpb24ubmFtZSwgcmVzb3VyY2UuaWQpO1xuXHRjb25zdCBidXR0b25MYWJlbCA9IGxvYWRpbmcgPyB0cmFuc2xhdGVNZXNzYWdlKCdjYW5jZWwtb3JkZXItcHJvZ3Jlc3MnKSA6IHRpdGxlO1xuXG5cdGNvbnN0IGhhbmRsZUNhbmNlbCA9IGFzeW5jICgpID0+IHtcblx0XHRpZiAoIWxvY2FsUmVjb3JkKSByZXR1cm47XG5cdFx0c2V0TG9hZGluZyh0cnVlKTtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcblx0XHRcdGZvcm1EYXRhLmFwcGVuZCgncmVmdW5kJywgcmVmdW5kUGF5bWVudCA/ICd0cnVlJyA6ICdmYWxzZScpO1xuXHRcdFx0Y29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhcGkucmVjb3JkQWN0aW9uKHtcblx0XHRcdFx0cmVzb3VyY2VJZDogcmVzb3VyY2UuaWQsXG5cdFx0XHRcdHJlY29yZElkOiBsb2NhbFJlY29yZC5pZCxcblx0XHRcdFx0YWN0aW9uTmFtZTogYWN0aW9uLm5hbWUsXG5cdFx0XHRcdG1ldGhvZDogJ3Bvc3QnLFxuXHRcdFx0XHRkYXRhOiBmb3JtRGF0YSxcblx0XHRcdH0pO1xuXHRcdFx0aWYgKHJlc3BvbnNlLmRhdGEubm90aWNlKSB7XG5cdFx0XHRcdGFkZE5vdGljZShyZXNwb25zZS5kYXRhLm5vdGljZSk7XG5cdFx0XHR9XG5cdFx0XHRpZiAocmVzcG9uc2UuZGF0YS5yZWNvcmQpIHtcblx0XHRcdFx0c2V0TG9jYWxSZWNvcmQocmVzcG9uc2UuZGF0YS5yZWNvcmQpO1xuXHRcdFx0fVxuXHRcdH0gY2F0Y2gge1xuXHRcdFx0YWRkTm90aWNlKHsgbWVzc2FnZTogJ3N0YXR1cy11cGRhdGUtZmFpbGVkJywgdHlwZTogJ2Vycm9yJyB9KTtcblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0c2V0TG9hZGluZyhmYWxzZSk7XG5cdFx0fVxuXHR9O1xuXG5cdHJldHVybiAoXG5cdFx0PEJveFxuXHRcdFx0dmFyaWFudD0nd2hpdGUnXG5cdFx0XHRwPSd4eGwnXG5cdFx0XHRib3JkZXJSYWRpdXM9J3hsJ1xuXHRcdFx0Ym94U2hhZG93PSdzbSdcblx0XHRcdG1heFdpZHRoPSc2ODBweCdcblx0XHRcdHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJyB9fVxuXHRcdD5cblx0XHRcdDxCb3ggZGlzcGxheT0nZmxleCcgYWxpZ25JdGVtcz0nY2VudGVyJyBqdXN0aWZ5Q29udGVudD0nc3BhY2UtYmV0d2VlbicgbWI9J3hsJz5cblx0XHRcdFx0PFRleHQgZm9udFNpemU9J3hsJyBmb250V2VpZ2h0PSdib2xkJz5cblx0XHRcdFx0XHR7dGl0bGV9XG5cdFx0XHRcdDwvVGV4dD5cblx0XHRcdDwvQm94PlxuXHRcdFx0PEJveCBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBnYXA6IDE2IH19PlxuXHRcdFx0XHQ8Qm94XG5cdFx0XHRcdFx0YXM9J2xhYmVsJ1xuXHRcdFx0XHRcdGRpc3BsYXk9J2ZsZXgnXG5cdFx0XHRcdFx0YWxpZ25JdGVtcz0nY2VudGVyJ1xuXHRcdFx0XHRcdHN0eWxlPXt7IGdhcDogMTAsIGN1cnNvcjogY2FuUmVmdW5kID8gJ3BvaW50ZXInIDogJ25vdC1hbGxvd2VkJyB9fVxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0PGlucHV0XG5cdFx0XHRcdFx0XHR0eXBlPSdjaGVja2JveCdcblx0XHRcdFx0XHRcdGNoZWNrZWQ9e3JlZnVuZFBheW1lbnR9XG5cdFx0XHRcdFx0XHRkaXNhYmxlZD17IWNhblJlZnVuZH1cblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldFJlZnVuZFBheW1lbnQoZXZlbnQudGFyZ2V0LmNoZWNrZWQpfVxuXHRcdFx0XHRcdFx0c3R5bGU9e3sgd2lkdGg6IDE2LCBoZWlnaHQ6IDE2IH19XG5cdFx0XHRcdFx0Lz5cblx0XHRcdFx0XHQ8VGV4dD57dHJhbnNsYXRlTWVzc2FnZSgncmVmdW5kLXBheW1lbnQnKX08L1RleHQ+XG5cdFx0XHRcdDwvQm94PlxuXHRcdFx0XHR7IWNhblJlZnVuZCA/IChcblx0XHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJyBmb250U2l6ZT0nc20nPlxuXHRcdFx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoJ3JlZnVuZC1wYXltZW50LWhpbnQnKX1cblx0XHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHRcdCkgOiBudWxsfVxuXHRcdFx0XHQ8Qm94PlxuXHRcdFx0XHRcdDxCdXR0b25cblx0XHRcdFx0XHRcdHN0eWxlPXt7XG5cdFx0XHRcdFx0XHRcdGJvcmRlckNvbG9yOiAnd2hpdGUnLFxuXHRcdFx0XHRcdFx0XHRiYWNrZ3JvdW5kOiAnI2ZhY2MxNScsXG5cdFx0XHRcdFx0XHRcdGNvbG9yOiAnYmxhY2snLFxuXHRcdFx0XHRcdFx0fX1cblx0XHRcdFx0XHRcdHZhcmlhbnQ9J2NvbnRhaW5lZCdcblx0XHRcdFx0XHRcdGNvbG9yPSdwcmltYXJ5J1xuXHRcdFx0XHRcdFx0b25DbGljaz17aGFuZGxlQ2FuY2VsfVxuXHRcdFx0XHRcdFx0ZGlzYWJsZWQ9e2xvYWRpbmd9XG5cdFx0XHRcdFx0PlxuXHRcdFx0XHRcdFx0e2J1dHRvbkxhYmVsfVxuXHRcdFx0XHRcdDwvQnV0dG9uPlxuXHRcdFx0XHQ8L0JveD5cblx0XHRcdDwvQm94PlxuXHRcdDwvQm94PlxuXHQpO1xufVxuIiwiaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQXBpQ2xpZW50LCB0eXBlIEFjdGlvblByb3BzLCB1c2VOb3RpY2UsIHVzZVRyYW5zbGF0aW9uIH0gZnJvbSAnYWRtaW5qcyc7XG5pbXBvcnQgeyBCYWRnZSwgQm94LCBCdXR0b24sIEljb24sIExhYmVsLCBUZXh0IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSc7XG5cbmNvbnN0IGFwaSA9IG5ldyBBcGlDbGllbnQoKTtcblxudHlwZSBPcmRlclN0YXR1cyA9ICdQRU5ESU5HJyB8ICdQQUlEJyB8ICdTSElQUEVEJyB8ICdERUxJVkVSRUQnIHwgJ0NBTkNFTExFRCc7XG5cbnR5cGUgQXVkaXRFbnRyeSA9IHtcblx0aWQ6IHN0cmluZztcblx0dHlwZTogJ1NUQVRVU19DSEFOR0UnIHwgJ05PVEUnO1xuXHRmcm9tU3RhdHVzOiBPcmRlclN0YXR1cyB8IG51bGw7XG5cdHRvU3RhdHVzOiBPcmRlclN0YXR1cyB8IG51bGw7XG5cdG5vdGU6IHN0cmluZyB8IG51bGw7XG5cdGFkbWluRW1haWw6IHN0cmluZyB8IG51bGw7XG5cdGNyZWF0ZWRBdDogc3RyaW5nO1xufTtcblxuY29uc3QgZXh0cmFjdEVudHJpZXMgPSAocGF5bG9hZDogdW5rbm93bik6IEF1ZGl0RW50cnlbXSA9PiB7XG5cdGlmICghcGF5bG9hZCB8fCB0eXBlb2YgcGF5bG9hZCAhPT0gJ29iamVjdCcpIHJldHVybiBbXTtcblx0Y29uc3QgZW50cmllcyA9IChwYXlsb2FkIGFzIHsgZW50cmllcz86IEF1ZGl0RW50cnlbXSB9KS5lbnRyaWVzO1xuXHRyZXR1cm4gQXJyYXkuaXNBcnJheShlbnRyaWVzKSA/IGVudHJpZXMgOiBbXTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIE9yZGVyQXVkaXRUaW1lbGluZUFjdGlvbih7IGFjdGlvbiwgcmVjb3JkLCByZXNvdXJjZSB9OiBBY3Rpb25Qcm9wcykge1xuXHRjb25zdCBbZW50cmllcywgc2V0RW50cmllc10gPSB1c2VTdGF0ZTxBdWRpdEVudHJ5W10+KFtdKTtcblx0Y29uc3QgW25vdGUsIHNldE5vdGVdID0gdXNlU3RhdGUoJycpO1xuXHRjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG5cdGNvbnN0IFtzYXZpbmcsIHNldFNhdmluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG5cdGNvbnN0IGFkZE5vdGljZSA9IHVzZU5vdGljZSgpO1xuXHRjb25zdCB7IHRyYW5zbGF0ZUFjdGlvbiwgdHJhbnNsYXRlTGFiZWwsIHRyYW5zbGF0ZU1lc3NhZ2UgfSA9IHVzZVRyYW5zbGF0aW9uKCk7XG5cdGNvbnN0IHJlY29yZElkID0gcmVjb3JkPy5pZDtcblx0Y29uc3QgYWRkTm90aWNlUmVmID0gdXNlUmVmKGFkZE5vdGljZSk7XG5cblx0dXNlRWZmZWN0KCgpID0+IHtcblx0XHRhZGROb3RpY2VSZWYuY3VycmVudCA9IGFkZE5vdGljZTtcblx0fSwgW2FkZE5vdGljZV0pO1xuXG5cdHVzZUVmZmVjdCgoKSA9PiB7XG5cdFx0aWYgKCFyZWNvcmRJZCkgcmV0dXJuO1xuXHRcdGxldCBpc0FjdGl2ZSA9IHRydWU7XG5cdFx0c2V0TG9hZGluZyh0cnVlKTtcblx0XHRhcGkucmVjb3JkQWN0aW9uKHtcblx0XHRcdHJlc291cmNlSWQ6IHJlc291cmNlLmlkLFxuXHRcdFx0cmVjb3JkSWQsXG5cdFx0XHRhY3Rpb25OYW1lOiBhY3Rpb24ubmFtZSxcblx0XHRcdG1ldGhvZDogJ2dldCcsXG5cdFx0fSlcblx0XHRcdC50aGVuKChyZXNwb25zZSkgPT4ge1xuXHRcdFx0XHRpZiAoIWlzQWN0aXZlKSByZXR1cm47XG5cdFx0XHRcdGNvbnN0IHBheWxvYWRFbnRyaWVzID0gZXh0cmFjdEVudHJpZXMocmVzcG9uc2UuZGF0YS5wYXlsb2FkKTtcblx0XHRcdFx0c2V0RW50cmllcyhwYXlsb2FkRW50cmllcyk7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKCgpID0+IHtcblx0XHRcdFx0aWYgKCFpc0FjdGl2ZSkgcmV0dXJuO1xuXHRcdFx0XHRhZGROb3RpY2VSZWYuY3VycmVudCh7IG1lc3NhZ2U6ICdhdWRpdC1sb2FkLWZhaWxlZCcsIHR5cGU6ICdlcnJvcicgfSk7XG5cdFx0XHR9KVxuXHRcdFx0LmZpbmFsbHkoKCkgPT4ge1xuXHRcdFx0XHRpZiAoIWlzQWN0aXZlKSByZXR1cm47XG5cdFx0XHRcdHNldExvYWRpbmcoZmFsc2UpO1xuXHRcdFx0fSk7XG5cdFx0cmV0dXJuICgpID0+IHtcblx0XHRcdGlzQWN0aXZlID0gZmFsc2U7XG5cdFx0fTtcblx0fSwgW2FjdGlvbi5uYW1lLCByZWNvcmRJZCwgcmVzb3VyY2UuaWRdKTtcblxuXHRpZiAoIXJlY29yZElkKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxCb3ggdmFyaWFudD0nd2hpdGUnIHA9J3hsJz5cblx0XHRcdFx0PFRleHQ+e3RyYW5zbGF0ZU1lc3NhZ2UoJ2F1ZGl0LWxvYWQtZmFpbGVkJyl9PC9UZXh0PlxuXHRcdFx0PC9Cb3g+XG5cdFx0KTtcblx0fVxuXG5cdGNvbnN0IHRpdGxlID0gdHJhbnNsYXRlQWN0aW9uKGFjdGlvbi5uYW1lLCByZXNvdXJjZS5pZCk7XG5cdGNvbnN0IGZvcm1hdFRpbWVzdGFtcCA9ICh2YWx1ZTogc3RyaW5nKSA9PiB7XG5cdFx0Y29uc3QgcGFyc2VkID0gRGF0ZS5wYXJzZSh2YWx1ZSk7XG5cdFx0aWYgKE51bWJlci5pc05hTihwYXJzZWQpKSB7XG5cdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0fVxuXHRcdHJldHVybiBuZXcgRGF0ZShwYXJzZWQpLnRvTG9jYWxlU3RyaW5nKCk7XG5cdH07XG5cblx0Y29uc3QgaGFuZGxlU3VibWl0ID0gYXN5bmMgKCkgPT4ge1xuXHRcdGlmICghcmVjb3JkSWQpIHJldHVybjtcblx0XHRjb25zdCB0cmltbWVkID0gbm90ZS50cmltKCk7XG5cdFx0aWYgKCF0cmltbWVkKSB7XG5cdFx0XHRhZGROb3RpY2UoeyBtZXNzYWdlOiAnYXVkaXQtbm90ZS1lbXB0eScsIHR5cGU6ICdlcnJvcicgfSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdHNldFNhdmluZyh0cnVlKTtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcblx0XHRcdGZvcm1EYXRhLmFwcGVuZCgnbm90ZScsIHRyaW1tZWQpO1xuXHRcdFx0Y29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhcGkucmVjb3JkQWN0aW9uKHtcblx0XHRcdFx0cmVzb3VyY2VJZDogcmVzb3VyY2UuaWQsXG5cdFx0XHRcdHJlY29yZElkLFxuXHRcdFx0XHRhY3Rpb25OYW1lOiBhY3Rpb24ubmFtZSxcblx0XHRcdFx0bWV0aG9kOiAncG9zdCcsXG5cdFx0XHRcdGRhdGE6IGZvcm1EYXRhLFxuXHRcdFx0fSk7XG5cdFx0XHRpZiAocmVzcG9uc2UuZGF0YS5ub3RpY2UpIHtcblx0XHRcdFx0YWRkTm90aWNlKHJlc3BvbnNlLmRhdGEubm90aWNlKTtcblx0XHRcdH1cblx0XHRcdHNldE5vdGUoJycpO1xuXHRcdFx0Y29uc3QgcGF5bG9hZEVudHJpZXMgPSBleHRyYWN0RW50cmllcyhyZXNwb25zZS5kYXRhLnBheWxvYWQpO1xuXHRcdFx0c2V0RW50cmllcyhwYXlsb2FkRW50cmllcyk7XG5cdFx0fSBjYXRjaCB7XG5cdFx0XHRhZGROb3RpY2UoeyBtZXNzYWdlOiAnYXVkaXQtbm90ZS1zYXZlLWZhaWxlZCcsIHR5cGU6ICdlcnJvcicgfSk7XG5cdFx0fSBmaW5hbGx5IHtcblx0XHRcdHNldFNhdmluZyhmYWxzZSk7XG5cdFx0fVxuXHR9O1xuXG5cdHJldHVybiAoXG5cdFx0PEJveFxuXHRcdFx0dmFyaWFudD0nd2hpdGUnXG5cdFx0XHRwPSd4eGwnXG5cdFx0XHRib3JkZXJSYWRpdXM9J3hsJ1xuXHRcdFx0Ym94U2hhZG93PSdzbSdcblx0XHRcdG1heFdpZHRoPSc4MjBweCdcblx0XHRcdHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJyB9fVxuXHRcdD5cblx0XHRcdDxCb3ggZGlzcGxheT0nZmxleCcgYWxpZ25JdGVtcz0nY2VudGVyJyBqdXN0aWZ5Q29udGVudD0nc3BhY2UtYmV0d2VlbicgbWI9J3hsJz5cblx0XHRcdFx0PFRleHQgZm9udFNpemU9J3hsJyBmb250V2VpZ2h0PSdib2xkJz5cblx0XHRcdFx0XHR7dGl0bGV9XG5cdFx0XHRcdDwvVGV4dD5cblx0XHRcdDwvQm94PlxuXHRcdFx0PEJveCBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBnYXA6IDIwIH19PlxuXHRcdFx0XHQ8Qm94PlxuXHRcdFx0XHRcdDxMYWJlbCBodG1sRm9yPSdhdWRpdC1ub3RlJz57dHJhbnNsYXRlTWVzc2FnZSgnYXVkaXQtbm90ZS1sYWJlbCcpfTwvTGFiZWw+XG5cdFx0XHRcdFx0PHRleHRhcmVhXG5cdFx0XHRcdFx0XHRpZD0nYXVkaXQtbm90ZSdcblx0XHRcdFx0XHRcdG5hbWU9J2F1ZGl0Tm90ZSdcblx0XHRcdFx0XHRcdHZhbHVlPXtub3RlfVxuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyhldmVudCkgPT4gc2V0Tm90ZShldmVudC50YXJnZXQudmFsdWUpfVxuXHRcdFx0XHRcdFx0cGxhY2Vob2xkZXI9e3RyYW5zbGF0ZU1lc3NhZ2UoJ2F1ZGl0LW5vdGUtcGxhY2Vob2xkZXInKX1cblx0XHRcdFx0XHRcdHJvd3M9ezR9XG5cdFx0XHRcdFx0XHRzdHlsZT17e1xuXHRcdFx0XHRcdFx0XHR3aWR0aDogJzEwMCUnLFxuXHRcdFx0XHRcdFx0XHRyZXNpemU6ICd2ZXJ0aWNhbCcsXG5cdFx0XHRcdFx0XHRcdHBhZGRpbmc6ICcxMnB4IDE0cHgnLFxuXHRcdFx0XHRcdFx0XHRib3JkZXJSYWRpdXM6IDgsXG5cdFx0XHRcdFx0XHRcdGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJyxcblx0XHRcdFx0XHRcdFx0Zm9udFNpemU6IDE0LFxuXHRcdFx0XHRcdFx0XHRtYXJnaW5Ub3A6IDEyLFxuXHRcdFx0XHRcdFx0fX1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0PEJveD5cblx0XHRcdFx0XHQ8QnV0dG9uXG5cdFx0XHRcdFx0XHRzdHlsZT17e1xuXHRcdFx0XHRcdFx0XHRib3JkZXJDb2xvcjogJ3doaXRlJyxcblx0XHRcdFx0XHRcdFx0YmFja2dyb3VuZDogJyNmYWNjMTUnLFxuXHRcdFx0XHRcdFx0XHRjb2xvcjogJ2JsYWNrJyxcblx0XHRcdFx0XHRcdH19XG5cdFx0XHRcdFx0XHR2YXJpYW50PSdjb250YWluZWQnXG5cdFx0XHRcdFx0XHRjb2xvcj0ncHJpbWFyeSdcblx0XHRcdFx0XHRcdG9uQ2xpY2s9e2hhbmRsZVN1Ym1pdH1cblx0XHRcdFx0XHRcdGRpc2FibGVkPXtzYXZpbmd9XG5cdFx0XHRcdFx0PlxuXHRcdFx0XHRcdFx0e3NhdmluZyA/IHRyYW5zbGF0ZU1lc3NhZ2UoJ2F1ZGl0LW5vdGUtc2F2aW5nJykgOiB0cmFuc2xhdGVNZXNzYWdlKCdhdWRpdC1ub3RlLXN1Ym1pdCcpfVxuXHRcdFx0XHRcdDwvQnV0dG9uPlxuXHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0PEJveD5cblx0XHRcdFx0XHQ8VGV4dCBmb250U2l6ZT0nbGcnIGZvbnRXZWlnaHQ9J2JvbGQnIG1iPSdtZCc+XG5cdFx0XHRcdFx0XHR7dHJhbnNsYXRlTWVzc2FnZSgnYXVkaXQtdGltZWxpbmUnKX1cblx0XHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHRcdFx0e2xvYWRpbmcgPyAoXG5cdFx0XHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJz57dHJhbnNsYXRlTWVzc2FnZSgnYXVkaXQtbG9hZC1wcm9ncmVzcycpfTwvVGV4dD5cblx0XHRcdFx0XHQpIDogZW50cmllcy5sZW5ndGggPT09IDAgPyAoXG5cdFx0XHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJz57dHJhbnNsYXRlTWVzc2FnZSgnYXVkaXQtdGltZWxpbmUtZW1wdHknKX08L1RleHQ+XG5cdFx0XHRcdFx0KSA6IChcblx0XHRcdFx0XHRcdDxCb3ggc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywgZ2FwOiAxNiB9fT5cblx0XHRcdFx0XHRcdFx0e2VudHJpZXMubWFwKChlbnRyeSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IGFkbWluTGFiZWwgPSBlbnRyeS5hZG1pbkVtYWlsID8/IHRyYW5zbGF0ZU1lc3NhZ2UoJ2F1ZGl0LXVua25vd24tYWRtaW4nKTtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCB0aW1lc3RhbXAgPSBmb3JtYXRUaW1lc3RhbXAoZW50cnkuY3JlYXRlZEF0KTtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBmcm9tTGFiZWwgPSBlbnRyeS5mcm9tU3RhdHVzXG5cdFx0XHRcdFx0XHRcdFx0XHQ/IHRyYW5zbGF0ZUxhYmVsKGBzdGF0dXMuJHtlbnRyeS5mcm9tU3RhdHVzfWAsIHJlc291cmNlLmlkKVxuXHRcdFx0XHRcdFx0XHRcdFx0OiB0cmFuc2xhdGVNZXNzYWdlKCdzdGF0dXMtdW5rbm93bicpO1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IHRvTGFiZWwgPSBlbnRyeS50b1N0YXR1c1xuXHRcdFx0XHRcdFx0XHRcdFx0PyB0cmFuc2xhdGVMYWJlbChgc3RhdHVzLiR7ZW50cnkudG9TdGF0dXN9YCwgcmVzb3VyY2UuaWQpXG5cdFx0XHRcdFx0XHRcdFx0XHQ6IHRyYW5zbGF0ZU1lc3NhZ2UoJ3N0YXR1cy11bmtub3duJyk7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIChcblx0XHRcdFx0XHRcdFx0XHRcdDxCb3hcblx0XHRcdFx0XHRcdFx0XHRcdFx0a2V5PXtlbnRyeS5pZH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0c3R5bGU9e3tcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRib3JkZXI6ICcxcHggc29saWQgI0UyRThGMCcsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ym9yZGVyUmFkaXVzOiAxMixcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRwYWRkaW5nOiAxNixcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRiYWNrZ3JvdW5kOiAnI0Y4RkFGQycsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH19XG5cdFx0XHRcdFx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdDxCb3ggZGlzcGxheT0nZmxleCcgYWxpZ25JdGVtcz0nY2VudGVyJyBqdXN0aWZ5Q29udGVudD0nc3BhY2UtYmV0d2VlbicgbWI9J3NtJz5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGV4dCBmb250V2VpZ2h0PSc2MDAnPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0e2VudHJ5LnR5cGUgPT09ICdOT1RFJ1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ/IHRyYW5zbGF0ZU1lc3NhZ2UoJ2F1ZGl0LW5vdGUtZW50cnknKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ6IHRyYW5zbGF0ZU1lc3NhZ2UoJ2F1ZGl0LXN0YXR1cy1jaGFuZ2UnLCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRmcm9tOiBmcm9tTGFiZWwsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR0bzogdG9MYWJlbCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ICB9KX1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0PFRleHQgY29sb3I9J2dyZXk2MCcgZm9udFNpemU9J3NtJz5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHt0aW1lc3RhbXB9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0e2VudHJ5LnR5cGUgPT09ICdTVEFUVVNfQ0hBTkdFJyA/IChcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8Qm94IGRpc3BsYXk9J2ZsZXgnIGFsaWduSXRlbXM9J2NlbnRlcicgc3R5bGU9e3sgZ2FwOiA4IH19PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PEJhZGdlIG91dGxpbmU+e2Zyb21MYWJlbH08L0JhZGdlPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PEJveCBkaXNwbGF5PSdmbGV4JyBhbGlnbkl0ZW1zPSdjZW50ZXInIHN0eWxlPXt7IGNvbG9yOiAnIzcxODA5NicgfX0+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxJY29uIGljb249J0NoZXZyb25SaWdodCcgc2l6ZT17MTh9IC8+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxCYWRnZSBvdXRsaW5lPnt0b0xhYmVsfTwvQmFkZ2U+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdCkgOiBlbnRyeS5ub3RlID8gKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxUZXh0PntlbnRyeS5ub3RlfTwvVGV4dD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0KSA6IG51bGx9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnIGZvbnRTaXplPSdzbScgbXQ9J3NtJz5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR7dHJhbnNsYXRlTWVzc2FnZSgnYXVkaXQtYWRtaW4tbGFiZWwnKX06IHthZG1pbkxhYmVsfVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHRcdFx0XHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHR9KX1cblx0XHRcdFx0XHRcdDwvQm94PlxuXHRcdFx0XHRcdCl9XG5cdFx0XHRcdDwvQm94PlxuXHRcdFx0PC9Cb3g+XG5cdFx0PC9Cb3g+XG5cdCk7XG59XG4iLCJpbXBvcnQgeyB1c2VFZmZlY3QsIHVzZU1lbW8sIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQXBpQ2xpZW50LCB0eXBlIEFjdGlvblByb3BzLCBPcmlnaW5hbFNob3csIHVzZVRyYW5zbGF0aW9uIH0gZnJvbSAnYWRtaW5qcyc7XG5pbXBvcnQgeyBCYWRnZSwgQm94LCBUZXh0IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSc7XG5cbmNvbnN0IGFwaSA9IG5ldyBBcGlDbGllbnQoKTtcblxudHlwZSBQYXltZW50U3RhdHVzID0gJ1BBSUQnIHwgJ1VOUEFJRCcgfCAnQ0FOQ0VMTEVEJztcblxudHlwZSBGaW5hbmNpYWxCcmVha2Rvd25QYXlsb2FkID0ge1xuXHRzdWJ0b3RhbDogbnVtYmVyO1xuXHRkaXNjb3VudHM6IG51bWJlcjtcblx0c2hpcHBpbmc6IG51bWJlcjtcblx0dG90YWw6IG51bWJlcjtcblx0cGF5bWVudFN0YXR1czogUGF5bWVudFN0YXR1cztcblx0cGF5bWVudE1ldGhvZDogc3RyaW5nIHwgbnVsbDtcblx0c2hpcG1lbnRNZXRob2Q6IHN0cmluZyB8IG51bGw7XG59O1xuXG5jb25zdCBmb3JtYXRNb25leSA9ICh2YWx1ZTogbnVtYmVyLCBjdXJyZW5jeSA9ICdVQUgnKSA9PiB7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIG5ldyBJbnRsLk51bWJlckZvcm1hdCh1bmRlZmluZWQsIHtcblx0XHRcdHN0eWxlOiAnY3VycmVuY3knLFxuXHRcdFx0Y3VycmVuY3ksXG5cdFx0XHRtaW5pbXVtRnJhY3Rpb25EaWdpdHM6IDIsXG5cdFx0XHRtYXhpbXVtRnJhY3Rpb25EaWdpdHM6IDIsXG5cdFx0fSkuZm9ybWF0KHZhbHVlKTtcblx0fSBjYXRjaCB7XG5cdFx0cmV0dXJuIHZhbHVlLnRvRml4ZWQoMik7XG5cdH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIE9yZGVyU2hvdyhwcm9wczogQWN0aW9uUHJvcHMpIHtcblx0Y29uc3QgeyByZWNvcmQsIHJlc291cmNlIH0gPSBwcm9wcztcblx0Y29uc3QgcmVjb3JkSWQgPSByZWNvcmQ/LmlkO1xuXHRjb25zdCB7IHRyYW5zbGF0ZU1lc3NhZ2UgfSA9IHVzZVRyYW5zbGF0aW9uKCk7XG5cdGNvbnN0IFtwYXlsb2FkLCBzZXRQYXlsb2FkXSA9IHVzZVN0YXRlPEZpbmFuY2lhbEJyZWFrZG93blBheWxvYWQgfCBudWxsPihudWxsKTtcblx0Y29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuXG5cdHVzZUVmZmVjdCgoKSA9PiB7XG5cdFx0aWYgKCFyZWNvcmRJZCkgcmV0dXJuO1xuXHRcdGxldCBpc0FjdGl2ZSA9IHRydWU7XG5cdFx0c2V0TG9hZGluZyh0cnVlKTtcblx0XHRhcGkucmVjb3JkQWN0aW9uKHtcblx0XHRcdHJlc291cmNlSWQ6IHJlc291cmNlLmlkLFxuXHRcdFx0cmVjb3JkSWQsXG5cdFx0XHRhY3Rpb25OYW1lOiAnZmluYW5jaWFsQnJlYWtkb3duJyxcblx0XHRcdG1ldGhvZDogJ2dldCcsXG5cdFx0fSlcblx0XHRcdC50aGVuKChyZXNwb25zZSkgPT4ge1xuXHRcdFx0XHRpZiAoIWlzQWN0aXZlKSByZXR1cm47XG5cdFx0XHRcdHNldFBheWxvYWQoKHJlc3BvbnNlLmRhdGEucGF5bG9hZCA/PyBudWxsKSBhcyBGaW5hbmNpYWxCcmVha2Rvd25QYXlsb2FkIHwgbnVsbCk7XG5cdFx0XHR9KVxuXHRcdFx0LmZpbmFsbHkoKCkgPT4ge1xuXHRcdFx0XHRpZiAoIWlzQWN0aXZlKSByZXR1cm47XG5cdFx0XHRcdHNldExvYWRpbmcoZmFsc2UpO1xuXHRcdFx0fSk7XG5cdFx0cmV0dXJuICgpID0+IHtcblx0XHRcdGlzQWN0aXZlID0gZmFsc2U7XG5cdFx0fTtcblx0fSwgW3JlY29yZElkLCByZXNvdXJjZS5pZF0pO1xuXG5cdGNvbnN0IHN0YXR1c1ZhcmlhbnQgPSB1c2VNZW1vKCgpID0+IHtcblx0XHRzd2l0Y2ggKHBheWxvYWQ/LnBheW1lbnRTdGF0dXMpIHtcblx0XHRcdGNhc2UgJ1BBSUQnOlxuXHRcdFx0XHRyZXR1cm4geyBiYWNrZ3JvdW5kOiAnI0M2RjZENScsIGJvcmRlckNvbG9yOiAnIzM4QTE2OScsIGNvbG9yOiAnIzIyNTQzRCcgfTtcblx0XHRcdGNhc2UgJ0NBTkNFTExFRCc6XG5cdFx0XHRcdHJldHVybiB7IGJhY2tncm91bmQ6ICcjRkVEN0Q3JywgYm9yZGVyQ29sb3I6ICcjRTUzRTNFJywgY29sb3I6ICcjNzQyQTJBJyB9O1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuIHsgYmFja2dyb3VuZDogJyNGRUZDQkYnLCBib3JkZXJDb2xvcjogJyNENjlFMkUnLCBjb2xvcjogJyM3NDQyMTAnIH07XG5cdFx0fVxuXHR9LCBbcGF5bG9hZD8ucGF5bWVudFN0YXR1c10pO1xuXG5cdGNvbnN0IHBheW1lbnRTdGF0dXNMYWJlbCA9IHVzZU1lbW8oKCkgPT4ge1xuXHRcdHN3aXRjaCAocGF5bG9hZD8ucGF5bWVudFN0YXR1cykge1xuXHRcdFx0Y2FzZSAnUEFJRCc6XG5cdFx0XHRcdHJldHVybiB0cmFuc2xhdGVNZXNzYWdlKCdwYXltZW50LXN0YXR1cy1wYWlkJyk7XG5cdFx0XHRjYXNlICdDQU5DRUxMRUQnOlxuXHRcdFx0XHRyZXR1cm4gdHJhbnNsYXRlTWVzc2FnZSgncGF5bWVudC1zdGF0dXMtY2FuY2VsbGVkJyk7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gdHJhbnNsYXRlTWVzc2FnZSgncGF5bWVudC1zdGF0dXMtdW5wYWlkJyk7XG5cdFx0fVxuXHR9LCBbcGF5bG9hZD8ucGF5bWVudFN0YXR1cywgdHJhbnNsYXRlTWVzc2FnZV0pO1xuXG5cdHJldHVybiAoXG5cdFx0PEJveD5cblx0XHRcdDxCb3hcblx0XHRcdFx0dmFyaWFudD0nd2hpdGUnXG5cdFx0XHRcdHA9J3h4bCdcblx0XHRcdFx0Ym9yZGVyUmFkaXVzPSd4bCdcblx0XHRcdFx0Ym94U2hhZG93PSdzbSdcblx0XHRcdFx0bWI9J3hsJ1xuXHRcdFx0XHRjbGFzc05hbWU9J2FkbWluLWNhcmQtLWZpbmFuY2lhbCdcblx0XHRcdFx0c3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnIH19XG5cdFx0XHQ+XG5cdFx0XHRcdDxCb3ggZGlzcGxheT0nZmxleCcgYWxpZ25JdGVtcz0nY2VudGVyJyBqdXN0aWZ5Q29udGVudD0nc3BhY2UtYmV0d2VlbicgbWI9J2xnJz5cblx0XHRcdFx0XHQ8VGV4dCBmb250V2VpZ2h0PSdib2xkJz57dHJhbnNsYXRlTWVzc2FnZSgnZmluYW5jaWFsLWJyZWFrZG93bicpfTwvVGV4dD5cblx0XHRcdFx0XHQ8QmFkZ2Vcblx0XHRcdFx0XHRcdG91dGxpbmVcblx0XHRcdFx0XHRcdHN0eWxlPXt7XG5cdFx0XHRcdFx0XHRcdGJhY2tncm91bmQ6IHN0YXR1c1ZhcmlhbnQuYmFja2dyb3VuZCxcblx0XHRcdFx0XHRcdFx0Ym9yZGVyQ29sb3I6IHN0YXR1c1ZhcmlhbnQuYm9yZGVyQ29sb3IsXG5cdFx0XHRcdFx0XHRcdGNvbG9yOiBzdGF0dXNWYXJpYW50LmNvbG9yLFxuXHRcdFx0XHRcdFx0fX1cblx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHR7cGF5bWVudFN0YXR1c0xhYmVsfVxuXHRcdFx0XHRcdDwvQmFkZ2U+XG5cdFx0XHRcdDwvQm94PlxuXG5cdFx0XHRcdHtsb2FkaW5nIHx8ICFwYXlsb2FkID8gKFxuXHRcdFx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnPnt0cmFuc2xhdGVNZXNzYWdlKCdmaW5hbmNpYWwtYnJlYWtkb3duLWxvYWRpbmcnKX08L1RleHQ+XG5cdFx0XHRcdCkgOiAoXG5cdFx0XHRcdFx0PEJveFxuXHRcdFx0XHRcdFx0c3R5bGU9e3tcblx0XHRcdFx0XHRcdFx0ZGlzcGxheTogJ2dyaWQnLFxuXHRcdFx0XHRcdFx0XHRncmlkVGVtcGxhdGVDb2x1bW5zOiAncmVwZWF0KGF1dG8tZml0LCBtaW5tYXgoMjIwcHgsIDFmcikpJyxcblx0XHRcdFx0XHRcdFx0Z2FwOiAxNixcblx0XHRcdFx0XHRcdH19XG5cdFx0XHRcdFx0PlxuXHRcdFx0XHRcdFx0PEJveCBzdHlsZT17eyBwYWRkaW5nOiAxNCwgYm9yZGVyUmFkaXVzOiAxMiwgYm9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnIH19PlxuXHRcdFx0XHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJz57dHJhbnNsYXRlTWVzc2FnZSgnc3VidG90YWwnKX08L1RleHQ+XG5cdFx0XHRcdFx0XHRcdDxUZXh0IGZvbnRXZWlnaHQ9J2JvbGQnPntmb3JtYXRNb25leShwYXlsb2FkLnN1YnRvdGFsKX08L1RleHQ+XG5cdFx0XHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0XHRcdDxCb3ggc3R5bGU9e3sgcGFkZGluZzogMTQsIGJvcmRlclJhZGl1czogMTIsIGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJyB9fT5cblx0XHRcdFx0XHRcdFx0PFRleHQgY29sb3I9J2dyZXk2MCc+e3RyYW5zbGF0ZU1lc3NhZ2UoJ2Rpc2NvdW50cycpfTwvVGV4dD5cblx0XHRcdFx0XHRcdFx0PFRleHQgZm9udFdlaWdodD0nYm9sZCc+e2Zvcm1hdE1vbmV5KHBheWxvYWQuZGlzY291bnRzKX08L1RleHQ+XG5cdFx0XHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0XHRcdDxCb3ggc3R5bGU9e3sgcGFkZGluZzogMTQsIGJvcmRlclJhZGl1czogMTIsIGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJyB9fT5cblx0XHRcdFx0XHRcdFx0PFRleHQgY29sb3I9J2dyZXk2MCc+e3RyYW5zbGF0ZU1lc3NhZ2UoJ3NoaXBwaW5nJyl9PC9UZXh0PlxuXHRcdFx0XHRcdFx0XHQ8VGV4dCBmb250V2VpZ2h0PSdib2xkJz57Zm9ybWF0TW9uZXkocGF5bG9hZC5zaGlwcGluZyl9PC9UZXh0PlxuXHRcdFx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdFx0XHQ8Qm94IHN0eWxlPXt7IHBhZGRpbmc6IDE0LCBib3JkZXJSYWRpdXM6IDEyLCBib3JkZXI6ICcxcHggc29saWQgI0UyRThGMCcgfX0+XG5cdFx0XHRcdFx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnPnt0cmFuc2xhdGVNZXNzYWdlKCd0b3RhbCcpfTwvVGV4dD5cblx0XHRcdFx0XHRcdFx0PFRleHQgZm9udFdlaWdodD0nYm9sZCc+e2Zvcm1hdE1vbmV5KHBheWxvYWQudG90YWwpfTwvVGV4dD5cblx0XHRcdFx0XHRcdDwvQm94PlxuXHRcdFx0XHRcdDwvQm94PlxuXHRcdFx0XHQpfVxuXHRcdFx0PC9Cb3g+XG5cblx0XHRcdDxPcmlnaW5hbFNob3cgey4uLnByb3BzfSAvPlxuXHRcdDwvQm94PlxuXHQpO1xufVxuIiwiaW1wb3J0IHsgdXNlQ2FsbGJhY2ssIHVzZUVmZmVjdCwgdXNlUmVmLCB1c2VTdGF0ZSwgdHlwZSBDaGFuZ2VFdmVudCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEFwaUNsaWVudCwgdHlwZSBBY3Rpb25Qcm9wcywgdXNlTm90aWNlLCB1c2VUcmFuc2xhdGlvbiB9IGZyb20gJ2FkbWluanMnO1xuaW1wb3J0IHsgQm94LCBCdXR0b24sIEZvcm1Hcm91cCwgSW5wdXQsIExhYmVsLCBUZXh0IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSc7XG5cbmNvbnN0IGFwaSA9IG5ldyBBcGlDbGllbnQoKTtcblxudHlwZSBGdWxmaWxsbWVudFBheWxvYWQgPSB7XG5cdGNhcnJpZXI6IHN0cmluZyB8IG51bGw7XG5cdHRyYWNraW5nTnVtYmVyOiBzdHJpbmcgfCBudWxsO1xufTtcblxuY29uc3QgZXh0cmFjdFBheWxvYWQgPSAocGF5bG9hZDogdW5rbm93bik6IEZ1bGZpbGxtZW50UGF5bG9hZCA9PiB7XG5cdGlmICghcGF5bG9hZCB8fCB0eXBlb2YgcGF5bG9hZCAhPT0gJ29iamVjdCcpIHtcblx0XHRyZXR1cm4geyBjYXJyaWVyOiBudWxsLCB0cmFja2luZ051bWJlcjogbnVsbCB9O1xuXHR9XG5cdGNvbnN0IG1heWJlID0gcGF5bG9hZCBhcyBQYXJ0aWFsPEZ1bGZpbGxtZW50UGF5bG9hZD47XG5cdHJldHVybiB7XG5cdFx0Y2FycmllcjogdHlwZW9mIG1heWJlLmNhcnJpZXIgPT09ICdzdHJpbmcnID8gbWF5YmUuY2FycmllciA6IG51bGwsXG5cdFx0dHJhY2tpbmdOdW1iZXI6IHR5cGVvZiBtYXliZS50cmFja2luZ051bWJlciA9PT0gJ3N0cmluZycgPyBtYXliZS50cmFja2luZ051bWJlciA6IG51bGwsXG5cdH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBPcmRlckZ1bGZpbGxtZW50QWN0aW9uKHsgYWN0aW9uLCByZWNvcmQsIHJlc291cmNlIH06IEFjdGlvblByb3BzKSB7XG5cdGNvbnN0IHJlY29yZElkID0gcmVjb3JkPy5pZDtcblx0Y29uc3QgW2NhcnJpZXIsIHNldENhcnJpZXJdID0gdXNlU3RhdGUoJycpO1xuXHRjb25zdCBbdHJhY2tpbmdOdW1iZXIsIHNldFRyYWNraW5nTnVtYmVyXSA9IHVzZVN0YXRlKCcnKTtcblx0Y29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuXHRjb25zdCBbc2F2aW5nLCBzZXRTYXZpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuXHRjb25zdCBhZGROb3RpY2UgPSB1c2VOb3RpY2UoKTtcblx0Y29uc3QgYWRkTm90aWNlUmVmID0gdXNlUmVmKGFkZE5vdGljZSk7XG5cdGNvbnN0IHsgdHJhbnNsYXRlQWN0aW9uLCB0cmFuc2xhdGVNZXNzYWdlIH0gPSB1c2VUcmFuc2xhdGlvbigpO1xuXG5cdHVzZUVmZmVjdCgoKSA9PiB7XG5cdFx0YWRkTm90aWNlUmVmLmN1cnJlbnQgPSBhZGROb3RpY2U7XG5cdH0sIFthZGROb3RpY2VdKTtcblxuXHRjb25zdCBsb2FkID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuXHRcdGlmICghcmVjb3JkSWQpIHJldHVybjtcblx0XHRsZXQgaXNBY3RpdmUgPSB0cnVlO1xuXHRcdHNldExvYWRpbmcodHJ1ZSk7XG5cdFx0YXBpLnJlY29yZEFjdGlvbih7XG5cdFx0XHRyZXNvdXJjZUlkOiByZXNvdXJjZS5pZCxcblx0XHRcdHJlY29yZElkLFxuXHRcdFx0YWN0aW9uTmFtZTogYWN0aW9uLm5hbWUsXG5cdFx0XHRtZXRob2Q6ICdnZXQnLFxuXHRcdH0pXG5cdFx0XHQudGhlbigocmVzcG9uc2UpID0+IHtcblx0XHRcdFx0aWYgKCFpc0FjdGl2ZSkgcmV0dXJuO1xuXHRcdFx0XHRjb25zdCBwYXlsb2FkID0gZXh0cmFjdFBheWxvYWQocmVzcG9uc2UuZGF0YS5wYXlsb2FkKTtcblx0XHRcdFx0c2V0Q2FycmllcihwYXlsb2FkLmNhcnJpZXIgPz8gJycpO1xuXHRcdFx0XHRzZXRUcmFja2luZ051bWJlcihwYXlsb2FkLnRyYWNraW5nTnVtYmVyID8/ICcnKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goKCkgPT4ge1xuXHRcdFx0XHRpZiAoIWlzQWN0aXZlKSByZXR1cm47XG5cdFx0XHRcdGFkZE5vdGljZVJlZi5jdXJyZW50KHsgbWVzc2FnZTogJ2Z1bGZpbGxtZW50LWxvYWQtZmFpbGVkJywgdHlwZTogJ2Vycm9yJyB9KTtcblx0XHRcdH0pXG5cdFx0XHQuZmluYWxseSgoKSA9PiB7XG5cdFx0XHRcdGlmICghaXNBY3RpdmUpIHJldHVybjtcblx0XHRcdFx0c2V0TG9hZGluZyhmYWxzZSk7XG5cdFx0XHR9KTtcblx0XHRyZXR1cm4gKCkgPT4ge1xuXHRcdFx0aXNBY3RpdmUgPSBmYWxzZTtcblx0XHR9O1xuXHR9LCBbYWN0aW9uLm5hbWUsIHJlY29yZElkLCByZXNvdXJjZS5pZF0pO1xuXG5cdHVzZUVmZmVjdCgoKSA9PiB7XG5cdFx0cmV0dXJuIGxvYWQoKTtcblx0fSwgW2xvYWRdKTtcblxuXHRpZiAoIXJlY29yZElkKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxCb3ggdmFyaWFudD0nd2hpdGUnIHA9J3hsJz5cblx0XHRcdFx0PFRleHQ+e3RyYW5zbGF0ZU1lc3NhZ2UoJ2Z1bGZpbGxtZW50LWxvYWQtZmFpbGVkJyl9PC9UZXh0PlxuXHRcdFx0PC9Cb3g+XG5cdFx0KTtcblx0fVxuXG5cdGNvbnN0IHRpdGxlID0gdHJhbnNsYXRlQWN0aW9uKGFjdGlvbi5uYW1lLCByZXNvdXJjZS5pZCk7XG5cblx0Y29uc3QgaGFuZGxlU2F2ZSA9IGFzeW5jICgpID0+IHtcblx0XHRzZXRTYXZpbmcodHJ1ZSk7XG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG5cdFx0XHRmb3JtRGF0YS5hcHBlbmQoJ2NhcnJpZXInLCBjYXJyaWVyKTtcblx0XHRcdGZvcm1EYXRhLmFwcGVuZCgndHJhY2tpbmdOdW1iZXInLCB0cmFja2luZ051bWJlcik7XG5cdFx0XHRjb25zdCByZXNwb25zZSA9IGF3YWl0IGFwaS5yZWNvcmRBY3Rpb24oe1xuXHRcdFx0XHRyZXNvdXJjZUlkOiByZXNvdXJjZS5pZCxcblx0XHRcdFx0cmVjb3JkSWQsXG5cdFx0XHRcdGFjdGlvbk5hbWU6IGFjdGlvbi5uYW1lLFxuXHRcdFx0XHRtZXRob2Q6ICdwb3N0Jyxcblx0XHRcdFx0ZGF0YTogZm9ybURhdGEsXG5cdFx0XHR9KTtcblx0XHRcdGlmIChyZXNwb25zZS5kYXRhLm5vdGljZSkge1xuXHRcdFx0XHRhZGROb3RpY2UocmVzcG9uc2UuZGF0YS5ub3RpY2UpO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3QgcGF5bG9hZCA9IGV4dHJhY3RQYXlsb2FkKHJlc3BvbnNlLmRhdGEucGF5bG9hZCk7XG5cdFx0XHRzZXRDYXJyaWVyKHBheWxvYWQuY2FycmllciA/PyAnJyk7XG5cdFx0XHRzZXRUcmFja2luZ051bWJlcihwYXlsb2FkLnRyYWNraW5nTnVtYmVyID8/ICcnKTtcblx0XHR9IGNhdGNoIHtcblx0XHRcdGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdmdWxmaWxsbWVudC1zYXZlLWZhaWxlZCcsIHR5cGU6ICdlcnJvcicgfSk7XG5cdFx0fSBmaW5hbGx5IHtcblx0XHRcdHNldFNhdmluZyhmYWxzZSk7XG5cdFx0fVxuXHR9O1xuXG5cdHJldHVybiAoXG5cdFx0PEJveFxuXHRcdFx0dmFyaWFudD0nd2hpdGUnXG5cdFx0XHRwPSd4eGwnXG5cdFx0XHRib3JkZXJSYWRpdXM9J3hsJ1xuXHRcdFx0Ym94U2hhZG93PSdzbSdcblx0XHRcdG1heFdpZHRoPSc2ODBweCdcblx0XHRcdHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJyB9fVxuXHRcdD5cblx0XHRcdDxCb3ggZGlzcGxheT0nZmxleCcgYWxpZ25JdGVtcz0nY2VudGVyJyBqdXN0aWZ5Q29udGVudD0nc3BhY2UtYmV0d2VlbicgbWI9J3hsJz5cblx0XHRcdFx0PFRleHQgZm9udFNpemU9J3hsJyBmb250V2VpZ2h0PSdib2xkJz5cblx0XHRcdFx0XHR7dGl0bGV9XG5cdFx0XHRcdDwvVGV4dD5cblx0XHRcdDwvQm94PlxuXHRcdFx0e2xvYWRpbmcgPyAoXG5cdFx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnPnt0cmFuc2xhdGVNZXNzYWdlKCdmdWxmaWxsbWVudC1sb2FkLXByb2dyZXNzJyl9PC9UZXh0PlxuXHRcdFx0KSA6IChcblx0XHRcdFx0PEJveCBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBnYXA6IDE2IH19PlxuXHRcdFx0XHRcdDxGb3JtR3JvdXA+XG5cdFx0XHRcdFx0XHQ8TGFiZWw+e3RyYW5zbGF0ZU1lc3NhZ2UoJ2Z1bGZpbGxtZW50LWNhcnJpZXInKX08L0xhYmVsPlxuXHRcdFx0XHRcdFx0PElucHV0XG5cdFx0XHRcdFx0XHRcdHZhbHVlPXtjYXJyaWVyfVxuXHRcdFx0XHRcdFx0XHRvbkNoYW5nZT17KGU6IENoYW5nZUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+KSA9PiBzZXRDYXJyaWVyKGUudGFyZ2V0LnZhbHVlKX1cblx0XHRcdFx0XHRcdC8+XG5cdFx0XHRcdFx0PC9Gb3JtR3JvdXA+XG5cdFx0XHRcdFx0PEZvcm1Hcm91cD5cblx0XHRcdFx0XHRcdDxMYWJlbD57dHJhbnNsYXRlTWVzc2FnZSgnZnVsZmlsbG1lbnQtdHJhY2tpbmctbnVtYmVyJyl9PC9MYWJlbD5cblx0XHRcdFx0XHRcdDxJbnB1dFxuXHRcdFx0XHRcdFx0XHR2YWx1ZT17dHJhY2tpbmdOdW1iZXJ9XG5cdFx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsoZTogQ2hhbmdlRXZlbnQ8SFRNTElucHV0RWxlbWVudD4pID0+IHNldFRyYWNraW5nTnVtYmVyKGUudGFyZ2V0LnZhbHVlKX1cblx0XHRcdFx0XHRcdC8+XG5cdFx0XHRcdFx0PC9Gb3JtR3JvdXA+XG5cdFx0XHRcdFx0PEJveD5cblx0XHRcdFx0XHRcdDxCdXR0b25cblx0XHRcdFx0XHRcdFx0c3R5bGU9e3sgYm9yZGVyQ29sb3I6ICd3aGl0ZScsIGJhY2tncm91bmQ6ICcjZmFjYzE1JywgY29sb3I6ICdibGFjaycgfX1cblx0XHRcdFx0XHRcdFx0dmFyaWFudD0nY29udGFpbmVkJ1xuXHRcdFx0XHRcdFx0XHRjb2xvcj0ncHJpbWFyeSdcblx0XHRcdFx0XHRcdFx0b25DbGljaz17aGFuZGxlU2F2ZX1cblx0XHRcdFx0XHRcdFx0ZGlzYWJsZWQ9e3NhdmluZ31cblx0XHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdFx0e3NhdmluZyA/IHRyYW5zbGF0ZU1lc3NhZ2UoJ2Z1bGZpbGxtZW50LXNhdmUtcHJvZ3Jlc3MnKSA6IHRyYW5zbGF0ZU1lc3NhZ2UoJ2NvbmZpcm0nKX1cblx0XHRcdFx0XHRcdDwvQnV0dG9uPlxuXHRcdFx0XHRcdDwvQm94PlxuXHRcdFx0XHQ8L0JveD5cblx0XHRcdCl9XG5cdFx0PC9Cb3g+XG5cdCk7XG59XG4iLCJpbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBBcGlDbGllbnQsIHR5cGUgQWN0aW9uUHJvcHMsIHVzZU5vdGljZSwgdXNlVHJhbnNsYXRpb24gfSBmcm9tICdhZG1pbmpzJztcbmltcG9ydCB7IEJveCwgQnV0dG9uLCBJY29uLCBUYWJsZSwgVGFibGVCb2R5LCBUYWJsZUNlbGwsIFRhYmxlSGVhZCwgVGFibGVSb3csIFRleHQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcblxuY29uc3QgYXBpID0gbmV3IEFwaUNsaWVudCgpO1xuXG50eXBlIFBhY2tpbmdTbGlwSXRlbSA9IHtcblx0bmFtZTogc3RyaW5nO1xuXHRxdWFudGl0eTogbnVtYmVyO1xuXHR1bml0UHJpY2U6IG51bWJlcjtcblx0cHJpY2U6IG51bWJlcjtcbn07XG5cbnR5cGUgUGFja2luZ1NsaXBQYXlsb2FkID0ge1xuXHRvcmRlcklkOiBzdHJpbmc7XG5cdGNyZWF0ZWRBdDogc3RyaW5nO1xuXHRzdGF0dXM6IHN0cmluZztcblx0Y29udGFjdE5hbWU6IHN0cmluZyB8IG51bGw7XG5cdGNvbnRhY3RMYXN0TmFtZTogc3RyaW5nIHwgbnVsbDtcblx0Y29udGFjdEVtYWlsOiBzdHJpbmcgfCBudWxsO1xuXHRjb250YWN0UGhvbmU6IHN0cmluZyB8IG51bGw7XG5cdHBheW1lbnRNZXRob2Q6IHN0cmluZyB8IG51bGw7XG5cdHNoaXBtZW50TWV0aG9kOiBzdHJpbmcgfCBudWxsO1xuXHRjYXJyaWVyOiBzdHJpbmcgfCBudWxsO1xuXHR0cmFja2luZ051bWJlcjogc3RyaW5nIHwgbnVsbDtcblx0dG90YWw6IG51bWJlcjtcblx0aXRlbXM6IFBhY2tpbmdTbGlwSXRlbVtdO1xufTtcblxuY29uc3QgZm9ybWF0TW9uZXkgPSAodmFsdWU6IG51bWJlciwgY3VycmVuY3kgPSAnVUFIJykgPT4ge1xuXHR0cnkge1xuXHRcdHJldHVybiBuZXcgSW50bC5OdW1iZXJGb3JtYXQodW5kZWZpbmVkLCB7XG5cdFx0XHRzdHlsZTogJ2N1cnJlbmN5Jyxcblx0XHRcdGN1cnJlbmN5LFxuXHRcdFx0bWluaW11bUZyYWN0aW9uRGlnaXRzOiAyLFxuXHRcdFx0bWF4aW11bUZyYWN0aW9uRGlnaXRzOiAyLFxuXHRcdH0pLmZvcm1hdCh2YWx1ZSk7XG5cdH0gY2F0Y2gge1xuXHRcdHJldHVybiB2YWx1ZS50b0ZpeGVkKDIpO1xuXHR9XG59O1xuXG5jb25zdCBub3JtYWxpemVGdWxsTmFtZSA9IChmaXJzdDogc3RyaW5nIHwgbnVsbCwgbGFzdDogc3RyaW5nIHwgbnVsbCkgPT4ge1xuXHRjb25zdCBmaXJzdFRyaW1tZWQgPSAoZmlyc3QgPz8gJycpLnRyaW0oKTtcblx0Y29uc3QgbGFzdFRyaW1tZWQgPSAobGFzdCA/PyAnJykudHJpbSgpO1xuXHRpZiAoIWZpcnN0VHJpbW1lZCAmJiAhbGFzdFRyaW1tZWQpIHJldHVybiBudWxsO1xuXHRpZiAoIWxhc3RUcmltbWVkKSByZXR1cm4gZmlyc3RUcmltbWVkIHx8IG51bGw7XG5cdGlmICghZmlyc3RUcmltbWVkKSByZXR1cm4gbGFzdFRyaW1tZWQgfHwgbnVsbDtcblxuXHRjb25zdCBmaXJzdExvd2VyID0gZmlyc3RUcmltbWVkLnRvTG9jYWxlTG93ZXJDYXNlKCk7XG5cdGNvbnN0IGxhc3RMb3dlciA9IGxhc3RUcmltbWVkLnRvTG9jYWxlTG93ZXJDYXNlKCk7XG5cdGlmIChmaXJzdExvd2VyLmluY2x1ZGVzKGxhc3RMb3dlcikpIHtcblx0XHRyZXR1cm4gZmlyc3RUcmltbWVkO1xuXHR9XG5cdHJldHVybiBgJHtmaXJzdFRyaW1tZWR9ICR7bGFzdFRyaW1tZWR9YDtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIE9yZGVyUGFja2luZ1NsaXBBY3Rpb24oeyBhY3Rpb24sIHJlY29yZCwgcmVzb3VyY2UgfTogQWN0aW9uUHJvcHMpIHtcblx0Y29uc3QgcmVjb3JkSWQgPSByZWNvcmQ/LmlkO1xuXHRjb25zdCBbcGF5bG9hZCwgc2V0UGF5bG9hZF0gPSB1c2VTdGF0ZTxQYWNraW5nU2xpcFBheWxvYWQgfCBudWxsPihudWxsKTtcblx0Y29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuXHRjb25zdCBhZGROb3RpY2UgPSB1c2VOb3RpY2UoKTtcblx0Y29uc3QgYWRkTm90aWNlUmVmID0gdXNlUmVmKGFkZE5vdGljZSk7XG5cdGNvbnN0IHsgdHJhbnNsYXRlQWN0aW9uLCB0cmFuc2xhdGVNZXNzYWdlIH0gPSB1c2VUcmFuc2xhdGlvbigpO1xuXG5cdHVzZUVmZmVjdCgoKSA9PiB7XG5cdFx0YWRkTm90aWNlUmVmLmN1cnJlbnQgPSBhZGROb3RpY2U7XG5cdH0sIFthZGROb3RpY2VdKTtcblxuXHR1c2VFZmZlY3QoKCkgPT4ge1xuXHRcdGlmICghcmVjb3JkSWQpIHJldHVybjtcblx0XHRsZXQgaXNBY3RpdmUgPSB0cnVlO1xuXHRcdHNldExvYWRpbmcodHJ1ZSk7XG5cdFx0YXBpLnJlY29yZEFjdGlvbih7XG5cdFx0XHRyZXNvdXJjZUlkOiByZXNvdXJjZS5pZCxcblx0XHRcdHJlY29yZElkLFxuXHRcdFx0YWN0aW9uTmFtZTogYWN0aW9uLm5hbWUsXG5cdFx0XHRtZXRob2Q6ICdnZXQnLFxuXHRcdH0pXG5cdFx0XHQudGhlbigocmVzcG9uc2UpID0+IHtcblx0XHRcdFx0aWYgKCFpc0FjdGl2ZSkgcmV0dXJuO1xuXHRcdFx0XHRzZXRQYXlsb2FkKChyZXNwb25zZS5kYXRhLnBheWxvYWQgPz8gbnVsbCkgYXMgUGFja2luZ1NsaXBQYXlsb2FkIHwgbnVsbCk7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKCgpID0+IHtcblx0XHRcdFx0aWYgKCFpc0FjdGl2ZSkgcmV0dXJuO1xuXHRcdFx0XHRhZGROb3RpY2VSZWYuY3VycmVudCh7IG1lc3NhZ2U6ICdwYWNraW5nLXNsaXAtbG9hZC1mYWlsZWQnLCB0eXBlOiAnZXJyb3InIH0pO1xuXHRcdFx0fSlcblx0XHRcdC5maW5hbGx5KCgpID0+IHtcblx0XHRcdFx0aWYgKCFpc0FjdGl2ZSkgcmV0dXJuO1xuXHRcdFx0XHRzZXRMb2FkaW5nKGZhbHNlKTtcblx0XHRcdH0pO1xuXHRcdHJldHVybiAoKSA9PiB7XG5cdFx0XHRpc0FjdGl2ZSA9IGZhbHNlO1xuXHRcdH07XG5cdH0sIFthY3Rpb24ubmFtZSwgcmVjb3JkSWQsIHJlc291cmNlLmlkXSk7XG5cblx0Y29uc3QgdGl0bGUgPSB0cmFuc2xhdGVBY3Rpb24oYWN0aW9uLm5hbWUsIHJlc291cmNlLmlkKTtcblx0Y29uc3QgY3VzdG9tZXIgPSBwYXlsb2FkID8gbm9ybWFsaXplRnVsbE5hbWUocGF5bG9hZC5jb250YWN0TmFtZSwgcGF5bG9hZC5jb250YWN0TGFzdE5hbWUpIDogbnVsbDtcblxuXHRyZXR1cm4gKFxuXHRcdDxCb3hcblx0XHRcdHZhcmlhbnQ9J3doaXRlJ1xuXHRcdFx0cD0neHhsJ1xuXHRcdFx0Ym9yZGVyUmFkaXVzPSd4bCdcblx0XHRcdGJveFNoYWRvdz0nc20nXG5cdFx0XHRtYXhXaWR0aD0nOTIwcHgnXG5cdFx0XHRzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQgI0UyRThGMCcgfX1cblx0XHQ+XG5cdFx0XHQ8Qm94IGRpc3BsYXk9J2ZsZXgnIGFsaWduSXRlbXM9J2NlbnRlcicganVzdGlmeUNvbnRlbnQ9J3NwYWNlLWJldHdlZW4nIG1iPSd4bCc+XG5cdFx0XHRcdDxUZXh0IGZvbnRTaXplPSd4bCcgZm9udFdlaWdodD0nYm9sZCc+XG5cdFx0XHRcdFx0e3RpdGxlfVxuXHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHRcdDxCdXR0b25cblx0XHRcdFx0XHR2YXJpYW50PSdjb250YWluZWQnXG5cdFx0XHRcdFx0Y29sb3I9J3ByaW1hcnknXG5cdFx0XHRcdFx0b25DbGljaz17KCkgPT4gd2luZG93LnByaW50KCl9XG5cdFx0XHRcdFx0c3R5bGU9e3sgYm9yZGVyQ29sb3I6ICd3aGl0ZScsIGJhY2tncm91bmQ6ICcjZmFjYzE1JywgY29sb3I6ICdibGFjaycgfX1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdDxJY29uIGljb249J1ByaW50ZXInIC8+XG5cdFx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoJ3BhY2tpbmctc2xpcC1wcmludCcpfVxuXHRcdFx0XHQ8L0J1dHRvbj5cblx0XHRcdDwvQm94PlxuXG5cdFx0XHR7bG9hZGluZyB8fCAhcGF5bG9hZCA/IChcblx0XHRcdFx0PFRleHQgY29sb3I9J2dyZXk2MCc+XG5cdFx0XHRcdFx0e2xvYWRpbmcgPyB0cmFuc2xhdGVNZXNzYWdlKCdwYWNraW5nLXNsaXAtbG9hZGluZycpIDogdHJhbnNsYXRlTWVzc2FnZSgncGFja2luZy1zbGlwLWxvYWQtZmFpbGVkJyl9XG5cdFx0XHRcdDwvVGV4dD5cblx0XHRcdCkgOiAoXG5cdFx0XHRcdDxCb3ggc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywgZ2FwOiAxNiB9fT5cblx0XHRcdFx0XHQ8Qm94IHN0eWxlPXt7IGRpc3BsYXk6ICdncmlkJywgZ3JpZFRlbXBsYXRlQ29sdW1uczogJ3JlcGVhdChhdXRvLWZpdCwgbWlubWF4KDIyMHB4LCAxZnIpKScsIGdhcDogMTIgfX0+XG5cdFx0XHRcdFx0XHQ8Qm94IHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJywgYm9yZGVyUmFkaXVzOiAxMiwgcGFkZGluZzogMTQgfX0+XG5cdFx0XHRcdFx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnIGZvbnRTaXplPSdzbSc+XG5cdFx0XHRcdFx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoJ3BhY2tpbmctc2xpcC1vcmRlcicpfVxuXHRcdFx0XHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHRcdFx0XHRcdDxUZXh0IGZvbnRXZWlnaHQ9J2JvbGQnPntwYXlsb2FkLm9yZGVySWR9PC9UZXh0PlxuXHRcdFx0XHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJyBmb250U2l6ZT0nc20nPlxuXHRcdFx0XHRcdFx0XHRcdHtuZXcgRGF0ZShwYXlsb2FkLmNyZWF0ZWRBdCkudG9Mb2NhbGVTdHJpbmcoKX1cblx0XHRcdFx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdFx0XHQ8Qm94IHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJywgYm9yZGVyUmFkaXVzOiAxMiwgcGFkZGluZzogMTQgfX0+XG5cdFx0XHRcdFx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnIGZvbnRTaXplPSdzbSc+XG5cdFx0XHRcdFx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoJ3BhY2tpbmctc2xpcC1jdXN0b21lcicpfVxuXHRcdFx0XHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHRcdFx0XHRcdDxUZXh0IGZvbnRXZWlnaHQ9J2JvbGQnPntjdXN0b21lciA/PyAnLSd9PC9UZXh0PlxuXHRcdFx0XHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJyBmb250U2l6ZT0nc20nPlxuXHRcdFx0XHRcdFx0XHRcdHtwYXlsb2FkLmNvbnRhY3RQaG9uZSA/PyBwYXlsb2FkLmNvbnRhY3RFbWFpbCA/PyAnLSd9XG5cdFx0XHRcdFx0XHRcdDwvVGV4dD5cblx0XHRcdFx0XHRcdDwvQm94PlxuXHRcdFx0XHRcdFx0PEJveCBzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQgI0UyRThGMCcsIGJvcmRlclJhZGl1czogMTIsIHBhZGRpbmc6IDE0IH19PlxuXHRcdFx0XHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJyBmb250U2l6ZT0nc20nPlxuXHRcdFx0XHRcdFx0XHRcdHt0cmFuc2xhdGVNZXNzYWdlKCdwYWNraW5nLXNsaXAtZnVsZmlsbG1lbnQnKX1cblx0XHRcdFx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0XHRcdFx0XHQ8VGV4dCBmb250V2VpZ2h0PSdib2xkJz5cblx0XHRcdFx0XHRcdFx0XHR7cGF5bG9hZC5jYXJyaWVyID8/ICctJ31cblx0XHRcdFx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0XHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJyBmb250U2l6ZT0nc20nPlxuXHRcdFx0XHRcdFx0XHRcdHtwYXlsb2FkLnRyYWNraW5nTnVtYmVyID8/ICctJ31cblx0XHRcdFx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdFx0PC9Cb3g+XG5cblx0XHRcdFx0XHQ8VGFibGU+XG5cdFx0XHRcdFx0XHQ8VGFibGVIZWFkPlxuXHRcdFx0XHRcdFx0XHQ8VGFibGVSb3c+XG5cdFx0XHRcdFx0XHRcdFx0PFRhYmxlQ2VsbD57dHJhbnNsYXRlTWVzc2FnZSgncGFja2luZy1zbGlwLWl0ZW0nKX08L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHQ8VGFibGVDZWxsPnt0cmFuc2xhdGVNZXNzYWdlKCdwYWNraW5nLXNsaXAtcXR5Jyl9PC9UYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHRcdFx0PFRhYmxlQ2VsbD57dHJhbnNsYXRlTWVzc2FnZSgncGFja2luZy1zbGlwLXVuaXQnKX08L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHQ8VGFibGVDZWxsPnt0cmFuc2xhdGVNZXNzYWdlKCdwYWNraW5nLXNsaXAtbGluZScpfTwvVGFibGVDZWxsPlxuXHRcdFx0XHRcdFx0XHQ8L1RhYmxlUm93PlxuXHRcdFx0XHRcdFx0PC9UYWJsZUhlYWQ+XG5cdFx0XHRcdFx0XHQ8VGFibGVCb2R5PlxuXHRcdFx0XHRcdFx0XHR7cGF5bG9hZC5pdGVtcy5tYXAoKGl0ZW0sIGluZGV4KSA9PiAoXG5cdFx0XHRcdFx0XHRcdFx0PFRhYmxlUm93IGtleT17YCR7aXRlbS5uYW1lfS0ke2luZGV4fWB9PlxuXHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlQ2VsbD57aXRlbS5uYW1lfTwvVGFibGVDZWxsPlxuXHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlQ2VsbD57aXRlbS5xdWFudGl0eX08L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZUNlbGw+e2Zvcm1hdE1vbmV5KGl0ZW0udW5pdFByaWNlKX08L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZUNlbGw+e2Zvcm1hdE1vbmV5KGl0ZW0ucHJpY2UpfTwvVGFibGVDZWxsPlxuXHRcdFx0XHRcdFx0XHRcdDwvVGFibGVSb3c+XG5cdFx0XHRcdFx0XHRcdCkpfVxuXHRcdFx0XHRcdFx0PC9UYWJsZUJvZHk+XG5cdFx0XHRcdFx0PC9UYWJsZT5cblxuXHRcdFx0XHRcdDxCb3ggZGlzcGxheT0nZmxleCcganVzdGlmeUNvbnRlbnQ9J2ZsZXgtZW5kJz5cblx0XHRcdFx0XHRcdDxCb3ggc3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnLCBib3JkZXJSYWRpdXM6IDEyLCBwYWRkaW5nOiAxNCwgbWluV2lkdGg6IDI2MCB9fT5cblx0XHRcdFx0XHRcdFx0PFRleHQgY29sb3I9J2dyZXk2MCcgZm9udFNpemU9J3NtJz5cblx0XHRcdFx0XHRcdFx0XHR7dHJhbnNsYXRlTWVzc2FnZSgndG90YWwnKX1cblx0XHRcdFx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0XHRcdFx0XHQ8VGV4dCBmb250U2l6ZT0neGwnIGZvbnRXZWlnaHQ9J2JvbGQnPlxuXHRcdFx0XHRcdFx0XHRcdHtmb3JtYXRNb25leShwYXlsb2FkLnRvdGFsKX1cblx0XHRcdFx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdDwvQm94PlxuXHRcdFx0KX1cblx0XHQ8L0JveD5cblx0KTtcbn1cbiIsImltcG9ydCB0eXBlIHsgU2hvd1Byb3BlcnR5UHJvcHMgfSBmcm9tICdhZG1pbmpzJztcblxuY29uc3QgZm9ybWF0TW9uZXkgPSAodmFsdWU6IG51bWJlciwgY3VycmVuY3kgPSAnVUFIJykgPT4ge1xuXHR0cnkge1xuXHRcdHJldHVybiBuZXcgSW50bC5OdW1iZXJGb3JtYXQodW5kZWZpbmVkLCB7XG5cdFx0XHRzdHlsZTogJ2N1cnJlbmN5Jyxcblx0XHRcdGN1cnJlbmN5LFxuXHRcdFx0bWluaW11bUZyYWN0aW9uRGlnaXRzOiAyLFxuXHRcdFx0bWF4aW11bUZyYWN0aW9uRGlnaXRzOiAyLFxuXHRcdH0pLmZvcm1hdCh2YWx1ZSk7XG5cdH0gY2F0Y2gge1xuXHRcdHJldHVybiB2YWx1ZS50b0ZpeGVkKDIpO1xuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBPcmRlclRvdGFsTGlzdChwcm9wczogU2hvd1Byb3BlcnR5UHJvcHMpIHtcblx0Y29uc3QgeyByZWNvcmQsIHByb3BlcnR5IH0gPSBwcm9wcztcblx0Y29uc3QgcmF3ID0gcmVjb3JkLnBhcmFtc1twcm9wZXJ0eS5wYXRoXTtcblx0Y29uc3QgbnVtZXJpYyA9IE51bWJlcihyYXcgPz8gMCk7XG5cdGlmICghTnVtYmVyLmlzRmluaXRlKG51bWVyaWMpKSB7XG5cdFx0cmV0dXJuIFN0cmluZyhyYXcgPz8gJycpO1xuXHR9XG5cdHJldHVybiBmb3JtYXRNb25leShudW1lcmljKTtcbn1cbiIsImltcG9ydCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUsIHR5cGUgQ2hhbmdlRXZlbnQgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgdHlwZSB7IEVkaXRQcm9wZXJ0eVByb3BzIH0gZnJvbSAnYWRtaW5qcyc7XG5pbXBvcnQgeyBGb3JtR3JvdXAsIElucHV0LCBMYWJlbCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xuaW1wb3J0IHsgdXNlVHJhbnNsYXRpb24gfSBmcm9tICdhZG1pbmpzJztcblxuY29uc3QgcGFyc2VOdW1iZXIgPSAodmFsdWU6IHN0cmluZyk6IG51bWJlciB8IG51bGwgPT4ge1xuXHRjb25zdCBub3JtYWxpemVkID0gdmFsdWUudHJpbSgpO1xuXHRpZiAoIW5vcm1hbGl6ZWQpIHJldHVybiBudWxsO1xuXHRjb25zdCBudW1lcmljID0gTnVtYmVyKG5vcm1hbGl6ZWQpO1xuXHRyZXR1cm4gTnVtYmVyLmlzRmluaXRlKG51bWVyaWMpID8gbnVtZXJpYyA6IG51bGw7XG59O1xuXG5jb25zdCBidWlsZEZpbHRlckpzb24gPSAobWluOiBzdHJpbmcsIG1heDogc3RyaW5nKTogc3RyaW5nID0+IHtcblx0Y29uc3QgbWluVmFsdWUgPSBwYXJzZU51bWJlcihtaW4pO1xuXHRjb25zdCBtYXhWYWx1ZSA9IHBhcnNlTnVtYmVyKG1heCk7XG5cdGlmIChtaW5WYWx1ZSA9PT0gbnVsbCAmJiBtYXhWYWx1ZSA9PT0gbnVsbCkgcmV0dXJuICcnO1xuXHRpZiAobWluVmFsdWUgIT09IG51bGwgJiYgbWF4VmFsdWUgIT09IG51bGwpIHJldHVybiBKU09OLnN0cmluZ2lmeSh7IGd0ZTogbWluVmFsdWUsIGx0ZTogbWF4VmFsdWUgfSk7XG5cdGlmIChtaW5WYWx1ZSAhPT0gbnVsbCkgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHsgZ3RlOiBtaW5WYWx1ZSB9KTtcblx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KHsgbHRlOiBtYXhWYWx1ZSB9KTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIE9yZGVyVG90YWxSYW5nZUZpbHRlcihwcm9wczogRWRpdFByb3BlcnR5UHJvcHMpIHtcblx0Y29uc3QgeyBvbkNoYW5nZSwgcHJvcGVydHksIGZpbHRlciB9ID0gcHJvcHM7XG5cdGNvbnN0IHsgdHJhbnNsYXRlUHJvcGVydHkgfSA9IHVzZVRyYW5zbGF0aW9uKCk7XG5cdGNvbnN0IGZpbHRlclZhbHVlID0gZmlsdGVyW3Byb3BlcnR5LnBhdGhdIGFzIHN0cmluZyB8IHVuZGVmaW5lZDtcblxuXHRjb25zdCBbbWluLCBzZXRNaW5dID0gdXNlU3RhdGUoJycpO1xuXHRjb25zdCBbbWF4LCBzZXRNYXhdID0gdXNlU3RhdGUoJycpO1xuXG5cdHVzZUVmZmVjdCgoKSA9PiB7XG5cdFx0aWYgKCFmaWx0ZXJWYWx1ZSkge1xuXHRcdFx0c2V0TWluKCcnKTtcblx0XHRcdHNldE1heCgnJyk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKGZpbHRlclZhbHVlKSBhcyB1bmtub3duO1xuXHRcdFx0aWYgKHBhcnNlZCAmJiB0eXBlb2YgcGFyc2VkID09PSAnb2JqZWN0Jykge1xuXHRcdFx0XHRjb25zdCBvYmogPSBwYXJzZWQgYXMgeyBndGU/OiB1bmtub3duOyBsdGU/OiB1bmtub3duIH07XG5cdFx0XHRcdHNldE1pbih0eXBlb2Ygb2JqLmd0ZSA9PT0gJ251bWJlcicgPyBTdHJpbmcob2JqLmd0ZSkgOiAnJyk7XG5cdFx0XHRcdHNldE1heCh0eXBlb2Ygb2JqLmx0ZSA9PT0gJ251bWJlcicgPyBTdHJpbmcob2JqLmx0ZSkgOiAnJyk7XG5cdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiBwYXJzZWQgPT09ICdudW1iZXInKSB7XG5cdFx0XHRcdHNldE1pbihTdHJpbmcocGFyc2VkKSk7XG5cdFx0XHRcdHNldE1heCgnJyk7XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCB7XG5cdFx0XHQvLyBpZ25vcmVcblx0XHR9XG5cdH0sIFtmaWx0ZXJWYWx1ZV0pO1xuXG5cdHJldHVybiAoXG5cdFx0PEZvcm1Hcm91cCB2YXJpYW50PSdmaWx0ZXInPlxuXHRcdFx0PExhYmVsPnt0cmFuc2xhdGVQcm9wZXJ0eShwcm9wZXJ0eS5sYWJlbCwgcHJvcGVydHkucmVzb3VyY2VJZCl9PC9MYWJlbD5cblx0XHRcdDxJbnB1dFxuXHRcdFx0XHRuYW1lPXtgZmlsdGVyLSR7cHJvcGVydHkucGF0aH0tbWluYH1cblx0XHRcdFx0dHlwZT0nbnVtYmVyJ1xuXHRcdFx0XHRpbnB1dE1vZGU9J2RlY2ltYWwnXG5cdFx0XHRcdHBsYWNlaG9sZGVyPXt0cmFuc2xhdGVQcm9wZXJ0eSgnZnJvbScpfVxuXHRcdFx0XHR2YWx1ZT17bWlufVxuXHRcdFx0XHRvbkNoYW5nZT17KGU6IENoYW5nZUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+KSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgbmV4dCA9IGUudGFyZ2V0LnZhbHVlO1xuXHRcdFx0XHRcdHNldE1pbihuZXh0KTtcblx0XHRcdFx0XHRvbkNoYW5nZShwcm9wZXJ0eS5wYXRoLCBidWlsZEZpbHRlckpzb24obmV4dCwgbWF4KSk7XG5cdFx0XHRcdH19XG5cdFx0XHQvPlxuXHRcdFx0PElucHV0XG5cdFx0XHRcdG5hbWU9e2BmaWx0ZXItJHtwcm9wZXJ0eS5wYXRofS1tYXhgfVxuXHRcdFx0XHR0eXBlPSdudW1iZXInXG5cdFx0XHRcdGlucHV0TW9kZT0nZGVjaW1hbCdcblx0XHRcdFx0cGxhY2Vob2xkZXI9e3RyYW5zbGF0ZVByb3BlcnR5KCd0bycpfVxuXHRcdFx0XHR2YWx1ZT17bWF4fVxuXHRcdFx0XHRtdD0nZGVmYXVsdCdcblx0XHRcdFx0b25DaGFuZ2U9eyhlOiBDaGFuZ2VFdmVudDxIVE1MSW5wdXRFbGVtZW50PikgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IG5leHQgPSBlLnRhcmdldC52YWx1ZTtcblx0XHRcdFx0XHRzZXRNYXgobmV4dCk7XG5cdFx0XHRcdFx0b25DaGFuZ2UocHJvcGVydHkucGF0aCwgYnVpbGRGaWx0ZXJKc29uKG1pbiwgbmV4dCkpO1xuXHRcdFx0XHR9fVxuXHRcdFx0Lz5cblx0XHQ8L0Zvcm1Hcm91cD5cblx0KTtcbn1cbiIsImltcG9ydCB0eXBlIHsgRmlsdGVyUHJvcGVydHlQcm9wcyB9IGZyb20gJ2FkbWluanMnO1xuaW1wb3J0IHsgdXNlVHJhbnNsYXRpb24gfSBmcm9tICdhZG1pbmpzJztcbmltcG9ydCB7IEZvcm1Hcm91cCwgTGFiZWwsIFNlbGVjdCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xuXG50eXBlIFNlbGVjdE9wdGlvbiA9IHsgdmFsdWU6IHN0cmluZyB8IG51bWJlcjsgbGFiZWw6IHN0cmluZyB9O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBTZWxlY3RGaWx0ZXJXaXRoUGxhY2Vob2xkZXIocHJvcHM6IEZpbHRlclByb3BlcnR5UHJvcHMpIHtcblx0Y29uc3QgeyBwcm9wZXJ0eSwgZmlsdGVyLCBvbkNoYW5nZSB9ID0gcHJvcHM7XG5cdGNvbnN0IHsgdGwsIHRyYW5zbGF0ZU1lc3NhZ2UsIHRyYW5zbGF0ZVByb3BlcnR5IH0gPSB1c2VUcmFuc2xhdGlvbigpO1xuXG5cdGNvbnN0IGF2YWlsYWJsZVZhbHVlcyA9IHByb3BlcnR5LmF2YWlsYWJsZVZhbHVlcyA/PyBbXTtcblx0Y29uc3Qgb3B0aW9uczogU2VsZWN0T3B0aW9uW10gPSBhdmFpbGFibGVWYWx1ZXMubWFwKChvcHRpb24pID0+ICh7XG5cdFx0dmFsdWU6IG9wdGlvbi52YWx1ZSxcblx0XHRsYWJlbDogdGwoYCR7cHJvcGVydHkucGF0aH0uJHtvcHRpb24udmFsdWV9YCwgcHJvcGVydHkucmVzb3VyY2VJZCwge1xuXHRcdFx0ZGVmYXVsdFZhbHVlOiBvcHRpb24ubGFiZWwgPz8gU3RyaW5nKG9wdGlvbi52YWx1ZSksXG5cdFx0fSksXG5cdH0pKTtcblxuXHRjb25zdCBjdXJyZW50VmFsdWUgPSBmaWx0ZXJbcHJvcGVydHkucGF0aF0gPz8gJyc7XG5cdGNvbnN0IHNlbGVjdGVkID1cblx0XHRvcHRpb25zLmZpbmQoKG9wdGlvbikgPT4gU3RyaW5nKG9wdGlvbi52YWx1ZSkgPT09IFN0cmluZyhjdXJyZW50VmFsdWUpKSA/PyBudWxsO1xuXG5cdHJldHVybiAoXG5cdFx0PEZvcm1Hcm91cCB2YXJpYW50PSdmaWx0ZXInPlxuXHRcdFx0PExhYmVsPnt0cmFuc2xhdGVQcm9wZXJ0eShwcm9wZXJ0eS5sYWJlbCwgcHJvcGVydHkucmVzb3VyY2VJZCl9PC9MYWJlbD5cblx0XHRcdDxTZWxlY3Rcblx0XHRcdFx0dmFyaWFudD0nZmlsdGVyJ1xuXHRcdFx0XHRpc0NsZWFyYWJsZVxuXHRcdFx0XHRwbGFjZWhvbGRlcj17dHJhbnNsYXRlTWVzc2FnZSgnc2VsZWN0LXBsYWNlaG9sZGVyJywgeyBkZWZhdWx0VmFsdWU6ICdTZWxlY3QuLi4nIH0pfVxuXHRcdFx0XHRvcHRpb25zPXtvcHRpb25zfVxuXHRcdFx0XHR2YWx1ZT17c2VsZWN0ZWR9XG5cdFx0XHRcdG9uQ2hhbmdlPXsob3B0aW9uOiBTZWxlY3RPcHRpb24gfCBudWxsKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgdmFsdWUgPSBvcHRpb24gPyBvcHRpb24udmFsdWUgOiAnJztcblx0XHRcdFx0XHRvbkNoYW5nZShwcm9wZXJ0eS5wYXRoLCB2YWx1ZSk7XG5cdFx0XHRcdH19XG5cdFx0XHQvPlxuXHRcdDwvRm9ybUdyb3VwPlxuXHQpO1xufVxuIiwiaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VNZW1vLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEFwaUNsaWVudCwgdHlwZSBBY3Rpb25Qcm9wcywgT3JpZ2luYWxTaG93LCB1c2VOb3RpY2UsIHVzZVRyYW5zbGF0aW9uIH0gZnJvbSAnYWRtaW5qcyc7XG5pbXBvcnQge1xuXHRCYWRnZSxcblx0Qm94LFxuXHRCdXR0b24sXG5cdEZvcm1Hcm91cCxcblx0TGFiZWwsXG5cdFNlbGVjdCxcblx0VGFibGUsXG5cdFRhYmxlQm9keSxcblx0VGFibGVDZWxsLFxuXHRUYWJsZUhlYWQsXG5cdFRhYmxlUm93LFxuXHRUZXh0LFxufSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcblxuY29uc3QgYXBpID0gbmV3IEFwaUNsaWVudCgpO1xuXG50eXBlIFVzZXJLcGlzUGF5bG9hZCA9IHtcblx0dG90YWxPcmRlcnM6IG51bWJlcjtcblx0bGlmZXRpbWVWYWx1ZTogbnVtYmVyO1xuXHRhdmVyYWdlT3JkZXJWYWx1ZTogbnVtYmVyO1xuXHRsYXN0T3JkZXJEYXRlOiBzdHJpbmcgfCBudWxsO1xufTtcblxudHlwZSBVc2VyQWRtaW5TdGF0dXMgPSAnQUNUSVZFJyB8ICdTVVNQRU5ERUQnIHwgJ0JMT0NLRUQnO1xudHlwZSBTdGF0dXNPcHRpb24gPSB7IHZhbHVlOiBVc2VyQWRtaW5TdGF0dXM7IGxhYmVsOiBzdHJpbmcgfTtcblxudHlwZSBVc2VyUmVsYXRlZFBheWxvYWQgPSB7XG5cdG9yZGVyczogeyBpZDogc3RyaW5nOyBzdGF0dXM6IHN0cmluZzsgdG90YWw6IG51bWJlcjsgY3JlYXRlZEF0OiBzdHJpbmcgfVtdO1xuXHRyZXZpZXdzOiB7XG5cdFx0aWQ6IHN0cmluZztcblx0XHRyYXRpbmc6IG51bWJlcjtcblx0XHRjb21tZW50OiBzdHJpbmc7XG5cdFx0Y3JlYXRlZEF0OiBzdHJpbmc7XG5cdFx0cHJvZHVjdElkOiBzdHJpbmc7XG5cdFx0cHJvZHVjdE5hbWU6IHN0cmluZztcblx0fVtdO1xuXHR3aXNobGlzdDogeyBwcm9kdWN0SWQ6IHN0cmluZzsgcHJvZHVjdE5hbWU6IHN0cmluZzsgY3JlYXRlZEF0OiBzdHJpbmcgfVtdO1xuXHRyZWNlbnRseVZpZXdlZDogeyBwcm9kdWN0SWQ6IHN0cmluZzsgcHJvZHVjdE5hbWU6IHN0cmluZzsgY3JlYXRlZEF0OiBzdHJpbmcgfVtdO1xufTtcblxuY29uc3QgZm9ybWF0TW9uZXkgPSAodmFsdWU6IG51bWJlciwgY3VycmVuY3kgPSAnVUFIJykgPT4ge1xuXHR0cnkge1xuXHRcdHJldHVybiBuZXcgSW50bC5OdW1iZXJGb3JtYXQodW5kZWZpbmVkLCB7XG5cdFx0XHRzdHlsZTogJ2N1cnJlbmN5Jyxcblx0XHRcdGN1cnJlbmN5LFxuXHRcdFx0bWluaW11bUZyYWN0aW9uRGlnaXRzOiAyLFxuXHRcdFx0bWF4aW11bUZyYWN0aW9uRGlnaXRzOiAyLFxuXHRcdH0pLmZvcm1hdCh2YWx1ZSk7XG5cdH0gY2F0Y2gge1xuXHRcdHJldHVybiB2YWx1ZS50b0ZpeGVkKDIpO1xuXHR9XG59O1xuXG5jb25zdCBmb3JtYXREYXRlID0gKHZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiB7XG5cdGlmICghdmFsdWUpIHJldHVybiAnLSc7XG5cdGNvbnN0IHBhcnNlZCA9IERhdGUucGFyc2UodmFsdWUpO1xuXHRyZXR1cm4gTnVtYmVyLmlzTmFOKHBhcnNlZCkgPyB2YWx1ZSA6IG5ldyBEYXRlKHBhcnNlZCkudG9Mb2NhbGVTdHJpbmcoKTtcbn07XG5cbmNvbnN0IGdldFJvb3RQYXRoID0gKCkgPT4ge1xuXHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybiAnJztcblx0Y29uc3QgcGF0aCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSA/PyAnJztcblx0Y29uc3QgcGFydHMgPSBwYXRoLnNwbGl0KCcvcmVzb3VyY2VzJyk7XG5cdHJldHVybiBwYXJ0c1swXSA/PyAnJztcbn07XG5cbmNvbnN0IGJ1aWxkUmVjb3JkU2hvd0hyZWYgPSAocmVzb3VyY2VJZDogc3RyaW5nLCByZWNvcmRJZDogc3RyaW5nKSA9PlxuXHRgJHtnZXRSb290UGF0aCgpfS9yZXNvdXJjZXMvJHtyZXNvdXJjZUlkfS9yZWNvcmRzLyR7cmVjb3JkSWR9L3Nob3dgO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBVc2VyU2hvdyhwcm9wczogQWN0aW9uUHJvcHMpIHtcblx0Y29uc3QgeyByZWNvcmQsIHJlc291cmNlIH0gPSBwcm9wcztcblx0Y29uc3QgcmVjb3JkSWQgPSByZWNvcmQ/LmlkO1xuXHRjb25zdCB7IHRyYW5zbGF0ZU1lc3NhZ2UgfSA9IHVzZVRyYW5zbGF0aW9uKCk7XG5cdGNvbnN0IGFkZE5vdGljZSA9IHVzZU5vdGljZSgpO1xuXHRjb25zdCBbcGF5bG9hZCwgc2V0UGF5bG9hZF0gPSB1c2VTdGF0ZTxVc2VyS3Bpc1BheWxvYWQgfCBudWxsPihudWxsKTtcblx0Y29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuXHRjb25zdCBbcmVsYXRlZCwgc2V0UmVsYXRlZF0gPSB1c2VTdGF0ZTxVc2VyUmVsYXRlZFBheWxvYWQgfCBudWxsPihudWxsKTtcblx0Y29uc3QgW3JlbGF0ZWRMb2FkaW5nLCBzZXRSZWxhdGVkTG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG5cdGNvbnN0IFtsb2NhbFJlY29yZCwgc2V0TG9jYWxSZWNvcmRdID0gdXNlU3RhdGUocmVjb3JkKTtcblx0Y29uc3QgW2FkbWluU3RhdHVzLCBzZXRBZG1pblN0YXR1c10gPSB1c2VTdGF0ZTxVc2VyQWRtaW5TdGF0dXM+KCdBQ1RJVkUnKTtcblx0Y29uc3QgW2FkbWluTm90ZXMsIHNldEFkbWluTm90ZXNdID0gdXNlU3RhdGUoJycpO1xuXHRjb25zdCBbc2F2aW5nTWV0YSwgc2V0U2F2aW5nTWV0YV0gPSB1c2VTdGF0ZShmYWxzZSk7XG5cblx0dXNlRWZmZWN0KCgpID0+IHtcblx0XHRzZXRMb2NhbFJlY29yZChyZWNvcmQpO1xuXHRcdGNvbnN0IG5leHRTdGF0dXMgPSAocmVjb3JkPy5wYXJhbXM/LmFkbWluU3RhdHVzIGFzIFVzZXJBZG1pblN0YXR1cyB8IHVuZGVmaW5lZCkgPz8gJ0FDVElWRSc7XG5cdFx0Y29uc3QgbmV4dE5vdGVzID0gKHJlY29yZD8ucGFyYW1zPy5hZG1pbk5vdGVzIGFzIHN0cmluZyB8IHVuZGVmaW5lZCkgPz8gJyc7XG5cdFx0c2V0QWRtaW5TdGF0dXMobmV4dFN0YXR1cyk7XG5cdFx0c2V0QWRtaW5Ob3RlcyhuZXh0Tm90ZXMpO1xuXHR9LCBbcmVjb3JkPy5pZF0pO1xuXG5cdHVzZUVmZmVjdCgoKSA9PiB7XG5cdFx0aWYgKCFyZWNvcmRJZCkgcmV0dXJuO1xuXHRcdGxldCBpc0FjdGl2ZSA9IHRydWU7XG5cdFx0c2V0TG9hZGluZyh0cnVlKTtcblx0XHRhcGkucmVjb3JkQWN0aW9uKHtcblx0XHRcdHJlc291cmNlSWQ6IHJlc291cmNlLmlkLFxuXHRcdFx0cmVjb3JkSWQsXG5cdFx0XHRhY3Rpb25OYW1lOiAndXNlcktwaXMnLFxuXHRcdFx0bWV0aG9kOiAnZ2V0Jyxcblx0XHR9KVxuXHRcdFx0LnRoZW4oKHJlc3BvbnNlKSA9PiB7XG5cdFx0XHRcdGlmICghaXNBY3RpdmUpIHJldHVybjtcblx0XHRcdFx0c2V0UGF5bG9hZCgocmVzcG9uc2UuZGF0YS5wYXlsb2FkID8/IG51bGwpIGFzIFVzZXJLcGlzUGF5bG9hZCB8IG51bGwpO1xuXHRcdFx0fSlcblx0XHRcdC5maW5hbGx5KCgpID0+IHtcblx0XHRcdFx0aWYgKCFpc0FjdGl2ZSkgcmV0dXJuO1xuXHRcdFx0XHRzZXRMb2FkaW5nKGZhbHNlKTtcblx0XHRcdH0pO1xuXHRcdHJldHVybiAoKSA9PiB7XG5cdFx0XHRpc0FjdGl2ZSA9IGZhbHNlO1xuXHRcdH07XG5cdH0sIFtyZWNvcmRJZCwgcmVzb3VyY2UuaWRdKTtcblxuXHR1c2VFZmZlY3QoKCkgPT4ge1xuXHRcdGlmICghcmVjb3JkSWQpIHJldHVybjtcblx0XHRsZXQgaXNBY3RpdmUgPSB0cnVlO1xuXHRcdHNldFJlbGF0ZWRMb2FkaW5nKHRydWUpO1xuXHRcdGFwaS5yZWNvcmRBY3Rpb24oe1xuXHRcdFx0cmVzb3VyY2VJZDogcmVzb3VyY2UuaWQsXG5cdFx0XHRyZWNvcmRJZCxcblx0XHRcdGFjdGlvbk5hbWU6ICd1c2VyUmVsYXRlZERhdGEnLFxuXHRcdFx0bWV0aG9kOiAnZ2V0Jyxcblx0XHR9KVxuXHRcdFx0LnRoZW4oKHJlc3BvbnNlKSA9PiB7XG5cdFx0XHRcdGlmICghaXNBY3RpdmUpIHJldHVybjtcblx0XHRcdFx0c2V0UmVsYXRlZCgocmVzcG9uc2UuZGF0YS5wYXlsb2FkID8/IG51bGwpIGFzIFVzZXJSZWxhdGVkUGF5bG9hZCB8IG51bGwpO1xuXHRcdFx0fSlcblx0XHRcdC5maW5hbGx5KCgpID0+IHtcblx0XHRcdFx0aWYgKCFpc0FjdGl2ZSkgcmV0dXJuO1xuXHRcdFx0XHRzZXRSZWxhdGVkTG9hZGluZyhmYWxzZSk7XG5cdFx0XHR9KTtcblx0XHRyZXR1cm4gKCkgPT4ge1xuXHRcdFx0aXNBY3RpdmUgPSBmYWxzZTtcblx0XHR9O1xuXHR9LCBbcmVjb3JkSWQsIHJlc291cmNlLmlkXSk7XG5cblx0Y29uc3Qgc3RhdHVzT3B0aW9ucyA9IHVzZU1lbW88U3RhdHVzT3B0aW9uW10+KFxuXHRcdCgpID0+IFtcblx0XHRcdHsgdmFsdWU6ICdBQ1RJVkUnLCBsYWJlbDogdHJhbnNsYXRlTWVzc2FnZSgndXNlci1zdGF0dXMtYWN0aXZlJykgfSxcblx0XHRcdHsgdmFsdWU6ICdTVVNQRU5ERUQnLCBsYWJlbDogdHJhbnNsYXRlTWVzc2FnZSgndXNlci1zdGF0dXMtc3VzcGVuZGVkJykgfSxcblx0XHRcdHsgdmFsdWU6ICdCTE9DS0VEJywgbGFiZWw6IHRyYW5zbGF0ZU1lc3NhZ2UoJ3VzZXItc3RhdHVzLWJsb2NrZWQnKSB9LFxuXHRcdF0sXG5cdFx0W3RyYW5zbGF0ZU1lc3NhZ2VdXG5cdCk7XG5cdGNvbnN0IHNlbGVjdGVkU3RhdHVzT3B0aW9uID1cblx0XHRzdGF0dXNPcHRpb25zLmZpbmQoKG9wdGlvbikgPT4gb3B0aW9uLnZhbHVlID09PSBhZG1pblN0YXR1cykgPz8gc3RhdHVzT3B0aW9uc1swXSA/PyBudWxsO1xuXG5cdGNvbnN0IGxhc3RPcmRlclRleHQgPSB1c2VNZW1vKCgpID0+IHtcblx0XHRpZiAoIXBheWxvYWQ/Lmxhc3RPcmRlckRhdGUpIHJldHVybiAnLSc7XG5cdFx0Y29uc3QgcGFyc2VkID0gRGF0ZS5wYXJzZShwYXlsb2FkLmxhc3RPcmRlckRhdGUpO1xuXHRcdHJldHVybiBOdW1iZXIuaXNOYU4ocGFyc2VkKSA/IHBheWxvYWQubGFzdE9yZGVyRGF0ZSA6IG5ldyBEYXRlKHBhcnNlZCkudG9Mb2NhbGVTdHJpbmcoKTtcblx0fSwgW3BheWxvYWQ/Lmxhc3RPcmRlckRhdGVdKTtcblxuXHRjb25zdCBzdGF0dXNCYWRnZVN0eWxlID0gdXNlTWVtbygoKSA9PiB7XG5cdFx0aWYgKGFkbWluU3RhdHVzID09PSAnQkxPQ0tFRCcpIHtcblx0XHRcdHJldHVybiB7IGJhY2tncm91bmQ6ICcjRkVEN0Q3JywgYm9yZGVyQ29sb3I6ICcjRTUzRTNFJywgY29sb3I6ICcjNzQyQTJBJyB9O1xuXHRcdH1cblx0XHRpZiAoYWRtaW5TdGF0dXMgPT09ICdTVVNQRU5ERUQnKSB7XG5cdFx0XHRyZXR1cm4geyBiYWNrZ3JvdW5kOiAnI0ZFRUJDOCcsIGJvcmRlckNvbG9yOiAnI0RENkIyMCcsIGNvbG9yOiAnIzdCMzQxRScgfTtcblx0XHR9XG5cdFx0cmV0dXJuIHsgYmFja2dyb3VuZDogJyNDNkY2RDUnLCBib3JkZXJDb2xvcjogJyMzOEExNjknLCBjb2xvcjogJyMyMjU0M0QnIH07XG5cdH0sIFthZG1pblN0YXR1c10pO1xuXG5cdGNvbnN0IGlzRGlydHkgPSB1c2VNZW1vKCgpID0+IHtcblx0XHRjb25zdCBiYXNlU3RhdHVzID0gKGxvY2FsUmVjb3JkPy5wYXJhbXM/LmFkbWluU3RhdHVzIGFzIFVzZXJBZG1pblN0YXR1cyB8IHVuZGVmaW5lZCkgPz8gJ0FDVElWRSc7XG5cdFx0Y29uc3QgYmFzZU5vdGVzID0gKGxvY2FsUmVjb3JkPy5wYXJhbXM/LmFkbWluTm90ZXMgYXMgc3RyaW5nIHwgdW5kZWZpbmVkKSA/PyAnJztcblx0XHRyZXR1cm4gYWRtaW5TdGF0dXMgIT09IGJhc2VTdGF0dXMgfHwgYWRtaW5Ob3RlcyAhPT0gYmFzZU5vdGVzO1xuXHR9LCBbYWRtaW5TdGF0dXMsIGFkbWluTm90ZXMsIGxvY2FsUmVjb3JkPy5wYXJhbXM/LmFkbWluTm90ZXMsIGxvY2FsUmVjb3JkPy5wYXJhbXM/LmFkbWluU3RhdHVzXSk7XG5cblx0Y29uc3QgaGFuZGxlU2F2ZU1ldGEgPSBhc3luYyAoKSA9PiB7XG5cdFx0aWYgKCFsb2NhbFJlY29yZD8uaWQgfHwgc2F2aW5nTWV0YSkgcmV0dXJuO1xuXHRcdHNldFNhdmluZ01ldGEodHJ1ZSk7XG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG5cdFx0XHRmb3JtRGF0YS5hcHBlbmQoJ2FkbWluU3RhdHVzJywgYWRtaW5TdGF0dXMpO1xuXHRcdFx0Zm9ybURhdGEuYXBwZW5kKCdhZG1pbk5vdGVzJywgYWRtaW5Ob3Rlcyk7XG5cdFx0XHRjb25zdCByZXNwb25zZSA9IGF3YWl0IGFwaS5yZWNvcmRBY3Rpb24oe1xuXHRcdFx0XHRyZXNvdXJjZUlkOiByZXNvdXJjZS5pZCxcblx0XHRcdFx0cmVjb3JkSWQ6IGxvY2FsUmVjb3JkLmlkLFxuXHRcdFx0XHRhY3Rpb25OYW1lOiAndXBkYXRlVXNlckFkbWluTWV0YScsXG5cdFx0XHRcdG1ldGhvZDogJ3Bvc3QnLFxuXHRcdFx0XHRkYXRhOiBmb3JtRGF0YSxcblx0XHRcdH0pO1xuXHRcdFx0aWYgKHJlc3BvbnNlLmRhdGEubm90aWNlKSB7XG5cdFx0XHRcdGFkZE5vdGljZShyZXNwb25zZS5kYXRhLm5vdGljZSk7XG5cdFx0XHR9XG5cdFx0XHRpZiAocmVzcG9uc2UuZGF0YS5yZWNvcmQpIHtcblx0XHRcdFx0c2V0TG9jYWxSZWNvcmQocmVzcG9uc2UuZGF0YS5yZWNvcmQpO1xuXHRcdFx0XHRzZXRBZG1pblN0YXR1cyhcblx0XHRcdFx0XHQoKHJlc3BvbnNlLmRhdGEucmVjb3JkPy5wYXJhbXM/LmFkbWluU3RhdHVzIGFzIFVzZXJBZG1pblN0YXR1cyB8IHVuZGVmaW5lZCkgPz8gJ0FDVElWRScpXG5cdFx0XHRcdCk7XG5cdFx0XHRcdHNldEFkbWluTm90ZXMoKHJlc3BvbnNlLmRhdGEucmVjb3JkPy5wYXJhbXM/LmFkbWluTm90ZXMgYXMgc3RyaW5nIHwgdW5kZWZpbmVkKSA/PyAnJyk7XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCB7XG5cdFx0XHRhZGROb3RpY2UoeyBtZXNzYWdlOiAndXNlci1hZG1pbi11cGRhdGUtZmFpbGVkJywgdHlwZTogJ2Vycm9yJyB9KTtcblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0c2V0U2F2aW5nTWV0YShmYWxzZSk7XG5cdFx0fVxuXHR9O1xuXG5cdHJldHVybiAoXG5cdFx0PEJveD5cblx0XHRcdDxCb3hcblx0XHRcdFx0dmFyaWFudD0nd2hpdGUnXG5cdFx0XHRcdHA9J3h4bCdcblx0XHRcdFx0Ym9yZGVyUmFkaXVzPSd4bCdcblx0XHRcdFx0Ym94U2hhZG93PSdzbSdcblx0XHRcdFx0bWI9J3hsJ1xuXHRcdFx0XHRzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQgI0UyRThGMCcgfX1cblx0XHRcdD5cblx0XHRcdFx0PFRleHQgZm9udFdlaWdodD0nYm9sZCcgbWI9J2xnJz5cblx0XHRcdFx0XHR7dHJhbnNsYXRlTWVzc2FnZSgnY3VzdG9tZXItZmxhZ3MnKX1cblx0XHRcdFx0PC9UZXh0PlxuXG5cdFx0XHRcdDxCb3ggc3R5bGU9e3sgZGlzcGxheTogJ2dyaWQnLCBncmlkVGVtcGxhdGVDb2x1bW5zOiAncmVwZWF0KGF1dG8tZml0LCBtaW5tYXgoMjYwcHgsIDFmcikpJywgZ2FwOiAxNiB9fT5cblx0XHRcdFx0XHQ8Qm94IHN0eWxlPXt7IHBhZGRpbmc6IDE0LCBib3JkZXJSYWRpdXM6IDEyLCBib3JkZXI6ICcxcHggc29saWQgI0UyRThGMCcgfX0+XG5cdFx0XHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJyBtYj0nc20nPlxuXHRcdFx0XHRcdFx0XHR7dHJhbnNsYXRlTWVzc2FnZSgnY3VzdG9tZXItc3RhdHVzJyl9XG5cdFx0XHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHRcdFx0XHQ8Qm94IGRpc3BsYXk9J2ZsZXgnIGFsaWduSXRlbXM9J2NlbnRlcicganVzdGlmeUNvbnRlbnQ9J3NwYWNlLWJldHdlZW4nPlxuXHRcdFx0XHRcdFx0XHQ8QmFkZ2UgZm9udFNpemU9J21kJyBvdXRsaW5lIHN0eWxlPXtzdGF0dXNCYWRnZVN0eWxlfT5cblx0XHRcdFx0XHRcdFx0XHR7c2VsZWN0ZWRTdGF0dXNPcHRpb24/LmxhYmVsID8/IGFkbWluU3RhdHVzfVxuXHRcdFx0XHRcdFx0XHQ8L0JhZGdlPlxuXHRcdFx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdFx0XHQ8Qm94IG10PSdtZCc+XG5cdFx0XHRcdFx0XHRcdDxGb3JtR3JvdXAgbGFiZWw9e3RyYW5zbGF0ZU1lc3NhZ2UoJ2N1c3RvbWVyLXN0YXR1cy1jaGFuZ2UnKX0gbWI9JzAnPlxuXHRcdFx0XHRcdFx0XHRcdDxTZWxlY3Rcblx0XHRcdFx0XHRcdFx0XHRcdGlzQ2xlYXJhYmxlPXtmYWxzZX1cblx0XHRcdFx0XHRcdFx0XHRcdG9wdGlvbnM9e3N0YXR1c09wdGlvbnN9XG5cdFx0XHRcdFx0XHRcdFx0XHR2YWx1ZT17c2VsZWN0ZWRTdGF0dXNPcHRpb259XG5cdFx0XHRcdFx0XHRcdFx0XHRvbkNoYW5nZT17KG9wdGlvbjogU3RhdHVzT3B0aW9uIHwgbnVsbCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zdCB2YWx1ZSA9IG9wdGlvbj8udmFsdWUgPz8gJ0FDVElWRSc7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHNldEFkbWluU3RhdHVzKHZhbHVlKTtcblx0XHRcdFx0XHRcdFx0XHRcdH19XG5cdFx0XHRcdFx0XHRcdFx0Lz5cblx0XHRcdFx0XHRcdFx0PC9Gb3JtR3JvdXA+XG5cdFx0XHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0XHQ8L0JveD5cblxuXHRcdFx0XHRcdDxCb3ggc3R5bGU9e3sgcGFkZGluZzogMTQsIGJvcmRlclJhZGl1czogMTIsIGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJyB9fT5cblx0XHRcdFx0XHRcdDxMYWJlbCBodG1sRm9yPSdhZG1pbi1ub3Rlcyc+e3RyYW5zbGF0ZU1lc3NhZ2UoJ2N1c3RvbWVyLWludGVybmFsLW5vdGVzJyl9PC9MYWJlbD5cblx0XHRcdFx0XHRcdDx0ZXh0YXJlYVxuXHRcdFx0XHRcdFx0XHRpZD0nYWRtaW4tbm90ZXMnXG5cdFx0XHRcdFx0XHRcdHZhbHVlPXthZG1pbk5vdGVzfVxuXHRcdFx0XHRcdFx0XHRvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRBZG1pbk5vdGVzKGV2ZW50LnRhcmdldC52YWx1ZSl9XG5cdFx0XHRcdFx0XHRcdHBsYWNlaG9sZGVyPXt0cmFuc2xhdGVNZXNzYWdlKCdjdXN0b21lci1pbnRlcm5hbC1ub3Rlcy1wbGFjZWhvbGRlcicpfVxuXHRcdFx0XHRcdFx0XHRyb3dzPXs1fVxuXHRcdFx0XHRcdFx0XHRzdHlsZT17e1xuXHRcdFx0XHRcdFx0XHRcdHdpZHRoOiAnMTAwJScsXG5cdFx0XHRcdFx0XHRcdFx0cmVzaXplOiAndmVydGljYWwnLFxuXHRcdFx0XHRcdFx0XHRcdHBhZGRpbmc6ICcxMnB4IDE0cHgnLFxuXHRcdFx0XHRcdFx0XHRcdGJvcmRlclJhZGl1czogOCxcblx0XHRcdFx0XHRcdFx0XHRib3JkZXI6ICcxcHggc29saWQgI0UyRThGMCcsXG5cdFx0XHRcdFx0XHRcdFx0Zm9udFNpemU6IDE0LFxuXHRcdFx0XHRcdFx0XHRcdG1hcmdpblRvcDogMTIsXG5cdFx0XHRcdFx0XHRcdH19XG5cdFx0XHRcdFx0XHQvPlxuXHRcdFx0XHRcdDwvQm94PlxuXHRcdFx0XHQ8L0JveD5cblxuXHRcdFx0XHQ8Qm94IG10PSd4bCcgZGlzcGxheT0nZmxleCcgc3R5bGU9e3sgZ2FwOiAxMiwgZmxleFdyYXA6ICd3cmFwJyB9fT5cblx0XHRcdFx0XHQ8QnV0dG9uXG5cdFx0XHRcdFx0XHRzdHlsZT17eyBib3JkZXJDb2xvcjogJ3doaXRlJywgYmFja2dyb3VuZDogJyNmYWNjMTUnLCBjb2xvcjogJ2JsYWNrJyB9fVxuXHRcdFx0XHRcdFx0dmFyaWFudD0nY29udGFpbmVkJ1xuXHRcdFx0XHRcdFx0Y29sb3I9J3ByaW1hcnknXG5cdFx0XHRcdFx0XHRvbkNsaWNrPXtoYW5kbGVTYXZlTWV0YX1cblx0XHRcdFx0XHRcdGRpc2FibGVkPXshaXNEaXJ0eSB8fCBzYXZpbmdNZXRhfVxuXHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdHtzYXZpbmdNZXRhID8gdHJhbnNsYXRlTWVzc2FnZSgnY3VzdG9tZXItZmxhZ3Mtc2F2aW5nJykgOiB0cmFuc2xhdGVNZXNzYWdlKCdjdXN0b21lci1mbGFncy1zYXZlJyl9XG5cdFx0XHRcdFx0PC9CdXR0b24+XG5cdFx0XHRcdDwvQm94PlxuXHRcdFx0PC9Cb3g+XG5cblx0XHRcdDxCb3hcblx0XHRcdFx0dmFyaWFudD0nd2hpdGUnXG5cdFx0XHRcdHA9J3h4bCdcblx0XHRcdFx0Ym9yZGVyUmFkaXVzPSd4bCdcblx0XHRcdFx0Ym94U2hhZG93PSdzbSdcblx0XHRcdFx0bWI9J3hsJ1xuXHRcdFx0XHRjbGFzc05hbWU9J2FkbWluLWNhcmQtLWtwaXMnXG5cdFx0XHRcdHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJyB9fVxuXHRcdFx0PlxuXHRcdFx0XHQ8VGV4dCBmb250V2VpZ2h0PSdib2xkJyBtYj0nbGcnPnt0cmFuc2xhdGVNZXNzYWdlKCdjdXN0b21lci1rcGlzJyl9PC9UZXh0PlxuXHRcdFx0XHR7bG9hZGluZyB8fCAhcGF5bG9hZCA/IChcblx0XHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJz57dHJhbnNsYXRlTWVzc2FnZSgnY3VzdG9tZXIta3Bpcy1sb2FkaW5nJyl9PC9UZXh0PlxuXHRcdFx0XHQpIDogKFxuXHRcdFx0XHRcdDxCb3hcblx0XHRcdFx0XHRcdHN0eWxlPXt7XG5cdFx0XHRcdFx0XHRcdGRpc3BsYXk6ICdncmlkJyxcblx0XHRcdFx0XHRcdFx0Z3JpZFRlbXBsYXRlQ29sdW1uczogJ3JlcGVhdChhdXRvLWZpdCwgbWlubWF4KDIyMHB4LCAxZnIpKScsXG5cdFx0XHRcdFx0XHRcdGdhcDogMTYsXG5cdFx0XHRcdFx0XHR9fVxuXHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdDxCb3ggc3R5bGU9e3sgcGFkZGluZzogMTQsIGJvcmRlclJhZGl1czogMTIsIGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJyB9fT5cblx0XHRcdFx0XHRcdFx0PFRleHQgY29sb3I9J2dyZXk2MCc+XG5cdFx0XHRcdFx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoJ2N1c3RvbWVyLWtwaXMtdG90YWwtb3JkZXJzJyl9XG5cdFx0XHRcdFx0XHRcdDwvVGV4dD5cblx0XHRcdFx0XHRcdFx0PFRleHQgZm9udFdlaWdodD0nYm9sZCc+e3BheWxvYWQudG90YWxPcmRlcnN9PC9UZXh0PlxuXHRcdFx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdFx0XHQ8Qm94IHN0eWxlPXt7IHBhZGRpbmc6IDE0LCBib3JkZXJSYWRpdXM6IDEyLCBib3JkZXI6ICcxcHggc29saWQgI0UyRThGMCcgfX0+XG5cdFx0XHRcdFx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnPlxuXHRcdFx0XHRcdFx0XHRcdHt0cmFuc2xhdGVNZXNzYWdlKCdjdXN0b21lci1rcGlzLWx0dicpfVxuXHRcdFx0XHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHRcdFx0XHRcdDxUZXh0IGZvbnRXZWlnaHQ9J2JvbGQnPntmb3JtYXRNb25leShwYXlsb2FkLmxpZmV0aW1lVmFsdWUpfTwvVGV4dD5cblx0XHRcdFx0XHRcdDwvQm94PlxuXHRcdFx0XHRcdFx0PEJveCBzdHlsZT17eyBwYWRkaW5nOiAxNCwgYm9yZGVyUmFkaXVzOiAxMiwgYm9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnIH19PlxuXHRcdFx0XHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJz5cblx0XHRcdFx0XHRcdFx0XHR7dHJhbnNsYXRlTWVzc2FnZSgnY3VzdG9tZXIta3Bpcy1hb3YnKX1cblx0XHRcdFx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0XHRcdFx0XHQ8VGV4dCBmb250V2VpZ2h0PSdib2xkJz57Zm9ybWF0TW9uZXkocGF5bG9hZC5hdmVyYWdlT3JkZXJWYWx1ZSl9PC9UZXh0PlxuXHRcdFx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdFx0XHQ8Qm94IHN0eWxlPXt7IHBhZGRpbmc6IDE0LCBib3JkZXJSYWRpdXM6IDEyLCBib3JkZXI6ICcxcHggc29saWQgI0UyRThGMCcgfX0+XG5cdFx0XHRcdFx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnPlxuXHRcdFx0XHRcdFx0XHRcdHt0cmFuc2xhdGVNZXNzYWdlKCdjdXN0b21lci1rcGlzLWxhc3Qtb3JkZXInKX1cblx0XHRcdFx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0XHRcdFx0XHQ8VGV4dCBmb250V2VpZ2h0PSdib2xkJz57bGFzdE9yZGVyVGV4dH08L1RleHQ+XG5cdFx0XHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0KX1cblx0XHRcdDwvQm94PlxuXG5cdFx0XHQ8Qm94XG5cdFx0XHRcdHZhcmlhbnQ9J3doaXRlJ1xuXHRcdFx0XHRwPSd4eGwnXG5cdFx0XHRcdGJvcmRlclJhZGl1cz0neGwnXG5cdFx0XHRcdGJveFNoYWRvdz0nc20nXG5cdFx0XHRcdG1iPSd4bCdcblx0XHRcdFx0c3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnIH19XG5cdFx0XHQ+XG5cdFx0XHRcdDxUZXh0IGZvbnRXZWlnaHQ9J2JvbGQnIG1iPSdsZyc+XG5cdFx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoJ2N1c3RvbWVyLXJlbGF0ZWQnKX1cblx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0XHR7cmVsYXRlZExvYWRpbmcgfHwgIXJlbGF0ZWQgPyAoXG5cdFx0XHRcdFx0PFRleHQgY29sb3I9J2dyZXk2MCc+e3RyYW5zbGF0ZU1lc3NhZ2UoJ2N1c3RvbWVyLXJlbGF0ZWQtbG9hZGluZycpfTwvVGV4dD5cblx0XHRcdFx0KSA6IChcblx0XHRcdFx0XHQ8Qm94IHN0eWxlPXt7IGRpc3BsYXk6ICdncmlkJywgZ3JpZFRlbXBsYXRlQ29sdW1uczogJzFmcicsIGdhcDogMTggfX0+XG5cdFx0XHRcdFx0XHQ8Qm94PlxuXHRcdFx0XHRcdFx0XHQ8VGV4dCBmb250V2VpZ2h0PSdib2xkJyBtYj0nc20nPlxuXHRcdFx0XHRcdFx0XHRcdHt0cmFuc2xhdGVNZXNzYWdlKCdjdXN0b21lci1yZWxhdGVkLW9yZGVycycpfVxuXHRcdFx0XHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHRcdFx0XHRcdHtyZWxhdGVkLm9yZGVycy5sZW5ndGggPyAoXG5cdFx0XHRcdFx0XHRcdFx0PFRhYmxlPlxuXHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlSGVhZD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlUm93PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZUNlbGw+e3RyYW5zbGF0ZU1lc3NhZ2UoJ2N1c3RvbWVyLXJlbGF0ZWQtb3JkZXItaWQnKX08L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVDZWxsPnt0cmFuc2xhdGVNZXNzYWdlKCdjdXN0b21lci1yZWxhdGVkLW9yZGVyLXN0YXR1cycpfTwvVGFibGVDZWxsPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZUNlbGw+e3RyYW5zbGF0ZU1lc3NhZ2UoJ2N1c3RvbWVyLXJlbGF0ZWQtb3JkZXItdG90YWwnKX08L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVDZWxsPnt0cmFuc2xhdGVNZXNzYWdlKCdjdXN0b21lci1yZWxhdGVkLW9yZGVyLWNyZWF0ZWQnKX08L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0PC9UYWJsZVJvdz5cblx0XHRcdFx0XHRcdFx0XHRcdDwvVGFibGVIZWFkPlxuXHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlQm9keT5cblx0XHRcdFx0XHRcdFx0XHRcdFx0e3JlbGF0ZWQub3JkZXJzLm1hcCgob3JkZXIpID0+IChcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVSb3cga2V5PXtvcmRlci5pZH0+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVDZWxsPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8YSBocmVmPXtidWlsZFJlY29yZFNob3dIcmVmKCdPcmRlcicsIG9yZGVyLmlkKX0gc3R5bGU9e3sgZm9udFdlaWdodDogNjAwIH19PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHtvcmRlci5pZH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PC9hPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PC9UYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVDZWxsPntvcmRlci5zdGF0dXN9PC9UYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVDZWxsPntmb3JtYXRNb25leShvcmRlci50b3RhbCl9PC9UYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVDZWxsPntmb3JtYXREYXRlKG9yZGVyLmNyZWF0ZWRBdCl9PC9UYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0PC9UYWJsZVJvdz5cblx0XHRcdFx0XHRcdFx0XHRcdFx0KSl9XG5cdFx0XHRcdFx0XHRcdFx0XHQ8L1RhYmxlQm9keT5cblx0XHRcdFx0XHRcdFx0XHQ8L1RhYmxlPlxuXHRcdFx0XHRcdFx0XHQpIDogKFxuXHRcdFx0XHRcdFx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnPnt0cmFuc2xhdGVNZXNzYWdlKCdjdXN0b21lci1yZWxhdGVkLWVtcHR5Jyl9PC9UZXh0PlxuXHRcdFx0XHRcdFx0XHQpfVxuXHRcdFx0XHRcdFx0PC9Cb3g+XG5cblx0XHRcdFx0XHRcdDxCb3g+XG5cdFx0XHRcdFx0XHRcdDxUZXh0IGZvbnRXZWlnaHQ9J2JvbGQnIG1iPSdzbSc+XG5cdFx0XHRcdFx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoJ2N1c3RvbWVyLXJlbGF0ZWQtcmV2aWV3cycpfVxuXHRcdFx0XHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHRcdFx0XHRcdHtyZWxhdGVkLnJldmlld3MubGVuZ3RoID8gKFxuXHRcdFx0XHRcdFx0XHRcdDxUYWJsZT5cblx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZUhlYWQ+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZVJvdz5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVDZWxsPnt0cmFuc2xhdGVNZXNzYWdlKCdjdXN0b21lci1yZWxhdGVkLXJldmlldy1wcm9kdWN0Jyl9PC9UYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlQ2VsbD57dHJhbnNsYXRlTWVzc2FnZSgnY3VzdG9tZXItcmVsYXRlZC1yZXZpZXctcmF0aW5nJyl9PC9UYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlQ2VsbD57dHJhbnNsYXRlTWVzc2FnZSgnY3VzdG9tZXItcmVsYXRlZC1yZXZpZXctY29tbWVudCcpfTwvVGFibGVDZWxsPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZUNlbGw+e3RyYW5zbGF0ZU1lc3NhZ2UoJ2N1c3RvbWVyLXJlbGF0ZWQtcmV2aWV3LWNyZWF0ZWQnKX08L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0PC9UYWJsZVJvdz5cblx0XHRcdFx0XHRcdFx0XHRcdDwvVGFibGVIZWFkPlxuXHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlQm9keT5cblx0XHRcdFx0XHRcdFx0XHRcdFx0e3JlbGF0ZWQucmV2aWV3cy5tYXAoKHJldmlldykgPT4gKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZVJvdyBrZXk9e3Jldmlldy5pZH0+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVDZWxsPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8YSBocmVmPXtidWlsZFJlY29yZFNob3dIcmVmKCdQcm9kdWN0JywgcmV2aWV3LnByb2R1Y3RJZCl9IHN0eWxlPXt7IGZvbnRXZWlnaHQ6IDYwMCB9fT5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR7cmV2aWV3LnByb2R1Y3ROYW1lfVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8L2E+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZUNlbGw+e3Jldmlldy5yYXRpbmd9PC9UYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVDZWxsPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGV4dFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHN0eWxlPXt7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRtYXhXaWR0aDogNDIwLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0d2hpdGVTcGFjZTogJ25vd3JhcCcsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRvdmVyZmxvdzogJ2hpZGRlbicsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR0ZXh0T3ZlcmZsb3c6ICdlbGxpcHNpcycsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fX1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHtyZXZpZXcuY29tbWVudH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PC9UYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVDZWxsPntmb3JtYXREYXRlKHJldmlldy5jcmVhdGVkQXQpfTwvVGFibGVDZWxsPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDwvVGFibGVSb3c+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdCkpfVxuXHRcdFx0XHRcdFx0XHRcdFx0PC9UYWJsZUJvZHk+XG5cdFx0XHRcdFx0XHRcdFx0PC9UYWJsZT5cblx0XHRcdFx0XHRcdFx0KSA6IChcblx0XHRcdFx0XHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJz57dHJhbnNsYXRlTWVzc2FnZSgnY3VzdG9tZXItcmVsYXRlZC1lbXB0eScpfTwvVGV4dD5cblx0XHRcdFx0XHRcdFx0KX1cblx0XHRcdFx0XHRcdDwvQm94PlxuXG5cdFx0XHRcdFx0XHQ8Qm94PlxuXHRcdFx0XHRcdFx0XHQ8VGV4dCBmb250V2VpZ2h0PSdib2xkJyBtYj0nc20nPlxuXHRcdFx0XHRcdFx0XHRcdHt0cmFuc2xhdGVNZXNzYWdlKCdjdXN0b21lci1yZWxhdGVkLXdpc2hsaXN0Jyl9XG5cdFx0XHRcdFx0XHRcdDwvVGV4dD5cblx0XHRcdFx0XHRcdFx0e3JlbGF0ZWQud2lzaGxpc3QubGVuZ3RoID8gKFxuXHRcdFx0XHRcdFx0XHRcdDxUYWJsZT5cblx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZUhlYWQ+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZVJvdz5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVDZWxsPnt0cmFuc2xhdGVNZXNzYWdlKCdjdXN0b21lci1yZWxhdGVkLXByb2R1Y3QnKX08L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVDZWxsPnt0cmFuc2xhdGVNZXNzYWdlKCdjdXN0b21lci1yZWxhdGVkLWFkZGVkJyl9PC9UYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdDwvVGFibGVSb3c+XG5cdFx0XHRcdFx0XHRcdFx0XHQ8L1RhYmxlSGVhZD5cblx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZUJvZHk+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHtyZWxhdGVkLndpc2hsaXN0Lm1hcCgoaXRlbSkgPT4gKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZVJvdyBrZXk9e2Ake2l0ZW0ucHJvZHVjdElkfToke2l0ZW0uY3JlYXRlZEF0fWB9PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PGEgaHJlZj17YnVpbGRSZWNvcmRTaG93SHJlZignUHJvZHVjdCcsIGl0ZW0ucHJvZHVjdElkKX0gc3R5bGU9e3sgZm9udFdlaWdodDogNjAwIH19PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHtpdGVtLnByb2R1Y3ROYW1lfVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8L2E+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZUNlbGw+e2Zvcm1hdERhdGUoaXRlbS5jcmVhdGVkQXQpfTwvVGFibGVDZWxsPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDwvVGFibGVSb3c+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdCkpfVxuXHRcdFx0XHRcdFx0XHRcdFx0PC9UYWJsZUJvZHk+XG5cdFx0XHRcdFx0XHRcdFx0PC9UYWJsZT5cblx0XHRcdFx0XHRcdFx0KSA6IChcblx0XHRcdFx0XHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJz57dHJhbnNsYXRlTWVzc2FnZSgnY3VzdG9tZXItcmVsYXRlZC1lbXB0eScpfTwvVGV4dD5cblx0XHRcdFx0XHRcdFx0KX1cblx0XHRcdFx0XHRcdDwvQm94PlxuXG5cdFx0XHRcdFx0XHQ8Qm94PlxuXHRcdFx0XHRcdFx0XHQ8VGV4dCBmb250V2VpZ2h0PSdib2xkJyBtYj0nc20nPlxuXHRcdFx0XHRcdFx0XHRcdHt0cmFuc2xhdGVNZXNzYWdlKCdjdXN0b21lci1yZWxhdGVkLXJlY2VudGx5LXZpZXdlZCcpfVxuXHRcdFx0XHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHRcdFx0XHRcdHtyZWxhdGVkLnJlY2VudGx5Vmlld2VkLmxlbmd0aCA/IChcblx0XHRcdFx0XHRcdFx0XHQ8VGFibGU+XG5cdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVIZWFkPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVSb3c+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlQ2VsbD57dHJhbnNsYXRlTWVzc2FnZSgnY3VzdG9tZXItcmVsYXRlZC1wcm9kdWN0Jyl9PC9UYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlQ2VsbD57dHJhbnNsYXRlTWVzc2FnZSgnY3VzdG9tZXItcmVsYXRlZC11cGRhdGVkJyl9PC9UYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdDwvVGFibGVSb3c+XG5cdFx0XHRcdFx0XHRcdFx0XHQ8L1RhYmxlSGVhZD5cblx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZUJvZHk+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHtyZWxhdGVkLnJlY2VudGx5Vmlld2VkLm1hcCgoaXRlbSkgPT4gKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZVJvdyBrZXk9e2Ake2l0ZW0ucHJvZHVjdElkfToke2l0ZW0uY3JlYXRlZEF0fWB9PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PGEgaHJlZj17YnVpbGRSZWNvcmRTaG93SHJlZignUHJvZHVjdCcsIGl0ZW0ucHJvZHVjdElkKX0gc3R5bGU9e3sgZm9udFdlaWdodDogNjAwIH19PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHtpdGVtLnByb2R1Y3ROYW1lfVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8L2E+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZUNlbGw+e2Zvcm1hdERhdGUoaXRlbS5jcmVhdGVkQXQpfTwvVGFibGVDZWxsPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDwvVGFibGVSb3c+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdCkpfVxuXHRcdFx0XHRcdFx0XHRcdFx0PC9UYWJsZUJvZHk+XG5cdFx0XHRcdFx0XHRcdFx0PC9UYWJsZT5cblx0XHRcdFx0XHRcdFx0KSA6IChcblx0XHRcdFx0XHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJz57dHJhbnNsYXRlTWVzc2FnZSgnY3VzdG9tZXItcmVsYXRlZC1lbXB0eScpfTwvVGV4dD5cblx0XHRcdFx0XHRcdFx0KX1cblx0XHRcdFx0XHRcdDwvQm94PlxuXHRcdFx0XHRcdDwvQm94PlxuXHRcdFx0XHQpfVxuXHRcdFx0PC9Cb3g+XG5cblx0XHRcdDxPcmlnaW5hbFNob3cgey4uLnByb3BzfSAvPlxuXHRcdDwvQm94PlxuXHQpO1xufVxuIiwiaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VNZW1vLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEFwaUNsaWVudCwgdHlwZSBBY3Rpb25Qcm9wcywgdXNlVHJhbnNsYXRpb24gfSBmcm9tICdhZG1pbmpzJztcbmltcG9ydCB7IEJhZGdlLCBCb3gsIEJ1dHRvbiwgVGFibGUsIFRhYmxlQm9keSwgVGFibGVDZWxsLCBUYWJsZUhlYWQsIFRhYmxlUm93LCBUZXh0IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSc7XG5cbmNvbnN0IGFwaSA9IG5ldyBBcGlDbGllbnQoKTtcblxudHlwZSBTZWdtZW50VXNlciA9IHtcblx0aWQ6IHN0cmluZztcblx0bmFtZTogc3RyaW5nO1xuXHRlbWFpbDogc3RyaW5nIHwgbnVsbDtcblx0ZW1haWxWZXJpZmllZDogYm9vbGVhbjtcblx0c3Vic2NyaWJlZDogYm9vbGVhbjtcblx0Y3JlYXRlZEF0OiBzdHJpbmc7XG5cdGxhc3RPcmRlckF0OiBzdHJpbmcgfCBudWxsO1xuXHRsaWZldGltZVZhbHVlOiBudW1iZXIgfCBudWxsO1xufTtcblxudHlwZSBTZWdtZW50c1BheWxvYWQgPSB7XG5cdGNvbmZpZzoge1xuXHRcdGluYWN0aXZlRGF5czogbnVtYmVyO1xuXHRcdGhpZ2hTcGVuZGVyTWluTHR2OiBudW1iZXI7XG5cdFx0cHJldmlld0xpbWl0OiBudW1iZXI7XG5cdH07XG5cdGNvdW50czoge1xuXHRcdHN1YnNjcmliZWQ6IG51bWJlcjtcblx0XHR2ZXJpZmllZDogbnVtYmVyO1xuXHRcdHVudmVyaWZpZWQ6IG51bWJlcjtcblx0XHRpbmFjdGl2ZTogbnVtYmVyO1xuXHRcdGhpZ2hTcGVuZGVyczogbnVtYmVyIHwgbnVsbDtcblx0fTtcblx0bGlzdHM6IHtcblx0XHRzdWJzY3JpYmVkOiBTZWdtZW50VXNlcltdO1xuXHRcdHZlcmlmaWVkOiBTZWdtZW50VXNlcltdO1xuXHRcdHVudmVyaWZpZWQ6IFNlZ21lbnRVc2VyW107XG5cdFx0aW5hY3RpdmU6IFNlZ21lbnRVc2VyW107XG5cdFx0aGlnaFNwZW5kZXJzOiBTZWdtZW50VXNlcltdO1xuXHR9O1xufTtcblxuY29uc3QgZm9ybWF0RGF0ZSA9ICh2YWx1ZTogc3RyaW5nIHwgbnVsbCkgPT4ge1xuXHRpZiAoIXZhbHVlKSByZXR1cm4gJy0nO1xuXHRjb25zdCBwYXJzZWQgPSBEYXRlLnBhcnNlKHZhbHVlKTtcblx0cmV0dXJuIE51bWJlci5pc05hTihwYXJzZWQpID8gdmFsdWUgOiBuZXcgRGF0ZShwYXJzZWQpLnRvTG9jYWxlU3RyaW5nKCk7XG59O1xuXG5jb25zdCBmb3JtYXRNb25leSA9ICh2YWx1ZTogbnVtYmVyIHwgbnVsbCkgPT4ge1xuXHRpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuICctJztcblx0dHJ5IHtcblx0XHRyZXR1cm4gbmV3IEludGwuTnVtYmVyRm9ybWF0KHVuZGVmaW5lZCwge1xuXHRcdFx0c3R5bGU6ICdjdXJyZW5jeScsXG5cdFx0XHRjdXJyZW5jeTogJ1VBSCcsXG5cdFx0XHRtaW5pbXVtRnJhY3Rpb25EaWdpdHM6IDIsXG5cdFx0XHRtYXhpbXVtRnJhY3Rpb25EaWdpdHM6IDIsXG5cdFx0fSkuZm9ybWF0KHZhbHVlKTtcblx0fSBjYXRjaCB7XG5cdFx0cmV0dXJuIHZhbHVlLnRvRml4ZWQoMik7XG5cdH1cbn07XG5cbmNvbnN0IGdldFJvb3RQYXRoID0gKCkgPT4ge1xuXHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybiAnJztcblx0Y29uc3QgcGF0aCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSA/PyAnJztcblx0Y29uc3QgcGFydHMgPSBwYXRoLnNwbGl0KCcvcmVzb3VyY2VzJyk7XG5cdHJldHVybiBwYXJ0c1swXSA/PyAnJztcbn07XG5cbmNvbnN0IGJ1aWxkVXNlclNob3dIcmVmID0gKHJlc291cmNlSWQ6IHN0cmluZywgdXNlcklkOiBzdHJpbmcpID0+XG5cdGAke2dldFJvb3RQYXRoKCl9L3Jlc291cmNlcy8ke3Jlc291cmNlSWR9L3JlY29yZHMvJHt1c2VySWR9L3Nob3dgO1xuXG5jb25zdCBidWlsZFVzZXJMaXN0SHJlZiA9IChyZXNvdXJjZUlkOiBzdHJpbmcsIGZpbHRlcnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4pID0+IHtcblx0Y29uc3Qgcm9vdCA9IGdldFJvb3RQYXRoKCk7XG5cdGNvbnN0IHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoKTtcblx0Zm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoZmlsdGVycykpIHtcblx0XHRwYXJhbXMuc2V0KGBmaWx0ZXJzLiR7a2V5fWAsIHZhbHVlKTtcblx0fVxuXHRyZXR1cm4gYCR7cm9vdH0vcmVzb3VyY2VzLyR7cmVzb3VyY2VJZH0/JHtwYXJhbXMudG9TdHJpbmcoKX1gO1xufTtcblxuZnVuY3Rpb24gVXNlcnNUYWJsZSh7XG5cdHJlc291cmNlSWQsXG5cdHVzZXJzLFxuXHRzaG93TGFzdE9yZGVyLFxuXHRzaG93THR2LFxufToge1xuXHRyZXNvdXJjZUlkOiBzdHJpbmc7XG5cdHVzZXJzOiBTZWdtZW50VXNlcltdO1xuXHRzaG93TGFzdE9yZGVyPzogYm9vbGVhbjtcblx0c2hvd0x0dj86IGJvb2xlYW47XG59KSB7XG5cdGNvbnN0IHsgdHJhbnNsYXRlTWVzc2FnZSB9ID0gdXNlVHJhbnNsYXRpb24oKTtcblxuXHRpZiAoIXVzZXJzLmxlbmd0aCkge1xuXHRcdHJldHVybiA8VGV4dCBjb2xvcj0nZ3JleTYwJz57dHJhbnNsYXRlTWVzc2FnZSgndXNlci1zZWdtZW50cy1lbXB0eScpfTwvVGV4dD47XG5cdH1cblxuXHRyZXR1cm4gKFxuXHRcdDxUYWJsZT5cblx0XHRcdDxUYWJsZUhlYWQ+XG5cdFx0XHRcdDxUYWJsZVJvdz5cblx0XHRcdFx0XHQ8VGFibGVDZWxsPnt0cmFuc2xhdGVNZXNzYWdlKCd1c2VyLXNlZ21lbnRzLWNvbC1uYW1lJyl9PC9UYWJsZUNlbGw+XG5cdFx0XHRcdFx0PFRhYmxlQ2VsbD57dHJhbnNsYXRlTWVzc2FnZSgndXNlci1zZWdtZW50cy1jb2wtZW1haWwnKX08L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHR7c2hvd0x0diA/IDxUYWJsZUNlbGw+e3RyYW5zbGF0ZU1lc3NhZ2UoJ3VzZXItc2VnbWVudHMtY29sLWx0dicpfTwvVGFibGVDZWxsPiA6IG51bGx9XG5cdFx0XHRcdFx0e3Nob3dMYXN0T3JkZXIgPyA8VGFibGVDZWxsPnt0cmFuc2xhdGVNZXNzYWdlKCd1c2VyLXNlZ21lbnRzLWNvbC1sYXN0LW9yZGVyJyl9PC9UYWJsZUNlbGw+IDogbnVsbH1cblx0XHRcdFx0XHQ8VGFibGVDZWxsPnt0cmFuc2xhdGVNZXNzYWdlKCd1c2VyLXNlZ21lbnRzLWNvbC1jcmVhdGVkJyl9PC9UYWJsZUNlbGw+XG5cdFx0XHRcdDwvVGFibGVSb3c+XG5cdFx0XHQ8L1RhYmxlSGVhZD5cblx0XHRcdDxUYWJsZUJvZHk+XG5cdFx0XHRcdHt1c2Vycy5tYXAoKHVzZXIpID0+IChcblx0XHRcdFx0XHQ8VGFibGVSb3cga2V5PXt1c2VyLmlkfT5cblx0XHRcdFx0XHRcdDxUYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHRcdDxhIGhyZWY9e2J1aWxkVXNlclNob3dIcmVmKHJlc291cmNlSWQsIHVzZXIuaWQpfSBzdHlsZT17eyBmb250V2VpZ2h0OiA2MDAgfX0+XG5cdFx0XHRcdFx0XHRcdFx0e3VzZXIubmFtZX1cblx0XHRcdFx0XHRcdFx0PC9hPlxuXHRcdFx0XHRcdFx0PC9UYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHQ8VGFibGVDZWxsPnt1c2VyLmVtYWlsID8/ICctJ308L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdHtzaG93THR2ID8gPFRhYmxlQ2VsbD57Zm9ybWF0TW9uZXkodXNlci5saWZldGltZVZhbHVlKX08L1RhYmxlQ2VsbD4gOiBudWxsfVxuXHRcdFx0XHRcdFx0e3Nob3dMYXN0T3JkZXIgPyA8VGFibGVDZWxsPntmb3JtYXREYXRlKHVzZXIubGFzdE9yZGVyQXQpfTwvVGFibGVDZWxsPiA6IG51bGx9XG5cdFx0XHRcdFx0XHQ8VGFibGVDZWxsPntmb3JtYXREYXRlKHVzZXIuY3JlYXRlZEF0KX08L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHQ8L1RhYmxlUm93PlxuXHRcdFx0XHQpKX1cblx0XHRcdDwvVGFibGVCb2R5PlxuXHRcdDwvVGFibGU+XG5cdCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFVzZXJTZWdtZW50cyh7IHJlc291cmNlIH06IEFjdGlvblByb3BzKSB7XG5cdGNvbnN0IHsgdHJhbnNsYXRlTWVzc2FnZSB9ID0gdXNlVHJhbnNsYXRpb24oKTtcblx0Y29uc3QgW3BheWxvYWQsIHNldFBheWxvYWRdID0gdXNlU3RhdGU8U2VnbWVudHNQYXlsb2FkIHwgbnVsbD4obnVsbCk7XG5cdGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuXHR1c2VFZmZlY3QoKCkgPT4ge1xuXHRcdGxldCBpc0FjdGl2ZSA9IHRydWU7XG5cdFx0c2V0TG9hZGluZyh0cnVlKTtcblx0XHRhcGkucmVzb3VyY2VBY3Rpb24oe1xuXHRcdFx0cmVzb3VyY2VJZDogcmVzb3VyY2UuaWQsXG5cdFx0XHRhY3Rpb25OYW1lOiAndXNlclNlZ21lbnRzJyxcblx0XHRcdG1ldGhvZDogJ2dldCcsXG5cdFx0fSlcblx0XHRcdC50aGVuKChyZXNwb25zZSkgPT4ge1xuXHRcdFx0XHRpZiAoIWlzQWN0aXZlKSByZXR1cm47XG5cdFx0XHRcdHNldFBheWxvYWQoKHJlc3BvbnNlLmRhdGEucGF5bG9hZCA/PyBudWxsKSBhcyBTZWdtZW50c1BheWxvYWQgfCBudWxsKTtcblx0XHRcdH0pXG5cdFx0XHQuZmluYWxseSgoKSA9PiB7XG5cdFx0XHRcdGlmICghaXNBY3RpdmUpIHJldHVybjtcblx0XHRcdFx0c2V0TG9hZGluZyhmYWxzZSk7XG5cdFx0XHR9KTtcblx0XHRyZXR1cm4gKCkgPT4ge1xuXHRcdFx0aXNBY3RpdmUgPSBmYWxzZTtcblx0XHR9O1xuXHR9LCBbcmVzb3VyY2UuaWRdKTtcblxuXHRjb25zdCBwcmV2aWV3TGltaXRUZXh0ID0gdXNlTWVtbygoKSA9PiB7XG5cdFx0aWYgKCFwYXlsb2FkKSByZXR1cm4gJyc7XG5cdFx0cmV0dXJuIHRyYW5zbGF0ZU1lc3NhZ2UoJ3VzZXItc2VnbWVudHMtcHJldmlldycsIHsgbGltaXQ6IHBheWxvYWQuY29uZmlnLnByZXZpZXdMaW1pdCB9KTtcblx0fSwgW3BheWxvYWQsIHRyYW5zbGF0ZU1lc3NhZ2VdKTtcblxuXHRpZiAobG9hZGluZyB8fCAhcGF5bG9hZCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8Qm94IHZhcmlhbnQ9J3doaXRlJyBwPSd4eGwnIGJvcmRlclJhZGl1cz0neGwnIGJveFNoYWRvdz0nc20nIHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJyB9fT5cblx0XHRcdFx0PFRleHQgY29sb3I9J2dyZXk2MCc+e3RyYW5zbGF0ZU1lc3NhZ2UoJ3VzZXItc2VnbWVudHMtbG9hZGluZycpfTwvVGV4dD5cblx0XHRcdDwvQm94PlxuXHRcdCk7XG5cdH1cblxuXHRyZXR1cm4gKFxuXHRcdDxCb3ggc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywgZ2FwOiAxOCB9fT5cblx0XHRcdDxCb3ggdmFyaWFudD0nd2hpdGUnIHA9J3h4bCcgYm9yZGVyUmFkaXVzPSd4bCcgYm94U2hhZG93PSdzbScgc3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnIH19PlxuXHRcdFx0XHQ8VGV4dCBmb250U2l6ZT0neGwnIGZvbnRXZWlnaHQ9J2JvbGQnIG1iPSdzbSc+XG5cdFx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoJ3VzZXItc2VnbWVudHMtdGl0bGUnKX1cblx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJyBtYj0nbWQnPlxuXHRcdFx0XHRcdHt0cmFuc2xhdGVNZXNzYWdlKCd1c2VyLXNlZ21lbnRzLXB1cnBvc2UnKX1cblx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJz57cHJldmlld0xpbWl0VGV4dH08L1RleHQ+XG5cdFx0XHQ8L0JveD5cblxuXHRcdFx0PEJveCB2YXJpYW50PSd3aGl0ZScgcD0neHhsJyBib3JkZXJSYWRpdXM9J3hsJyBib3hTaGFkb3c9J3NtJyBzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQgI0UyRThGMCcgfX0+XG5cdFx0XHRcdDxCb3ggZGlzcGxheT0nZmxleCcgYWxpZ25JdGVtcz0nY2VudGVyJyBqdXN0aWZ5Q29udGVudD0nc3BhY2UtYmV0d2VlbicgbWI9J2xnJz5cblx0XHRcdFx0XHQ8Qm94PlxuXHRcdFx0XHRcdFx0PFRleHQgZm9udFdlaWdodD0nYm9sZCc+e3RyYW5zbGF0ZU1lc3NhZ2UoJ3VzZXItc2VnbWVudHMtc3Vic2NyaWJlZCcpfTwvVGV4dD5cblx0XHRcdFx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnPnt0cmFuc2xhdGVNZXNzYWdlKCd1c2VyLXNlZ21lbnRzLXN1YnNjcmliZWQtZGVzYycpfTwvVGV4dD5cblx0XHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0XHQ8Qm94IGRpc3BsYXk9J2ZsZXgnIGFsaWduSXRlbXM9J2NlbnRlcicgc3R5bGU9e3sgZ2FwOiAxMiB9fT5cblx0XHRcdFx0XHRcdDxCYWRnZSBvdXRsaW5lPntwYXlsb2FkLmNvdW50cy5zdWJzY3JpYmVkfTwvQmFkZ2U+XG5cdFx0XHRcdFx0XHQ8YSBocmVmPXtidWlsZFVzZXJMaXN0SHJlZihyZXNvdXJjZS5pZCwgeyBzdWJzY3JpYmVkOiAndHJ1ZScgfSl9PlxuXHRcdFx0XHRcdFx0XHQ8QnV0dG9uIHZhcmlhbnQ9J291dGxpbmVkJz57dHJhbnNsYXRlTWVzc2FnZSgndXNlci1zZWdtZW50cy1vcGVuJyl9PC9CdXR0b24+XG5cdFx0XHRcdFx0XHQ8L2E+XG5cdFx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdDwvQm94PlxuXHRcdFx0XHQ8VXNlcnNUYWJsZSByZXNvdXJjZUlkPXtyZXNvdXJjZS5pZH0gdXNlcnM9e3BheWxvYWQubGlzdHMuc3Vic2NyaWJlZH0gLz5cblx0XHRcdDwvQm94PlxuXG5cdFx0XHQ8Qm94IHZhcmlhbnQ9J3doaXRlJyBwPSd4eGwnIGJvcmRlclJhZGl1cz0neGwnIGJveFNoYWRvdz0nc20nIHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJyB9fT5cblx0XHRcdFx0PEJveCBkaXNwbGF5PSdmbGV4JyBhbGlnbkl0ZW1zPSdjZW50ZXInIGp1c3RpZnlDb250ZW50PSdzcGFjZS1iZXR3ZWVuJyBtYj0nbGcnPlxuXHRcdFx0XHRcdDxCb3g+XG5cdFx0XHRcdFx0XHQ8VGV4dCBmb250V2VpZ2h0PSdib2xkJz57dHJhbnNsYXRlTWVzc2FnZSgndXNlci1zZWdtZW50cy12ZXJpZmllZCcpfTwvVGV4dD5cblx0XHRcdFx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnPnt0cmFuc2xhdGVNZXNzYWdlKCd1c2VyLXNlZ21lbnRzLXZlcmlmaWVkLWRlc2MnKX08L1RleHQ+XG5cdFx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdFx0PEJveCBkaXNwbGF5PSdmbGV4JyBhbGlnbkl0ZW1zPSdjZW50ZXInIHN0eWxlPXt7IGdhcDogMTIgfX0+XG5cdFx0XHRcdFx0XHQ8QmFkZ2Ugb3V0bGluZT57cGF5bG9hZC5jb3VudHMudmVyaWZpZWR9PC9CYWRnZT5cblx0XHRcdFx0XHRcdDxhIGhyZWY9e2J1aWxkVXNlckxpc3RIcmVmKHJlc291cmNlLmlkLCB7IGVtYWlsVmVyaWZpZWQ6ICd0cnVlJyB9KX0+XG5cdFx0XHRcdFx0XHRcdDxCdXR0b24gdmFyaWFudD0nb3V0bGluZWQnPnt0cmFuc2xhdGVNZXNzYWdlKCd1c2VyLXNlZ21lbnRzLW9wZW4nKX08L0J1dHRvbj5cblx0XHRcdFx0XHRcdDwvYT5cblx0XHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdDxVc2Vyc1RhYmxlIHJlc291cmNlSWQ9e3Jlc291cmNlLmlkfSB1c2Vycz17cGF5bG9hZC5saXN0cy52ZXJpZmllZH0gLz5cblx0XHRcdDwvQm94PlxuXG5cdFx0XHQ8Qm94IHZhcmlhbnQ9J3doaXRlJyBwPSd4eGwnIGJvcmRlclJhZGl1cz0neGwnIGJveFNoYWRvdz0nc20nIHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJyB9fT5cblx0XHRcdFx0PEJveCBkaXNwbGF5PSdmbGV4JyBhbGlnbkl0ZW1zPSdjZW50ZXInIGp1c3RpZnlDb250ZW50PSdzcGFjZS1iZXR3ZWVuJyBtYj0nbGcnPlxuXHRcdFx0XHRcdDxCb3g+XG5cdFx0XHRcdFx0XHQ8VGV4dCBmb250V2VpZ2h0PSdib2xkJz57dHJhbnNsYXRlTWVzc2FnZSgndXNlci1zZWdtZW50cy11bnZlcmlmaWVkJyl9PC9UZXh0PlxuXHRcdFx0XHRcdFx0PFRleHQgY29sb3I9J2dyZXk2MCc+e3RyYW5zbGF0ZU1lc3NhZ2UoJ3VzZXItc2VnbWVudHMtdW52ZXJpZmllZC1kZXNjJyl9PC9UZXh0PlxuXHRcdFx0XHRcdDwvQm94PlxuXHRcdFx0XHRcdDxCb3ggZGlzcGxheT0nZmxleCcgYWxpZ25JdGVtcz0nY2VudGVyJyBzdHlsZT17eyBnYXA6IDEyIH19PlxuXHRcdFx0XHRcdFx0PEJhZGdlIG91dGxpbmU+e3BheWxvYWQuY291bnRzLnVudmVyaWZpZWR9PC9CYWRnZT5cblx0XHRcdFx0XHRcdDxhIGhyZWY9e2J1aWxkVXNlckxpc3RIcmVmKHJlc291cmNlLmlkLCB7IGVtYWlsVmVyaWZpZWQ6ICdmYWxzZScgfSl9PlxuXHRcdFx0XHRcdFx0XHQ8QnV0dG9uIHZhcmlhbnQ9J291dGxpbmVkJz57dHJhbnNsYXRlTWVzc2FnZSgndXNlci1zZWdtZW50cy1vcGVuJyl9PC9CdXR0b24+XG5cdFx0XHRcdFx0XHQ8L2E+XG5cdFx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdDwvQm94PlxuXHRcdFx0XHQ8VXNlcnNUYWJsZSByZXNvdXJjZUlkPXtyZXNvdXJjZS5pZH0gdXNlcnM9e3BheWxvYWQubGlzdHMudW52ZXJpZmllZH0gLz5cblx0XHRcdDwvQm94PlxuXG5cdFx0XHQ8Qm94IHZhcmlhbnQ9J3doaXRlJyBwPSd4eGwnIGJvcmRlclJhZGl1cz0neGwnIGJveFNoYWRvdz0nc20nIHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJyB9fT5cblx0XHRcdFx0PEJveCBkaXNwbGF5PSdmbGV4JyBhbGlnbkl0ZW1zPSdjZW50ZXInIGp1c3RpZnlDb250ZW50PSdzcGFjZS1iZXR3ZWVuJyBtYj0nbGcnPlxuXHRcdFx0XHRcdDxCb3g+XG5cdFx0XHRcdFx0XHQ8VGV4dCBmb250V2VpZ2h0PSdib2xkJz57dHJhbnNsYXRlTWVzc2FnZSgndXNlci1zZWdtZW50cy1oaWdoLXNwZW5kZXJzJyl9PC9UZXh0PlxuXHRcdFx0XHRcdFx0PFRleHQgY29sb3I9J2dyZXk2MCc+XG5cdFx0XHRcdFx0XHRcdHt0cmFuc2xhdGVNZXNzYWdlKCd1c2VyLXNlZ21lbnRzLWhpZ2gtc3BlbmRlcnMtZGVzYycsIHtcblx0XHRcdFx0XHRcdFx0XHRtaW46IFN0cmluZyhwYXlsb2FkLmNvbmZpZy5oaWdoU3BlbmRlck1pbkx0diksXG5cdFx0XHRcdFx0XHRcdH0pfVxuXHRcdFx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0XHRcdDwvQm94PlxuXHRcdFx0XHRcdDxCb3ggZGlzcGxheT0nZmxleCcgYWxpZ25JdGVtcz0nY2VudGVyJyBzdHlsZT17eyBnYXA6IDEyIH19PlxuXHRcdFx0XHRcdFx0PEJhZGdlIG91dGxpbmU+e3BheWxvYWQuY291bnRzLmhpZ2hTcGVuZGVycyA/PyAnLSd9PC9CYWRnZT5cblx0XHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdDxVc2Vyc1RhYmxlIHJlc291cmNlSWQ9e3Jlc291cmNlLmlkfSB1c2Vycz17cGF5bG9hZC5saXN0cy5oaWdoU3BlbmRlcnN9IHNob3dMdHYgc2hvd0xhc3RPcmRlciAvPlxuXHRcdFx0PC9Cb3g+XG5cblx0XHRcdDxCb3ggdmFyaWFudD0nd2hpdGUnIHA9J3h4bCcgYm9yZGVyUmFkaXVzPSd4bCcgYm94U2hhZG93PSdzbScgc3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnIH19PlxuXHRcdFx0XHQ8Qm94IGRpc3BsYXk9J2ZsZXgnIGFsaWduSXRlbXM9J2NlbnRlcicganVzdGlmeUNvbnRlbnQ9J3NwYWNlLWJldHdlZW4nIG1iPSdsZyc+XG5cdFx0XHRcdFx0PEJveD5cblx0XHRcdFx0XHRcdDxUZXh0IGZvbnRXZWlnaHQ9J2JvbGQnPnt0cmFuc2xhdGVNZXNzYWdlKCd1c2VyLXNlZ21lbnRzLWluYWN0aXZlJyl9PC9UZXh0PlxuXHRcdFx0XHRcdFx0PFRleHQgY29sb3I9J2dyZXk2MCc+XG5cdFx0XHRcdFx0XHRcdHt0cmFuc2xhdGVNZXNzYWdlKCd1c2VyLXNlZ21lbnRzLWluYWN0aXZlLWRlc2MnLCB7IGRheXM6IFN0cmluZyhwYXlsb2FkLmNvbmZpZy5pbmFjdGl2ZURheXMpIH0pfVxuXHRcdFx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0XHRcdDwvQm94PlxuXHRcdFx0XHRcdDxCb3ggZGlzcGxheT0nZmxleCcgYWxpZ25JdGVtcz0nY2VudGVyJyBzdHlsZT17eyBnYXA6IDEyIH19PlxuXHRcdFx0XHRcdFx0PEJhZGdlIG91dGxpbmU+e3BheWxvYWQuY291bnRzLmluYWN0aXZlfTwvQmFkZ2U+XG5cdFx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdDwvQm94PlxuXHRcdFx0XHQ8VXNlcnNUYWJsZSByZXNvdXJjZUlkPXtyZXNvdXJjZS5pZH0gdXNlcnM9e3BheWxvYWQubGlzdHMuaW5hY3RpdmV9IHNob3dMYXN0T3JkZXIgLz5cblx0XHRcdDwvQm94PlxuXHRcdDwvQm94PlxuXHQpO1xufVxuXG4iLCJpbXBvcnQgeyB1c2VNZW1vLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEFwaUNsaWVudCwgdHlwZSBBY3Rpb25Qcm9wcywgdXNlTm90aWNlLCB1c2VUcmFuc2xhdGlvbiB9IGZyb20gJ2FkbWluanMnO1xuaW1wb3J0IHsgQm94LCBCdXR0b24sIEZvcm1Hcm91cCwgTGFiZWwsIFRleHQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcblxuY29uc3QgYXBpID0gbmV3IEFwaUNsaWVudCgpO1xuXG5jb25zdCB0b0xvY2FsSW5wdXRWYWx1ZSA9ICh2YWx1ZTogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCkgPT4ge1xuXHRpZiAoIXZhbHVlKSByZXR1cm4gJyc7XG5cdGNvbnN0IHBhcnNlZCA9IERhdGUucGFyc2UodmFsdWUpO1xuXHRpZiAoTnVtYmVyLmlzTmFOKHBhcnNlZCkpIHJldHVybiAnJztcblx0Y29uc3QgZCA9IG5ldyBEYXRlKHBhcnNlZCk7XG5cdGNvbnN0IHBhZCA9IChuOiBudW1iZXIpID0+IFN0cmluZyhuKS5wYWRTdGFydCgyLCAnMCcpO1xuXHRyZXR1cm4gYCR7ZC5nZXRGdWxsWWVhcigpfS0ke3BhZChkLmdldE1vbnRoKCkgKyAxKX0tJHtwYWQoZC5nZXREYXRlKCkpfVQke3BhZChkLmdldEhvdXJzKCkpfToke3BhZChkLmdldE1pbnV0ZXMoKSl9YDtcbn07XG5cbmNvbnN0IGZvcm1hdE1vbmV5ID0gKHZhbHVlOiBudW1iZXIsIGN1cnJlbmN5ID0gJ1VBSCcpID0+IHtcblx0dHJ5IHtcblx0XHRyZXR1cm4gbmV3IEludGwuTnVtYmVyRm9ybWF0KHVuZGVmaW5lZCwge1xuXHRcdFx0c3R5bGU6ICdjdXJyZW5jeScsXG5cdFx0XHRjdXJyZW5jeSxcblx0XHRcdG1pbmltdW1GcmFjdGlvbkRpZ2l0czogMixcblx0XHRcdG1heGltdW1GcmFjdGlvbkRpZ2l0czogMixcblx0XHR9KS5mb3JtYXQodmFsdWUpO1xuXHR9IGNhdGNoIHtcblx0XHRyZXR1cm4gdmFsdWUudG9GaXhlZCgyKTtcblx0fVxufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUHJvZHVjdFNjaGVkdWxlRGlzY291bnRBY3Rpb24oeyBhY3Rpb24sIHJlY29yZCwgcmVzb3VyY2UgfTogQWN0aW9uUHJvcHMpIHtcblx0Y29uc3QgYWRkTm90aWNlID0gdXNlTm90aWNlKCk7XG5cdGNvbnN0IHsgdHJhbnNsYXRlQWN0aW9uLCB0cmFuc2xhdGVNZXNzYWdlIH0gPSB1c2VUcmFuc2xhdGlvbigpO1xuXG5cdGNvbnN0IHByb2R1Y3ROYW1lID0gdXNlTWVtbygoKSA9PiBTdHJpbmcocmVjb3JkPy5wYXJhbXM/Lm5hbWUgPz8gJycpLCBbcmVjb3JkPy5wYXJhbXM/Lm5hbWVdKTtcblx0Y29uc3QgcHJvZHVjdFNsdWcgPSB1c2VNZW1vKCgpID0+IFN0cmluZyhyZWNvcmQ/LnBhcmFtcz8uc2x1ZyA/PyAnJyksIFtyZWNvcmQ/LnBhcmFtcz8uc2x1Z10pO1xuXHRjb25zdCBwcm9kdWN0U3RhdHVzID0gdXNlTWVtbygoKSA9PiBTdHJpbmcocmVjb3JkPy5wYXJhbXM/LnN0YXR1cyA/PyAnJyksIFtyZWNvcmQ/LnBhcmFtcz8uc3RhdHVzXSk7XG5cdGNvbnN0IGJhc2VQcmljZSA9IHVzZU1lbW8oKCkgPT4gTnVtYmVyKHJlY29yZD8ucGFyYW1zPy5iYXNlUHJpY2UgPz8gMCksIFtyZWNvcmQ/LnBhcmFtcz8uYmFzZVByaWNlXSk7XG5cdGNvbnN0IGluaXRpYWxEaXNjb3VudFByaWNlID0gdXNlTWVtbyhcblx0XHQoKSA9PiAocmVjb3JkPy5wYXJhbXM/LmRpc2NvdW50UHJpY2UgIT0gbnVsbCA/IFN0cmluZyhyZWNvcmQ/LnBhcmFtcz8uZGlzY291bnRQcmljZSkgOiAnJyksXG5cdFx0W3JlY29yZD8ucGFyYW1zPy5kaXNjb3VudFByaWNlXVxuXHQpO1xuXHRjb25zdCBpbml0aWFsU3RhcnQgPSB1c2VNZW1vKFxuXHRcdCgpID0+IHRvTG9jYWxJbnB1dFZhbHVlKChyZWNvcmQ/LnBhcmFtcz8uZGlzY291bnRTdGFydEF0IGFzIHN0cmluZyB8IHVuZGVmaW5lZCkgPz8gbnVsbCksXG5cdFx0W3JlY29yZD8ucGFyYW1zPy5kaXNjb3VudFN0YXJ0QXRdXG5cdCk7XG5cdGNvbnN0IGluaXRpYWxFbmQgPSB1c2VNZW1vKFxuXHRcdCgpID0+IHRvTG9jYWxJbnB1dFZhbHVlKChyZWNvcmQ/LnBhcmFtcz8uZGlzY291bnRFbmRBdCBhcyBzdHJpbmcgfCB1bmRlZmluZWQpID8/IG51bGwpLFxuXHRcdFtyZWNvcmQ/LnBhcmFtcz8uZGlzY291bnRFbmRBdF1cblx0KTtcblxuXHRjb25zdCBbZGlzY291bnRQcmljZSwgc2V0RGlzY291bnRQcmljZV0gPSB1c2VTdGF0ZShpbml0aWFsRGlzY291bnRQcmljZSk7XG5cdGNvbnN0IFtkaXNjb3VudFN0YXJ0QXQsIHNldERpc2NvdW50U3RhcnRBdF0gPSB1c2VTdGF0ZShpbml0aWFsU3RhcnQpO1xuXHRjb25zdCBbZGlzY291bnRFbmRBdCwgc2V0RGlzY291bnRFbmRBdF0gPSB1c2VTdGF0ZShpbml0aWFsRW5kKTtcblx0Y29uc3QgW3NhdmluZywgc2V0U2F2aW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuXHRjb25zdCB0aXRsZSA9IHRyYW5zbGF0ZUFjdGlvbihhY3Rpb24ubmFtZSwgcmVzb3VyY2UuaWQpO1xuXG5cdGNvbnN0IGNsaWVudFZhbGlkYXRpb25FcnJvciA9IHVzZU1lbW8oKCkgPT4ge1xuXHRcdGNvbnN0IGhhc1dpbmRvdyA9IEJvb2xlYW4oZGlzY291bnRTdGFydEF0IHx8IGRpc2NvdW50RW5kQXQpO1xuXHRcdGlmIChoYXNXaW5kb3cgJiYgKCFkaXNjb3VudFN0YXJ0QXQgfHwgIWRpc2NvdW50RW5kQXQpKSB7XG5cdFx0XHRyZXR1cm4gdHJhbnNsYXRlTWVzc2FnZSgnZGlzY291bnQtd2luZG93LWludmFsaWQnKTtcblx0XHR9XG5cdFx0aWYgKGRpc2NvdW50U3RhcnRBdCAmJiBkaXNjb3VudEVuZEF0KSB7XG5cdFx0XHRjb25zdCBzdGFydCA9IG5ldyBEYXRlKGRpc2NvdW50U3RhcnRBdCk7XG5cdFx0XHRjb25zdCBlbmQgPSBuZXcgRGF0ZShkaXNjb3VudEVuZEF0KTtcblx0XHRcdGlmICghTnVtYmVyLmlzTmFOKHN0YXJ0LmdldFRpbWUoKSkgJiYgIU51bWJlci5pc05hTihlbmQuZ2V0VGltZSgpKSAmJiBzdGFydC5nZXRUaW1lKCkgPj0gZW5kLmdldFRpbWUoKSkge1xuXHRcdFx0XHRyZXR1cm4gdHJhbnNsYXRlTWVzc2FnZSgnZGlzY291bnQtd2luZG93LWludmFsaWQnKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKGhhc1dpbmRvdyAmJiAhZGlzY291bnRQcmljZS50cmltKCkpIHtcblx0XHRcdHJldHVybiB0cmFuc2xhdGVNZXNzYWdlKCdkaXNjb3VudC1wcmljZS1yZXF1aXJlZCcpO1xuXHRcdH1cblx0XHRpZiAoZGlzY291bnRQcmljZS50cmltKCkpIHtcblx0XHRcdGNvbnN0IHBhcnNlZCA9IE51bWJlcihkaXNjb3VudFByaWNlKTtcblx0XHRcdGlmICghTnVtYmVyLmlzRmluaXRlKHBhcnNlZCkgfHwgIShwYXJzZWQgPiAwKSB8fCAhKHBhcnNlZCA8IGJhc2VQcmljZSkpIHtcblx0XHRcdFx0cmV0dXJuIHRyYW5zbGF0ZU1lc3NhZ2UoJ2Rpc2NvdW50LXByaWNlLWludmFsaWQnKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG51bGw7XG5cdH0sIFtiYXNlUHJpY2UsIGRpc2NvdW50RW5kQXQsIGRpc2NvdW50UHJpY2UsIGRpc2NvdW50U3RhcnRBdCwgdHJhbnNsYXRlTWVzc2FnZV0pO1xuXG5cdGNvbnN0IGN1cnJlbnRTdW1tYXJ5ID0gdXNlTWVtbygoKSA9PiB7XG5cdFx0Y29uc3QgZHAgPSByZWNvcmQ/LnBhcmFtcz8uZGlzY291bnRQcmljZSAhPSBudWxsID8gTnVtYmVyKHJlY29yZD8ucGFyYW1zPy5kaXNjb3VudFByaWNlKSA6IG51bGw7XG5cdFx0aWYgKCFkcCkgcmV0dXJuIHRyYW5zbGF0ZU1lc3NhZ2UoJ2Rpc2NvdW50LW5vbmUnKTtcblx0XHRjb25zdCBzdGFydCA9IChyZWNvcmQ/LnBhcmFtcz8uZGlzY291bnRTdGFydEF0IGFzIHN0cmluZyB8IHVuZGVmaW5lZCkgPz8gbnVsbDtcblx0XHRjb25zdCBlbmQgPSAocmVjb3JkPy5wYXJhbXM/LmRpc2NvdW50RW5kQXQgYXMgc3RyaW5nIHwgdW5kZWZpbmVkKSA/PyBudWxsO1xuXHRcdGlmICghc3RhcnQgJiYgIWVuZCkgcmV0dXJuIHRyYW5zbGF0ZU1lc3NhZ2UoJ2Rpc2NvdW50LWFsd2F5cycsIHsgcHJpY2U6IGZvcm1hdE1vbmV5KGRwKSB9KTtcblx0XHRyZXR1cm4gdHJhbnNsYXRlTWVzc2FnZSgnZGlzY291bnQtd2luZG93Jywge1xuXHRcdFx0cHJpY2U6IGZvcm1hdE1vbmV5KGRwKSxcblx0XHRcdHN0YXJ0OiBzdGFydCA/IG5ldyBEYXRlKHN0YXJ0KS50b0xvY2FsZVN0cmluZygpIDogJy0nLFxuXHRcdFx0ZW5kOiBlbmQgPyBuZXcgRGF0ZShlbmQpLnRvTG9jYWxlU3RyaW5nKCkgOiAnLScsXG5cdFx0fSk7XG5cdH0sIFtyZWNvcmQ/LnBhcmFtcz8uZGlzY291bnRFbmRBdCwgcmVjb3JkPy5wYXJhbXM/LmRpc2NvdW50UHJpY2UsIHJlY29yZD8ucGFyYW1zPy5kaXNjb3VudFN0YXJ0QXQsIHRyYW5zbGF0ZU1lc3NhZ2VdKTtcblxuXHRjb25zdCBoYW5kbGVTYXZlID0gYXN5bmMgKCkgPT4ge1xuXHRcdGlmICghcmVjb3JkPy5pZCB8fCBzYXZpbmcpIHJldHVybjtcblx0XHRpZiAoY2xpZW50VmFsaWRhdGlvbkVycm9yKSB7XG5cdFx0XHRhZGROb3RpY2UoeyBtZXNzYWdlOiBjbGllbnRWYWxpZGF0aW9uRXJyb3IsIHR5cGU6ICdlcnJvcicgfSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdHNldFNhdmluZyh0cnVlKTtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcblx0XHRcdGZvcm1EYXRhLmFwcGVuZCgnZGlzY291bnRQcmljZScsIGRpc2NvdW50UHJpY2UpO1xuXHRcdFx0Zm9ybURhdGEuYXBwZW5kKCdkaXNjb3VudFN0YXJ0QXQnLCBkaXNjb3VudFN0YXJ0QXQgPyBuZXcgRGF0ZShkaXNjb3VudFN0YXJ0QXQpLnRvSVNPU3RyaW5nKCkgOiAnJyk7XG5cdFx0XHRmb3JtRGF0YS5hcHBlbmQoJ2Rpc2NvdW50RW5kQXQnLCBkaXNjb3VudEVuZEF0ID8gbmV3IERhdGUoZGlzY291bnRFbmRBdCkudG9JU09TdHJpbmcoKSA6ICcnKTtcblxuXHRcdFx0Y29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhcGkucmVjb3JkQWN0aW9uKHtcblx0XHRcdFx0cmVzb3VyY2VJZDogcmVzb3VyY2UuaWQsXG5cdFx0XHRcdHJlY29yZElkOiByZWNvcmQuaWQsXG5cdFx0XHRcdGFjdGlvbk5hbWU6IGFjdGlvbi5uYW1lLFxuXHRcdFx0XHRtZXRob2Q6ICdwb3N0Jyxcblx0XHRcdFx0ZGF0YTogZm9ybURhdGEsXG5cdFx0XHR9KTtcblxuXHRcdFx0aWYgKHJlc3BvbnNlLmRhdGEubm90aWNlKSBhZGROb3RpY2UocmVzcG9uc2UuZGF0YS5ub3RpY2UpO1xuXHRcdH0gY2F0Y2gge1xuXHRcdFx0YWRkTm90aWNlKHsgbWVzc2FnZTogJ2Rpc2NvdW50LXNjaGVkdWxlLWZhaWxlZCcsIHR5cGU6ICdlcnJvcicgfSk7XG5cdFx0fSBmaW5hbGx5IHtcblx0XHRcdHNldFNhdmluZyhmYWxzZSk7XG5cdFx0fVxuXHR9O1xuXG5cdHJldHVybiAoXG5cdFx0PEJveFxuXHRcdFx0dmFyaWFudD0nd2hpdGUnXG5cdFx0XHRwPSd4eGwnXG5cdFx0XHRib3JkZXJSYWRpdXM9J3hsJ1xuXHRcdFx0Ym94U2hhZG93PSdzbSdcblx0XHRcdG1heFdpZHRoPSc3MjBweCdcblx0XHRcdHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJyB9fVxuXHRcdD5cblx0XHRcdDxUZXh0IGZvbnRTaXplPSd4bCcgZm9udFdlaWdodD0nYm9sZCcgbWI9J21kJz5cblx0XHRcdFx0e3RpdGxlfVxuXHRcdFx0PC9UZXh0PlxuXHRcdFx0e3Byb2R1Y3ROYW1lID8gKFxuXHRcdFx0XHQ8Qm94IG1iPSdsZyc+XG5cdFx0XHRcdFx0PFRleHQgZm9udFdlaWdodD0nYm9sZCc+e3Byb2R1Y3ROYW1lfTwvVGV4dD5cblx0XHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJz5cblx0XHRcdFx0XHRcdHtwcm9kdWN0U2x1ZyA/IGAke3Byb2R1Y3RTbHVnfWAgOiBudWxsfVxuXHRcdFx0XHRcdFx0e3Byb2R1Y3RTdGF0dXMgPyBgJHtwcm9kdWN0U2x1ZyA/ICcg4oCiICcgOiAnJ30ke3Byb2R1Y3RTdGF0dXN9YCA6IG51bGx9XG5cdFx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0XHQ8L0JveD5cblx0XHRcdCkgOiBudWxsfVxuXHRcdFx0PFRleHQgY29sb3I9J2dyZXk2MCcgbWI9J2xnJz5cblx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoJ2Rpc2NvdW50LWJhc2UtcHJpY2UnKX06IHtmb3JtYXRNb25leShiYXNlUHJpY2UpfVxuXHRcdFx0PC9UZXh0PlxuXHRcdFx0PFRleHQgbWI9J3hsJz57Y3VycmVudFN1bW1hcnl9PC9UZXh0PlxuXG5cdFx0XHQ8Qm94IHN0eWxlPXt7IGRpc3BsYXk6ICdncmlkJywgZ3JpZFRlbXBsYXRlQ29sdW1uczogJzFmcicsIGdhcDogMTYgfX0+XG5cdFx0XHRcdDxGb3JtR3JvdXAgbGFiZWw9e3RyYW5zbGF0ZU1lc3NhZ2UoJ2Rpc2NvdW50LXByaWNlLWxhYmVsJyl9IG1iPScwJz5cblx0XHRcdFx0XHQ8aW5wdXRcblx0XHRcdFx0XHRcdHR5cGU9J251bWJlcidcblx0XHRcdFx0XHRcdHN0ZXA9JzAuMDEnXG5cdFx0XHRcdFx0XHR2YWx1ZT17ZGlzY291bnRQcmljZX1cblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsoZSkgPT4gc2V0RGlzY291bnRQcmljZShlLnRhcmdldC52YWx1ZSl9XG5cdFx0XHRcdFx0XHRwbGFjZWhvbGRlcj0nMC4wMCdcblx0XHRcdFx0XHRcdHN0eWxlPXt7XG5cdFx0XHRcdFx0XHRcdHdpZHRoOiAnMTAwJScsXG5cdFx0XHRcdFx0XHRcdHBhZGRpbmc6ICcxMHB4IDEycHgnLFxuXHRcdFx0XHRcdFx0XHRib3JkZXJSYWRpdXM6IDgsXG5cdFx0XHRcdFx0XHRcdGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJyxcblx0XHRcdFx0XHRcdFx0Zm9udFNpemU6IDE0LFxuXHRcdFx0XHRcdFx0fX1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQ8L0Zvcm1Hcm91cD5cblxuXHRcdFx0XHQ8Qm94PlxuXHRcdFx0XHRcdDxMYWJlbCBodG1sRm9yPSdkaXNjb3VudFN0YXJ0QXQnPnt0cmFuc2xhdGVNZXNzYWdlKCdkaXNjb3VudC1zdGFydCcpfTwvTGFiZWw+XG5cdFx0XHRcdFx0PGlucHV0XG5cdFx0XHRcdFx0XHRpZD0nZGlzY291bnRTdGFydEF0J1xuXHRcdFx0XHRcdFx0dHlwZT0nZGF0ZXRpbWUtbG9jYWwnXG5cdFx0XHRcdFx0XHR2YWx1ZT17ZGlzY291bnRTdGFydEF0fVxuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyhlKSA9PiBzZXREaXNjb3VudFN0YXJ0QXQoZS50YXJnZXQudmFsdWUpfVxuXHRcdFx0XHRcdFx0c3R5bGU9e3tcblx0XHRcdFx0XHRcdFx0d2lkdGg6ICcxMDAlJyxcblx0XHRcdFx0XHRcdFx0cGFkZGluZzogJzEwcHggMTJweCcsXG5cdFx0XHRcdFx0XHRcdGJvcmRlclJhZGl1czogOCxcblx0XHRcdFx0XHRcdFx0Ym9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnLFxuXHRcdFx0XHRcdFx0XHRtYXJnaW5Ub3A6IDEwLFxuXHRcdFx0XHRcdFx0XHRmb250U2l6ZTogMTQsXG5cdFx0XHRcdFx0XHR9fVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdDwvQm94PlxuXG5cdFx0XHRcdDxCb3g+XG5cdFx0XHRcdFx0PExhYmVsIGh0bWxGb3I9J2Rpc2NvdW50RW5kQXQnPnt0cmFuc2xhdGVNZXNzYWdlKCdkaXNjb3VudC1lbmQnKX08L0xhYmVsPlxuXHRcdFx0XHRcdDxpbnB1dFxuXHRcdFx0XHRcdFx0aWQ9J2Rpc2NvdW50RW5kQXQnXG5cdFx0XHRcdFx0XHR0eXBlPSdkYXRldGltZS1sb2NhbCdcblx0XHRcdFx0XHRcdHZhbHVlPXtkaXNjb3VudEVuZEF0fVxuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyhlKSA9PiBzZXREaXNjb3VudEVuZEF0KGUudGFyZ2V0LnZhbHVlKX1cblx0XHRcdFx0XHRcdHN0eWxlPXt7XG5cdFx0XHRcdFx0XHRcdHdpZHRoOiAnMTAwJScsXG5cdFx0XHRcdFx0XHRcdHBhZGRpbmc6ICcxMHB4IDEycHgnLFxuXHRcdFx0XHRcdFx0XHRib3JkZXJSYWRpdXM6IDgsXG5cdFx0XHRcdFx0XHRcdGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJyxcblx0XHRcdFx0XHRcdFx0bWFyZ2luVG9wOiAxMCxcblx0XHRcdFx0XHRcdFx0Zm9udFNpemU6IDE0LFxuXHRcdFx0XHRcdFx0fX1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQ8L0JveD5cblx0XHRcdDwvQm94PlxuXG5cdFx0XHR7Y2xpZW50VmFsaWRhdGlvbkVycm9yID8gKFxuXHRcdFx0XHQ8VGV4dCBjb2xvcj0ncmVkNjAnIG10PSdsZyc+XG5cdFx0XHRcdFx0e2NsaWVudFZhbGlkYXRpb25FcnJvcn1cblx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0KSA6IG51bGx9XG5cblx0XHRcdDxCb3ggbXQ9J3hsJz5cblx0XHRcdFx0PEJ1dHRvblxuXHRcdFx0XHRcdHN0eWxlPXt7IGJvcmRlckNvbG9yOiAnd2hpdGUnLCBiYWNrZ3JvdW5kOiAnI2ZhY2MxNScsIGNvbG9yOiAnYmxhY2snIH19XG5cdFx0XHRcdFx0dmFyaWFudD0nY29udGFpbmVkJ1xuXHRcdFx0XHRcdGNvbG9yPSdwcmltYXJ5J1xuXHRcdFx0XHRcdG9uQ2xpY2s9e2hhbmRsZVNhdmV9XG5cdFx0XHRcdFx0ZGlzYWJsZWQ9e3NhdmluZ31cblx0XHRcdFx0PlxuXHRcdFx0XHRcdHtzYXZpbmcgPyB0cmFuc2xhdGVNZXNzYWdlKCdkaXNjb3VudC1zYXZpbmcnKSA6IHRyYW5zbGF0ZU1lc3NhZ2UoJ2Rpc2NvdW50LXNhdmUnKX1cblx0XHRcdFx0PC9CdXR0b24+XG5cdFx0XHQ8L0JveD5cblx0XHQ8L0JveD5cblx0KTtcbn1cbiIsImltcG9ydCB0eXBlIHsgU2hvd1Byb3BlcnR5UHJvcHMgfSBmcm9tICdhZG1pbmpzJztcbmltcG9ydCB7IEJveCwgVGV4dCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBQcm9kdWN0TmFtZUxpc3QocHJvcHM6IFNob3dQcm9wZXJ0eVByb3BzKSB7XG5cdGNvbnN0IHsgcmVjb3JkLCBwcm9wZXJ0eSB9ID0gcHJvcHM7XG5cdGNvbnN0IG5hbWUgPSBTdHJpbmcocmVjb3JkLnBhcmFtc1twcm9wZXJ0eS5wYXRoXSA/PyAnJyk7XG5cdGNvbnN0IGltYWdlVXJsID0gKHJlY29yZC5wYXJhbXMuaW1hZ2VVcmwgYXMgc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCkgPz8gbnVsbDtcblxuXHRyZXR1cm4gKFxuXHRcdDxCb3ggc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZ2FwOiAxNCwgbWluV2lkdGg6IDI2MCB9fT5cblx0XHRcdDxCb3hcblx0XHRcdFx0c3R5bGU9e3tcblx0XHRcdFx0XHR3aWR0aDogNjQsXG5cdFx0XHRcdFx0aGVpZ2h0OiA2NCxcblx0XHRcdFx0XHRib3JkZXJSYWRpdXM6IDEwLFxuXHRcdFx0XHRcdGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJyxcblx0XHRcdFx0XHRiYWNrZ3JvdW5kOiAnI0Y4RkFGQycsXG5cdFx0XHRcdFx0XHRvdmVyZmxvdzogJ2hpZGRlbicsXG5cdFx0XHRcdFx0XHRmbGV4U2hyaW5rOiAwLFxuXHRcdFx0XHRcdH19XG5cdFx0XHRcdD5cblx0XHRcdFx0XHR7aW1hZ2VVcmwgPyAoXG5cdFx0XHRcdFx0XHQ8aW1nXG5cdFx0XHRcdFx0XHRcdHNyYz17aW1hZ2VVcmx9XG5cdFx0XHRcdFx0XHRcdGFsdD0nJ1xuXHRcdFx0XHRcdFx0XHRzdHlsZT17eyB3aWR0aDogJzEwMCUnLCBoZWlnaHQ6ICcxMDAlJywgb2JqZWN0Rml0OiAnY292ZXInLCBkaXNwbGF5OiAnYmxvY2snIH19XG5cdFx0XHRcdFx0XHRcdGxvYWRpbmc9J2xhenknXG5cdFx0XHRcdFx0XHQvPlxuXHRcdFx0XHRcdFx0KSA6IG51bGx9XG5cdFx0XHQ8L0JveD5cblx0XHRcdDxCb3ggc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywgZ2FwOiA0LCBtaW5XaWR0aDogMCB9fT5cblx0XHRcdFx0PFRleHQgc3R5bGU9e3sgZm9udFdlaWdodDogNjAwLCB3aGl0ZVNwYWNlOiAnbm93cmFwJywgb3ZlcmZsb3c6ICdoaWRkZW4nLCB0ZXh0T3ZlcmZsb3c6ICdlbGxpcHNpcycgfX0+XG5cdFx0XHRcdFx0e25hbWV9XG5cdFx0XHRcdDwvVGV4dD5cblx0XHRcdDwvQm94PlxuXHRcdDwvQm94PlxuXHQpO1xufVxuIiwiaW1wb3J0IHsgdHlwZSBBY3Rpb25Qcm9wcywgT3JpZ2luYWxMaXN0LCB1c2VUcmFuc2xhdGlvbiB9IGZyb20gJ2FkbWluanMnO1xuaW1wb3J0IHsgQm94LCBCdXR0b24sIFRleHQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcblxuY29uc3QgYWN0aW9uQnV0dG9uU3R5bGUgPSB7XG5cdGJvcmRlckNvbG9yOiAnd2hpdGUnLFxuXHRiYWNrZ3JvdW5kOiAnI2ZhY2MxNScsXG5cdGNvbG9yOiAnYmxhY2snLFxufTtcblxuY29uc3QgZ2V0Um9vdFBhdGggPSAoKSA9PiB7XG5cdGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykgcmV0dXJuICcnO1xuXHRjb25zdCBwYXRoID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lID8/ICcnO1xuXHRjb25zdCBwYXJ0cyA9IHBhdGguc3BsaXQoJy9yZXNvdXJjZXMnKTtcblx0cmV0dXJuIHBhcnRzWzBdID8/ICcnO1xufTtcblxuY29uc3QgYnVpbGRMaXN0SHJlZiA9IChyZXNvdXJjZUlkOiBzdHJpbmcsIGZpbHRlcnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4pID0+IHtcblx0Y29uc3Qgcm9vdCA9IGdldFJvb3RQYXRoKCk7XG5cdGNvbnN0IHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoKTtcblx0Zm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoZmlsdGVycykpIHtcblx0XHRwYXJhbXMuc2V0KGBmaWx0ZXJzLiR7a2V5fWAsIHZhbHVlKTtcblx0fVxuXHRjb25zdCBxdWVyeSA9IHBhcmFtcy50b1N0cmluZygpO1xuXHRyZXR1cm4gYCR7cm9vdH0vcmVzb3VyY2VzLyR7cmVzb3VyY2VJZH0ke3F1ZXJ5ID8gYD8ke3F1ZXJ5fWAgOiAnJ31gO1xufTtcblxuY29uc3QgZGF5c0Fnb0lzbyA9IChkYXlzOiBudW1iZXIpID0+IG5ldyBEYXRlKERhdGUubm93KCkgLSBkYXlzICogMjQgKiA2MCAqIDYwICogMTAwMCkudG9JU09TdHJpbmcoKTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUHJvZHVjdExpc3QocHJvcHM6IEFjdGlvblByb3BzKSB7XG5cdGNvbnN0IHsgcmVzb3VyY2UgfSA9IHByb3BzO1xuXHRjb25zdCB7IHRyYW5zbGF0ZU1lc3NhZ2UgfSA9IHVzZVRyYW5zbGF0aW9uKCk7XG5cblx0Y29uc3Qgdmlld3M6IEFycmF5PHsga2V5OiBzdHJpbmc7IGZpbHRlcnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gfT4gPSBbXG5cdFx0eyBrZXk6ICdpbi1zdG9jaycsIGZpbHRlcnM6IHsgaW5TdG9jazogJ3RydWUnIH0gfSxcblx0XHR7IGtleTogJ2xvdy1zdG9jaycsIGZpbHRlcnM6IHsgaW5TdG9jazogJ3RydWUnLCBzdG9jazogSlNPTi5zdHJpbmdpZnkoeyBsdGU6IDUgfSkgfSB9LFxuXHRcdHsga2V5OiAnZGlzY291bnRlZCcsIGZpbHRlcnM6IHsgZGlzY291bnRQcmljZTogSlNPTi5zdHJpbmdpZnkoeyBub3Q6IG51bGwgfSkgfSB9LFxuXHRcdHsga2V5OiAnbm8taW1hZ2UnLCBmaWx0ZXJzOiB7IGltYWdlVXJsOiBKU09OLnN0cmluZ2lmeSh7IGVxdWFsczogbnVsbCB9KSB9IH0sXG5cdFx0eyBrZXk6ICdyZWNlbnRseS11cGRhdGVkJywgZmlsdGVyczogeyB1cGRhdGVkQXQ6IEpTT04uc3RyaW5naWZ5KHsgZ3RlOiBkYXlzQWdvSXNvKDcpIH0pIH0gfSxcblx0XHR7IGtleTogJ2RyYWZ0JywgZmlsdGVyczogeyBzdGF0dXM6ICdEUkFGVCcgfSB9LFxuXHRdO1xuXG5cdHJldHVybiAoXG5cdFx0PEJveD5cblx0XHRcdDxCb3hcblx0XHRcdFx0dmFyaWFudD0nd2hpdGUnXG5cdFx0XHRcdHA9J2xnJ1xuXHRcdFx0XHRib3JkZXJSYWRpdXM9J3hsJ1xuXHRcdFx0XHRib3hTaGFkb3c9J3NtJ1xuXHRcdFx0XHRtYj0neGwnXG5cdFx0XHRcdHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJywgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZ2FwOiAxMiwgZmxleFdyYXA6ICd3cmFwJyB9fVxuXHRcdFx0PlxuXHRcdFx0XHQ8VGV4dCBmb250V2VpZ2h0PSdib2xkJz57dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC12aWV3cy10aXRsZScpfTwvVGV4dD5cblx0XHRcdFx0PEJveCBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGdhcDogMTAsIGZsZXhXcmFwOiAnd3JhcCcgfX0+XG5cdFx0XHRcdFx0e3ZpZXdzLm1hcCgodmlldykgPT4gKFxuXHRcdFx0XHRcdFx0PGEga2V5PXt2aWV3LmtleX0gaHJlZj17YnVpbGRMaXN0SHJlZihyZXNvdXJjZS5pZCwgdmlldy5maWx0ZXJzKX0+XG5cdFx0XHRcdFx0XHRcdDxCdXR0b24gdmFyaWFudD0nY29udGFpbmVkJyBjb2xvcj0ncHJpbWFyeScgc3R5bGU9e2FjdGlvbkJ1dHRvblN0eWxlfT5cblx0XHRcdFx0XHRcdFx0XHR7dHJhbnNsYXRlTWVzc2FnZShgcHJvZHVjdC12aWV3cy0ke3ZpZXcua2V5fWApfVxuXHRcdFx0XHRcdFx0XHQ8L0J1dHRvbj5cblx0XHRcdFx0XHRcdDwvYT5cblx0XHRcdFx0XHQpKX1cblx0XHRcdFx0XHQ8YSBocmVmPXtidWlsZExpc3RIcmVmKHJlc291cmNlLmlkLCB7fSl9PlxuXHRcdFx0XHRcdFx0PEJ1dHRvbiB2YXJpYW50PSdvdXRsaW5lZCc+e3RyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3Qtdmlld3MtY2xlYXInKX08L0J1dHRvbj5cblx0XHRcdFx0XHQ8L2E+XG5cdFx0XHRcdDwvQm94PlxuXHRcdFx0PC9Cb3g+XG5cblx0XHRcdDxPcmlnaW5hbExpc3Qgey4uLnByb3BzfSAvPlxuXHRcdDwvQm94PlxuXHQpO1xufVxuXG4iLCJpbXBvcnQgeyB1c2VTdGF0ZSwgdHlwZSBNb3VzZUV2ZW50IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgdHlwZSBBY3Rpb25Qcm9wcywgT3JpZ2luYWxTaG93LCB1c2VUcmFuc2xhdGlvbiB9IGZyb20gJ2FkbWluanMnO1xuaW1wb3J0IHsgQm94LCBNb2RhbCwgVGV4dCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBQcm9kdWN0U2hvdyhwcm9wczogQWN0aW9uUHJvcHMpIHtcblx0Y29uc3QgeyByZWNvcmQgfSA9IHByb3BzO1xuXHRjb25zdCB7IHRyYW5zbGF0ZU1lc3NhZ2UgfSA9IHVzZVRyYW5zbGF0aW9uKCk7XG5cdGNvbnN0IG5hbWUgPSBTdHJpbmcocmVjb3JkPy5wYXJhbXM/Lm5hbWUgPz8gJycpO1xuXHRjb25zdCBpbWFnZVVybCA9IChyZWNvcmQ/LnBhcmFtcz8uaW1hZ2VVcmwgYXMgc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCkgPz8gbnVsbDtcblx0Y29uc3Qgc3RhdHVzID0gU3RyaW5nKHJlY29yZD8ucGFyYW1zPy5zdGF0dXMgPz8gJycpO1xuXHRjb25zdCBbaXNPcGVuLCBzZXRJc09wZW5dID0gdXNlU3RhdGUoZmFsc2UpO1xuXG5cdGNvbnN0IG9wZW5JbWFnZSA9IChlPzogTW91c2VFdmVudCkgPT4ge1xuXHRcdGlmIChlKSBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdGlmICghaW1hZ2VVcmwpIHJldHVybjtcblx0XHRzZXRJc09wZW4odHJ1ZSk7XG5cdH07XG5cblx0cmV0dXJuIChcblx0XHQ8Qm94PlxuXHRcdFx0e2lzT3BlbiAmJiBpbWFnZVVybCA/IChcblx0XHRcdFx0PE1vZGFsXG5cdFx0XHRcdFx0b25DbG9zZT17KCkgPT4gc2V0SXNPcGVuKGZhbHNlKX1cblx0XHRcdFx0XHRvbk92ZXJsYXlDbGljaz17KCkgPT4gc2V0SXNPcGVuKGZhbHNlKX1cblx0XHRcdFx0XHRzdHlsZT17e1xuXHRcdFx0XHRcdFx0d2lkdGg6ICc5MnZ3Jyxcblx0XHRcdFx0XHRcdG1heFdpZHRoOiA5ODAsXG5cdFx0XHRcdFx0XHRwYWRkaW5nOiAyNCxcblx0XHRcdFx0XHRcdHBhZGRpbmdUb3A6IDQ4LFxuXHRcdFx0XHRcdH19XG5cdFx0XHRcdD5cblx0XHRcdFx0XHQ8aW1nXG5cdFx0XHRcdFx0XHRzcmM9e2ltYWdlVXJsfVxuXHRcdFx0XHRcdFx0YWx0PXt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWltYWdlLW1vZGFsLWFsdCcpfVxuXHRcdFx0XHRcdFx0c3R5bGU9e3tcblx0XHRcdFx0XHRcdFx0d2lkdGg6ICcxMDAlJyxcblx0XHRcdFx0XHRcdFx0aGVpZ2h0OiAnYXV0bycsXG5cdFx0XHRcdFx0XHRcdG1heEhlaWdodDogJzc4dmgnLFxuXHRcdFx0XHRcdFx0XHRvYmplY3RGaXQ6ICdjb250YWluJyxcblx0XHRcdFx0XHRcdFx0Ym9yZGVyUmFkaXVzOiAxMixcblx0XHRcdFx0XHRcdFx0YmFja2dyb3VuZDogJyNGOEZBRkMnLFxuXHRcdFx0XHRcdFx0XHRkaXNwbGF5OiAnYmxvY2snLFxuXHRcdFx0XHRcdFx0fX1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQ8L01vZGFsPlxuXHRcdFx0KSA6IG51bGx9XG5cblx0XHRcdDxCb3hcblx0XHRcdFx0dmFyaWFudD0nd2hpdGUnXG5cdFx0XHRcdHA9J3h4bCdcblx0XHRcdFx0Ym9yZGVyUmFkaXVzPSd4bCdcblx0XHRcdFx0Ym94U2hhZG93PSdzbSdcblx0XHRcdFx0bWI9J3hsJ1xuXHRcdFx0XHRzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQgI0UyRThGMCcsIGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGdhcDogMTYgfX1cblx0XHRcdD5cblx0XHRcdFx0PEJveFxuXHRcdFx0XHRcdHN0eWxlPXt7XG5cdFx0XHRcdFx0XHR3aWR0aDogMTYwLFxuXHRcdFx0XHRcdFx0aGVpZ2h0OiAxNjAsXG5cdFx0XHRcdFx0XHRib3JkZXJSYWRpdXM6IDE4LFxuXHRcdFx0XHRcdFx0Ym9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnLFxuXHRcdFx0XHRcdFx0YmFja2dyb3VuZDogJyNGOEZBRkMnLFxuXHRcdFx0XHRcdFx0b3ZlcmZsb3c6ICdoaWRkZW4nLFxuXHRcdFx0XHRcdFx0ZmxleFNocmluazogMCxcblx0XHRcdFx0XHR9fVxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0e2ltYWdlVXJsID8gKFxuXHRcdFx0XHRcdFx0PGJ1dHRvblxuXHRcdFx0XHRcdFx0XHR0eXBlPSdidXR0b24nXG5cdFx0XHRcdFx0XHRcdG9uQ2xpY2s9e29wZW5JbWFnZX1cblx0XHRcdFx0XHRcdFx0c3R5bGU9e3tcblx0XHRcdFx0XHRcdFx0XHRhbGw6ICd1bnNldCcsXG5cdFx0XHRcdFx0XHRcdFx0Y3Vyc29yOiAncG9pbnRlcicsXG5cdFx0XHRcdFx0XHRcdFx0ZGlzcGxheTogJ2Jsb2NrJyxcblx0XHRcdFx0XHRcdFx0XHR3aWR0aDogJzEwMCUnLFxuXHRcdFx0XHRcdFx0XHRcdGhlaWdodDogJzEwMCUnLFxuXHRcdFx0XHRcdFx0XHR9fVxuXHRcdFx0XHRcdFx0XHRhcmlhLWxhYmVsPXt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWltYWdlLW1vZGFsLW9wZW4nKX1cblx0XHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdFx0PGltZ1xuXHRcdFx0XHRcdFx0XHRcdHNyYz17aW1hZ2VVcmx9XG5cdFx0XHRcdFx0XHRcdFx0YWx0PScnXG5cdFx0XHRcdFx0XHRcdFx0c3R5bGU9e3sgd2lkdGg6ICcxMDAlJywgaGVpZ2h0OiAnMTAwJScsIG9iamVjdEZpdDogJ2NvdmVyJywgZGlzcGxheTogJ2Jsb2NrJyB9fVxuXHRcdFx0XHRcdFx0XHRcdGxvYWRpbmc9J2xhenknXG5cdFx0XHRcdFx0XHRcdC8+XG5cdFx0XHRcdFx0XHQ8L2J1dHRvbj5cblx0XHRcdFx0XHQpIDogbnVsbH1cblx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdDxCb3ggc3R5bGU9e3sgbWluV2lkdGg6IDAgfX0+XG5cdFx0XHRcdFx0PFRleHRcblx0XHRcdFx0XHRcdGZvbnRXZWlnaHQ9J2JvbGQnXG5cdFx0XHRcdFx0XHRmb250U2l6ZT0neGwnXG5cdFx0XHRcdFx0XHRzdHlsZT17eyB3aGl0ZVNwYWNlOiAnbm93cmFwJywgb3ZlcmZsb3c6ICdoaWRkZW4nLCB0ZXh0T3ZlcmZsb3c6ICdlbGxpcHNpcycgfX1cblx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHR7bmFtZSB8fCAnUHJvZHVjdCd9XG5cdFx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0XHRcdHtzdGF0dXMgPyA8VGV4dCBjb2xvcj0nZ3JleTYwJz57c3RhdHVzfTwvVGV4dD4gOiBudWxsfVxuXHRcdFx0XHQ8L0JveD5cblx0XHRcdDwvQm94PlxuXG5cdFx0XHQ8T3JpZ2luYWxTaG93IHsuLi5wcm9wc30gLz5cblx0XHQ8L0JveD5cblx0KTtcbn1cbiIsImltcG9ydCB7IHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBBcGlDbGllbnQsIHR5cGUgQWN0aW9uUHJvcHMsIHVzZU5vdGljZSwgdXNlVHJhbnNsYXRpb24gfSBmcm9tICdhZG1pbmpzJztcbmltcG9ydCB7IEJveCwgQnV0dG9uLCBGb3JtR3JvdXAsIExhYmVsLCBTZWxlY3QsIFRleHQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcblxuY29uc3QgYXBpID0gbmV3IEFwaUNsaWVudCgpO1xuXG50eXBlIE9wdGlvbiA9IHsgaWQ6IHN0cmluZzsgbGFiZWw6IHN0cmluZyB9O1xuXG5jb25zdCBhY3Rpb25CdXR0b25TdHlsZSA9IHtcblx0Ym9yZGVyQ29sb3I6ICd3aGl0ZScsXG5cdGJhY2tncm91bmQ6ICcjZmFjYzE1Jyxcblx0Y29sb3I6ICdibGFjaycsXG59O1xuXG5jb25zdCByZXNvbHZlUmVjb3JkSWRzID0gKHJlY29yZHM6IEFjdGlvblByb3BzWydyZWNvcmRzJ10pID0+IHtcblx0Y29uc3QgZnJvbVByb3BzID0gKHJlY29yZHMgPz8gW10pLm1hcCgocikgPT4gci5pZCkuZmlsdGVyKEJvb2xlYW4pIGFzIHN0cmluZ1tdO1xuXHRpZiAoZnJvbVByb3BzLmxlbmd0aCkgcmV0dXJuIGZyb21Qcm9wcztcblx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSByZXR1cm4gW107XG5cdGNvbnN0IHJhdyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCkuZ2V0KCdyZWNvcmRJZHMnKSA/PyAnJztcblx0cmV0dXJuIHJhd1xuXHRcdC5zcGxpdCgnLCcpXG5cdFx0Lm1hcCgoaWQpID0+IGlkLnRyaW0oKSlcblx0XHQuZmlsdGVyKEJvb2xlYW4pO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUHJvZHVjdEJ1bGtTZXRDYXRlZ29yeUFjdGlvbih7IGFjdGlvbiwgcmVzb3VyY2UsIHJlY29yZHMgfTogQWN0aW9uUHJvcHMpIHtcblx0Y29uc3QgYWRkTm90aWNlID0gdXNlTm90aWNlKCk7XG5cdGNvbnN0IHsgdHJhbnNsYXRlQWN0aW9uLCB0cmFuc2xhdGVNZXNzYWdlIH0gPSB1c2VUcmFuc2xhdGlvbigpO1xuXG5cdGNvbnN0IHJlY29yZElkcyA9IHVzZU1lbW8oKCkgPT4gcmVzb2x2ZVJlY29yZElkcyhyZWNvcmRzKSwgW3JlY29yZHNdKTtcblx0Y29uc3QgW29wdGlvbnMsIHNldE9wdGlvbnNdID0gdXNlU3RhdGU8T3B0aW9uW10+KFtdKTtcblx0Y29uc3QgW2NhdGVnb3J5SWQsIHNldENhdGVnb3J5SWRdID0gdXNlU3RhdGUoJycpO1xuXHRjb25zdCBbc2F2aW5nLCBzZXRTYXZpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuXHRjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG5cblx0dXNlRWZmZWN0KCgpID0+IHtcblx0XHRpZiAoIXJlY29yZElkcy5sZW5ndGgpIHJldHVybjtcblx0XHRzZXRMb2FkaW5nKHRydWUpO1xuXHRcdGFwaS5idWxrQWN0aW9uKHsgcmVzb3VyY2VJZDogcmVzb3VyY2UuaWQsIHJlY29yZElkcywgYWN0aW9uTmFtZTogYWN0aW9uLm5hbWUsIG1ldGhvZDogJ2dldCcgfSlcblx0XHRcdC50aGVuKChyZXMpID0+IHNldE9wdGlvbnMoKChyZXMuZGF0YSBhcyBhbnkpLnBheWxvYWQ/Lm9wdGlvbnMgPz8gW10pIGFzIE9wdGlvbltdKSlcblx0XHRcdC5jYXRjaCgoKSA9PiBzZXRPcHRpb25zKFtdKSlcblx0XHRcdC5maW5hbGx5KCgpID0+IHNldExvYWRpbmcoZmFsc2UpKTtcblx0fSwgW2FjdGlvbi5uYW1lLCByZWNvcmRJZHMsIHJlc291cmNlLmlkXSk7XG5cblx0Y29uc3QgdGl0bGUgPSB0cmFuc2xhdGVBY3Rpb24oYWN0aW9uLm5hbWUsIHJlc291cmNlLmlkKTtcblxuXHRjb25zdCBoYXNPcHRpb25zID0gb3B0aW9ucy5sZW5ndGggPiAwO1xuXHRjb25zdCBjYW5TYXZlID0gIWxvYWRpbmcgJiYgaGFzT3B0aW9ucyAmJiBjYXRlZ29yeUlkLnRyaW0oKS5sZW5ndGggPiAwICYmIHJlY29yZElkcy5sZW5ndGggPiAwO1xuXG5cdGNvbnN0IGhhbmRsZVNhdmUgPSBhc3luYyAoKSA9PiB7XG5cdFx0aWYgKCFjYW5TYXZlIHx8IHNhdmluZykgcmV0dXJuO1xuXHRcdHNldFNhdmluZyh0cnVlKTtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcblx0XHRcdGZvcm1EYXRhLmFwcGVuZCgnY2F0ZWdvcnlJZCcsIGNhdGVnb3J5SWQpO1xuXHRcdFx0Y29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhcGkuYnVsa0FjdGlvbih7XG5cdFx0XHRcdHJlc291cmNlSWQ6IHJlc291cmNlLmlkLFxuXHRcdFx0XHRyZWNvcmRJZHMsXG5cdFx0XHRcdGFjdGlvbk5hbWU6IGFjdGlvbi5uYW1lLFxuXHRcdFx0XHRtZXRob2Q6ICdwb3N0Jyxcblx0XHRcdFx0ZGF0YTogZm9ybURhdGEsXG5cdFx0XHR9KTtcblx0XHRcdGlmIChyZXNwb25zZS5kYXRhLm5vdGljZSkgYWRkTm90aWNlKHJlc3BvbnNlLmRhdGEubm90aWNlKTtcblx0XHR9IGNhdGNoIHtcblx0XHRcdGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdwcm9kdWN0LWJ1bGstZmFpbGVkJywgdHlwZTogJ2Vycm9yJyB9KTtcblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0c2V0U2F2aW5nKGZhbHNlKTtcblx0XHR9XG5cdH07XG5cblx0cmV0dXJuIChcblx0XHQ8Qm94IHZhcmlhbnQ9J3doaXRlJyBwPSd4eGwnIGJvcmRlclJhZGl1cz0neGwnIGJveFNoYWRvdz0nc20nIHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJyB9fT5cblx0XHRcdDxUZXh0IGZvbnRTaXplPSd4bCcgZm9udFdlaWdodD0nYm9sZCcgbWI9J21kJz5cblx0XHRcdFx0e3RpdGxlfVxuXHRcdFx0PC9UZXh0PlxuXHRcdFx0PFRleHQgY29sb3I9J2dyZXk2MCcgbWI9J3hsJz5cblx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtYnVsay1zZWxlY3RlZCcsIHsgY291bnQ6IHJlY29yZElkcy5sZW5ndGggfSl9XG5cdFx0XHQ8L1RleHQ+XG5cblx0XHRcdHtsb2FkaW5nID8gKFxuXHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJyBtYj0neGwnPlxuXHRcdFx0XHRcdHt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWJ1bGstb3B0aW9ucy1sb2FkaW5nJyl9XG5cdFx0XHRcdDwvVGV4dD5cblx0XHRcdCkgOiBoYXNPcHRpb25zID8gKFxuXHRcdFx0XHQ8Rm9ybUdyb3VwPlxuXHRcdFx0XHRcdDxMYWJlbD57dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1idWxrLWNhdGVnb3J5Jyl9PC9MYWJlbD5cblx0XHRcdFx0XHQ8U2VsZWN0IHZhbHVlPXtjYXRlZ29yeUlkfSBvbkNoYW5nZT17KGU6IGFueSkgPT4gc2V0Q2F0ZWdvcnlJZChTdHJpbmcoZT8udGFyZ2V0Py52YWx1ZSA/PyAnJykpfT5cblx0XHRcdFx0XHRcdDxvcHRpb24gdmFsdWU9Jyc+e3RyYW5zbGF0ZU1lc3NhZ2UoJ3NlbGVjdC1wbGFjZWhvbGRlcicpfTwvb3B0aW9uPlxuXHRcdFx0XHRcdFx0e29wdGlvbnMubWFwKChvKSA9PiAoXG5cdFx0XHRcdFx0XHRcdDxvcHRpb24ga2V5PXtvLmlkfSB2YWx1ZT17by5pZH0+XG5cdFx0XHRcdFx0XHRcdFx0e28ubGFiZWx9XG5cdFx0XHRcdFx0XHRcdDwvb3B0aW9uPlxuXHRcdFx0XHRcdFx0KSl9XG5cdFx0XHRcdFx0PC9TZWxlY3Q+XG5cdFx0XHRcdDwvRm9ybUdyb3VwPlxuXHRcdFx0KSA6IChcblx0XHRcdFx0PFRleHQgY29sb3I9J2dyZXk2MCcgbWI9J3hsJz5cblx0XHRcdFx0XHR7dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1idWxrLW5vLW9wdGlvbnMnKX1cblx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0KX1cblxuXHRcdFx0e2hhc09wdGlvbnMgPyAoXG5cdFx0XHRcdDxCb3ggbXQ9J3hsJz5cblx0XHRcdFx0XHQ8QnV0dG9uXG5cdFx0XHRcdFx0XHR2YXJpYW50PSdjb250YWluZWQnXG5cdFx0XHRcdFx0XHRjb2xvcj0ncHJpbWFyeSdcblx0XHRcdFx0XHRcdHN0eWxlPXthY3Rpb25CdXR0b25TdHlsZX1cblx0XHRcdFx0XHRcdGRpc2FibGVkPXshY2FuU2F2ZSB8fCBzYXZpbmd9XG5cdFx0XHRcdFx0XHRvbkNsaWNrPXtoYW5kbGVTYXZlfVxuXHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdHtzYXZpbmcgPyB0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWJ1bGstc2F2aW5nJykgOiB0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWJ1bGstYXBwbHknKX1cblx0XHRcdFx0XHQ8L0J1dHRvbj5cblx0XHRcdFx0PC9Cb3g+XG5cdFx0XHQpIDogbnVsbH1cblx0XHQ8L0JveD5cblx0KTtcbn1cbiIsImltcG9ydCB7IHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBBcGlDbGllbnQsIHR5cGUgQWN0aW9uUHJvcHMsIHVzZU5vdGljZSwgdXNlVHJhbnNsYXRpb24gfSBmcm9tICdhZG1pbmpzJztcbmltcG9ydCB7IEJveCwgQnV0dG9uLCBGb3JtR3JvdXAsIExhYmVsLCBTZWxlY3QsIFRleHQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcblxuY29uc3QgYXBpID0gbmV3IEFwaUNsaWVudCgpO1xuXG50eXBlIE9wdGlvbiA9IHsgaWQ6IHN0cmluZzsgbGFiZWw6IHN0cmluZyB9O1xuXG5jb25zdCBhY3Rpb25CdXR0b25TdHlsZSA9IHtcblx0Ym9yZGVyQ29sb3I6ICd3aGl0ZScsXG5cdGJhY2tncm91bmQ6ICcjZmFjYzE1Jyxcblx0Y29sb3I6ICdibGFjaycsXG59O1xuXG5jb25zdCByZXNvbHZlUmVjb3JkSWRzID0gKHJlY29yZHM6IEFjdGlvblByb3BzWydyZWNvcmRzJ10pID0+IHtcblx0Y29uc3QgZnJvbVByb3BzID0gKHJlY29yZHMgPz8gW10pLm1hcCgocikgPT4gci5pZCkuZmlsdGVyKEJvb2xlYW4pIGFzIHN0cmluZ1tdO1xuXHRpZiAoZnJvbVByb3BzLmxlbmd0aCkgcmV0dXJuIGZyb21Qcm9wcztcblx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSByZXR1cm4gW107XG5cdGNvbnN0IHJhdyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCkuZ2V0KCdyZWNvcmRJZHMnKSA/PyAnJztcblx0cmV0dXJuIHJhd1xuXHRcdC5zcGxpdCgnLCcpXG5cdFx0Lm1hcCgoaWQpID0+IGlkLnRyaW0oKSlcblx0XHQuZmlsdGVyKEJvb2xlYW4pO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUHJvZHVjdEJ1bGtTZXRCcmFuZEFjdGlvbih7IGFjdGlvbiwgcmVzb3VyY2UsIHJlY29yZHMgfTogQWN0aW9uUHJvcHMpIHtcblx0Y29uc3QgYWRkTm90aWNlID0gdXNlTm90aWNlKCk7XG5cdGNvbnN0IHsgdHJhbnNsYXRlQWN0aW9uLCB0cmFuc2xhdGVNZXNzYWdlIH0gPSB1c2VUcmFuc2xhdGlvbigpO1xuXG5cdGNvbnN0IHJlY29yZElkcyA9IHVzZU1lbW8oKCkgPT4gcmVzb2x2ZVJlY29yZElkcyhyZWNvcmRzKSwgW3JlY29yZHNdKTtcblx0Y29uc3QgW29wdGlvbnMsIHNldE9wdGlvbnNdID0gdXNlU3RhdGU8T3B0aW9uW10+KFtdKTtcblx0Y29uc3QgW2JyYW5kSWQsIHNldEJyYW5kSWRdID0gdXNlU3RhdGUoJycpO1xuXHRjb25zdCBbc2F2aW5nLCBzZXRTYXZpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuXHRjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG5cblx0dXNlRWZmZWN0KCgpID0+IHtcblx0XHRpZiAoIXJlY29yZElkcy5sZW5ndGgpIHJldHVybjtcblx0XHRzZXRMb2FkaW5nKHRydWUpO1xuXHRcdGFwaS5idWxrQWN0aW9uKHsgcmVzb3VyY2VJZDogcmVzb3VyY2UuaWQsIHJlY29yZElkcywgYWN0aW9uTmFtZTogYWN0aW9uLm5hbWUsIG1ldGhvZDogJ2dldCcgfSlcblx0XHRcdC50aGVuKChyZXMpID0+IHNldE9wdGlvbnMoKChyZXMuZGF0YSBhcyBhbnkpLnBheWxvYWQ/Lm9wdGlvbnMgPz8gW10pIGFzIE9wdGlvbltdKSlcblx0XHRcdC5jYXRjaCgoKSA9PiBzZXRPcHRpb25zKFtdKSlcblx0XHRcdC5maW5hbGx5KCgpID0+IHNldExvYWRpbmcoZmFsc2UpKTtcblx0fSwgW2FjdGlvbi5uYW1lLCByZWNvcmRJZHMsIHJlc291cmNlLmlkXSk7XG5cblx0Y29uc3QgdGl0bGUgPSB0cmFuc2xhdGVBY3Rpb24oYWN0aW9uLm5hbWUsIHJlc291cmNlLmlkKTtcblx0Y29uc3QgaGFzT3B0aW9ucyA9IG9wdGlvbnMubGVuZ3RoID4gMDtcblx0Y29uc3QgY2FuU2F2ZSA9ICFsb2FkaW5nICYmIGhhc09wdGlvbnMgJiYgYnJhbmRJZC50cmltKCkubGVuZ3RoID4gMCAmJiByZWNvcmRJZHMubGVuZ3RoID4gMDtcblxuXHRjb25zdCBoYW5kbGVTYXZlID0gYXN5bmMgKCkgPT4ge1xuXHRcdGlmICghY2FuU2F2ZSB8fCBzYXZpbmcpIHJldHVybjtcblx0XHRzZXRTYXZpbmcodHJ1ZSk7XG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG5cdFx0XHRmb3JtRGF0YS5hcHBlbmQoJ2JyYW5kSWQnLCBicmFuZElkKTtcblx0XHRcdGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXBpLmJ1bGtBY3Rpb24oe1xuXHRcdFx0XHRyZXNvdXJjZUlkOiByZXNvdXJjZS5pZCxcblx0XHRcdFx0cmVjb3JkSWRzLFxuXHRcdFx0XHRhY3Rpb25OYW1lOiBhY3Rpb24ubmFtZSxcblx0XHRcdFx0bWV0aG9kOiAncG9zdCcsXG5cdFx0XHRcdGRhdGE6IGZvcm1EYXRhLFxuXHRcdFx0fSk7XG5cdFx0XHRpZiAocmVzcG9uc2UuZGF0YS5ub3RpY2UpIGFkZE5vdGljZShyZXNwb25zZS5kYXRhLm5vdGljZSk7XG5cdFx0fSBjYXRjaCB7XG5cdFx0XHRhZGROb3RpY2UoeyBtZXNzYWdlOiAncHJvZHVjdC1idWxrLWZhaWxlZCcsIHR5cGU6ICdlcnJvcicgfSk7XG5cdFx0fSBmaW5hbGx5IHtcblx0XHRcdHNldFNhdmluZyhmYWxzZSk7XG5cdFx0fVxuXHR9O1xuXG5cdHJldHVybiAoXG5cdFx0PEJveCB2YXJpYW50PSd3aGl0ZScgcD0neHhsJyBib3JkZXJSYWRpdXM9J3hsJyBib3hTaGFkb3c9J3NtJyBzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQgI0UyRThGMCcgfX0+XG5cdFx0XHQ8VGV4dCBmb250U2l6ZT0neGwnIGZvbnRXZWlnaHQ9J2JvbGQnIG1iPSdtZCc+XG5cdFx0XHRcdHt0aXRsZX1cblx0XHRcdDwvVGV4dD5cblx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnIG1iPSd4bCc+XG5cdFx0XHRcdHt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWJ1bGstc2VsZWN0ZWQnLCB7IGNvdW50OiByZWNvcmRJZHMubGVuZ3RoIH0pfVxuXHRcdFx0PC9UZXh0PlxuXG5cdFx0XHR7bG9hZGluZyA/IChcblx0XHRcdFx0PFRleHQgY29sb3I9J2dyZXk2MCcgbWI9J3hsJz5cblx0XHRcdFx0XHR7dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1idWxrLW9wdGlvbnMtbG9hZGluZycpfVxuXHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHQpIDogaGFzT3B0aW9ucyA/IChcblx0XHRcdFx0PEZvcm1Hcm91cD5cblx0XHRcdFx0XHQ8TGFiZWw+e3RyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtYnVsay1icmFuZCcpfTwvTGFiZWw+XG5cdFx0XHRcdFx0PFNlbGVjdCB2YWx1ZT17YnJhbmRJZH0gb25DaGFuZ2U9eyhlOiBhbnkpID0+IHNldEJyYW5kSWQoU3RyaW5nKGU/LnRhcmdldD8udmFsdWUgPz8gJycpKX0+XG5cdFx0XHRcdFx0XHQ8b3B0aW9uIHZhbHVlPScnPnt0cmFuc2xhdGVNZXNzYWdlKCdzZWxlY3QtcGxhY2Vob2xkZXInKX08L29wdGlvbj5cblx0XHRcdFx0XHRcdHtvcHRpb25zLm1hcCgobykgPT4gKFxuXHRcdFx0XHRcdFx0XHQ8b3B0aW9uIGtleT17by5pZH0gdmFsdWU9e28uaWR9PlxuXHRcdFx0XHRcdFx0XHRcdHtvLmxhYmVsfVxuXHRcdFx0XHRcdFx0XHQ8L29wdGlvbj5cblx0XHRcdFx0XHRcdCkpfVxuXHRcdFx0XHRcdDwvU2VsZWN0PlxuXHRcdFx0XHQ8L0Zvcm1Hcm91cD5cblx0XHRcdCkgOiAoXG5cdFx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnIG1iPSd4bCc+XG5cdFx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtYnVsay1uby1vcHRpb25zJyl9XG5cdFx0XHRcdDwvVGV4dD5cblx0XHRcdCl9XG5cblx0XHRcdHtoYXNPcHRpb25zID8gKFxuXHRcdFx0XHQ8Qm94IG10PSd4bCc+XG5cdFx0XHRcdFx0PEJ1dHRvblxuXHRcdFx0XHRcdFx0dmFyaWFudD0nY29udGFpbmVkJ1xuXHRcdFx0XHRcdFx0Y29sb3I9J3ByaW1hcnknXG5cdFx0XHRcdFx0XHRzdHlsZT17YWN0aW9uQnV0dG9uU3R5bGV9XG5cdFx0XHRcdFx0XHRkaXNhYmxlZD17IWNhblNhdmUgfHwgc2F2aW5nfVxuXHRcdFx0XHRcdFx0b25DbGljaz17aGFuZGxlU2F2ZX1cblx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHR7c2F2aW5nID8gdHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1idWxrLXNhdmluZycpIDogdHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1idWxrLWFwcGx5Jyl9XG5cdFx0XHRcdFx0PC9CdXR0b24+XG5cdFx0XHRcdDwvQm94PlxuXHRcdFx0KSA6IG51bGx9XG5cdFx0PC9Cb3g+XG5cdCk7XG59XG4iLCJpbXBvcnQgeyB1c2VNZW1vLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEFwaUNsaWVudCwgdHlwZSBBY3Rpb25Qcm9wcywgdXNlTm90aWNlLCB1c2VUcmFuc2xhdGlvbiB9IGZyb20gJ2FkbWluanMnO1xuaW1wb3J0IHsgQm94LCBCdXR0b24sIEZvcm1Hcm91cCwgTGFiZWwsIFNlbGVjdCwgVGV4dCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xuXG5jb25zdCBhcGkgPSBuZXcgQXBpQ2xpZW50KCk7XG5cbmNvbnN0IGFjdGlvbkJ1dHRvblN0eWxlID0ge1xuXHRib3JkZXJDb2xvcjogJ3doaXRlJyxcblx0YmFja2dyb3VuZDogJyNmYWNjMTUnLFxuXHRjb2xvcjogJ2JsYWNrJyxcbn07XG5cbmNvbnN0IHJlc29sdmVSZWNvcmRJZHMgPSAocmVjb3JkczogQWN0aW9uUHJvcHNbJ3JlY29yZHMnXSkgPT4ge1xuXHRjb25zdCBmcm9tUHJvcHMgPSAocmVjb3JkcyA/PyBbXSkubWFwKChyKSA9PiByLmlkKS5maWx0ZXIoQm9vbGVhbikgYXMgc3RyaW5nW107XG5cdGlmIChmcm9tUHJvcHMubGVuZ3RoKSByZXR1cm4gZnJvbVByb3BzO1xuXHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybiBbXTtcblx0Y29uc3QgcmF3ID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKS5nZXQoJ3JlY29yZElkcycpID8/ICcnO1xuXHRyZXR1cm4gcmF3XG5cdFx0LnNwbGl0KCcsJylcblx0XHQubWFwKChpZCkgPT4gaWQudHJpbSgpKVxuXHRcdC5maWx0ZXIoQm9vbGVhbik7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBQcm9kdWN0QnVsa0VkaXRUYWdzQWN0aW9uKHsgYWN0aW9uLCByZXNvdXJjZSwgcmVjb3JkcyB9OiBBY3Rpb25Qcm9wcykge1xuXHRjb25zdCBhZGROb3RpY2UgPSB1c2VOb3RpY2UoKTtcblx0Y29uc3QgeyB0cmFuc2xhdGVBY3Rpb24sIHRyYW5zbGF0ZU1lc3NhZ2UgfSA9IHVzZVRyYW5zbGF0aW9uKCk7XG5cblx0Y29uc3QgcmVjb3JkSWRzID0gdXNlTWVtbygoKSA9PiByZXNvbHZlUmVjb3JkSWRzKHJlY29yZHMpLCBbcmVjb3Jkc10pO1xuXHRjb25zdCBbbW9kZSwgc2V0TW9kZV0gPSB1c2VTdGF0ZTwnYWRkJyB8ICdyZW1vdmUnIHwgJ3JlcGxhY2UnPignYWRkJyk7XG5cdGNvbnN0IFt0YWdzLCBzZXRUYWdzXSA9IHVzZVN0YXRlKCcnKTtcblx0Y29uc3QgW3NhdmluZywgc2V0U2F2aW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuXHRjb25zdCB0aXRsZSA9IHRyYW5zbGF0ZUFjdGlvbihhY3Rpb24ubmFtZSwgcmVzb3VyY2UuaWQpO1xuXHRjb25zdCBjYW5TYXZlID0gcmVjb3JkSWRzLmxlbmd0aCA+IDAgJiYgdGFncy50cmltKCkubGVuZ3RoID4gMDtcblxuXHRjb25zdCBoYW5kbGVTYXZlID0gYXN5bmMgKCkgPT4ge1xuXHRcdGlmICghY2FuU2F2ZSB8fCBzYXZpbmcpIHJldHVybjtcblx0XHRzZXRTYXZpbmcodHJ1ZSk7XG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG5cdFx0XHRmb3JtRGF0YS5hcHBlbmQoJ21vZGUnLCBtb2RlKTtcblx0XHRcdGZvcm1EYXRhLmFwcGVuZCgndGFncycsIHRhZ3MpO1xuXHRcdFx0Y29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhcGkuYnVsa0FjdGlvbih7XG5cdFx0XHRcdHJlc291cmNlSWQ6IHJlc291cmNlLmlkLFxuXHRcdFx0XHRyZWNvcmRJZHMsXG5cdFx0XHRcdGFjdGlvbk5hbWU6IGFjdGlvbi5uYW1lLFxuXHRcdFx0XHRtZXRob2Q6ICdwb3N0Jyxcblx0XHRcdFx0ZGF0YTogZm9ybURhdGEsXG5cdFx0XHR9KTtcblx0XHRcdGlmIChyZXNwb25zZS5kYXRhLm5vdGljZSkgYWRkTm90aWNlKHJlc3BvbnNlLmRhdGEubm90aWNlKTtcblx0XHR9IGNhdGNoIHtcblx0XHRcdGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdwcm9kdWN0LWJ1bGstZmFpbGVkJywgdHlwZTogJ2Vycm9yJyB9KTtcblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0c2V0U2F2aW5nKGZhbHNlKTtcblx0XHR9XG5cdH07XG5cblx0cmV0dXJuIChcblx0XHQ8Qm94IHZhcmlhbnQ9J3doaXRlJyBwPSd4eGwnIGJvcmRlclJhZGl1cz0neGwnIGJveFNoYWRvdz0nc20nIHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJyB9fT5cblx0XHRcdDxUZXh0IGZvbnRTaXplPSd4bCcgZm9udFdlaWdodD0nYm9sZCcgbWI9J21kJz5cblx0XHRcdFx0e3RpdGxlfVxuXHRcdFx0PC9UZXh0PlxuXHRcdFx0PFRleHQgY29sb3I9J2dyZXk2MCcgbWI9J3hsJz5cblx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtYnVsay1zZWxlY3RlZCcsIHsgY291bnQ6IHJlY29yZElkcy5sZW5ndGggfSl9XG5cdFx0XHQ8L1RleHQ+XG5cblx0XHRcdDxGb3JtR3JvdXA+XG5cdFx0XHRcdDxMYWJlbD57dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1idWxrLXRhZ3MtbW9kZScpfTwvTGFiZWw+XG5cdFx0XHRcdDxTZWxlY3QgdmFsdWU9e21vZGV9IG9uQ2hhbmdlPXsoZTogYW55KSA9PiBzZXRNb2RlKFN0cmluZyhlPy50YXJnZXQ/LnZhbHVlID8/ICdhZGQnKSBhcyBhbnkpfT5cblx0XHRcdFx0XHQ8b3B0aW9uIHZhbHVlPSdhZGQnPnt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWJ1bGstdGFncy1hZGQnKX08L29wdGlvbj5cblx0XHRcdFx0XHQ8b3B0aW9uIHZhbHVlPSdyZW1vdmUnPnt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWJ1bGstdGFncy1yZW1vdmUnKX08L29wdGlvbj5cblx0XHRcdFx0XHQ8b3B0aW9uIHZhbHVlPSdyZXBsYWNlJz57dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1idWxrLXRhZ3MtcmVwbGFjZScpfTwvb3B0aW9uPlxuXHRcdFx0XHQ8L1NlbGVjdD5cblx0XHRcdDwvRm9ybUdyb3VwPlxuXG5cdFx0XHQ8Rm9ybUdyb3VwPlxuXHRcdFx0XHQ8TGFiZWw+e3RyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtYnVsay10YWdzJyl9PC9MYWJlbD5cblx0XHRcdFx0PGlucHV0XG5cdFx0XHRcdFx0dmFsdWU9e3RhZ3N9XG5cdFx0XHRcdFx0b25DaGFuZ2U9eyhlKSA9PiBzZXRUYWdzKGUudGFyZ2V0LnZhbHVlKX1cblx0XHRcdFx0XHRwbGFjZWhvbGRlcj0ncG9wdWxhcixuZXcnXG5cdFx0XHRcdFx0c3R5bGU9e3tcblx0XHRcdFx0XHRcdHdpZHRoOiAnMTAwJScsXG5cdFx0XHRcdFx0XHRwYWRkaW5nOiAnMTBweCAxMnB4Jyxcblx0XHRcdFx0XHRcdGJvcmRlclJhZGl1czogOCxcblx0XHRcdFx0XHRcdGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJyxcblx0XHRcdFx0XHRcdGZvbnRTaXplOiAxNCxcblx0XHRcdFx0XHR9fVxuXHRcdFx0XHQvPlxuXHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJyBtdD0nZGVmYXVsdCc+XG5cdFx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtYnVsay10YWdzLWhpbnQnKX1cblx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0PC9Gb3JtR3JvdXA+XG5cblx0XHRcdDxCb3ggbXQ9J3hsJz5cblx0XHRcdFx0PEJ1dHRvbiB2YXJpYW50PSdjb250YWluZWQnIGNvbG9yPSdwcmltYXJ5JyBzdHlsZT17YWN0aW9uQnV0dG9uU3R5bGV9IGRpc2FibGVkPXshY2FuU2F2ZSB8fCBzYXZpbmd9IG9uQ2xpY2s9e2hhbmRsZVNhdmV9PlxuXHRcdFx0XHRcdHtzYXZpbmcgPyB0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWJ1bGstc2F2aW5nJykgOiB0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWJ1bGstYXBwbHknKX1cblx0XHRcdFx0PC9CdXR0b24+XG5cdFx0XHQ8L0JveD5cblx0XHQ8L0JveD5cblx0KTtcbn1cbiIsImltcG9ydCB7IHVzZU1lbW8sIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQXBpQ2xpZW50LCB0eXBlIEFjdGlvblByb3BzLCB1c2VOb3RpY2UsIHVzZVRyYW5zbGF0aW9uIH0gZnJvbSAnYWRtaW5qcyc7XG5pbXBvcnQgeyBCb3gsIEJ1dHRvbiwgRm9ybUdyb3VwLCBMYWJlbCwgU2VsZWN0LCBUZXh0IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSc7XG5cbmNvbnN0IGFwaSA9IG5ldyBBcGlDbGllbnQoKTtcblxuY29uc3QgYWN0aW9uQnV0dG9uU3R5bGUgPSB7XG5cdGJvcmRlckNvbG9yOiAnd2hpdGUnLFxuXHRiYWNrZ3JvdW5kOiAnI2ZhY2MxNScsXG5cdGNvbG9yOiAnYmxhY2snLFxufTtcblxuY29uc3QgcmVzb2x2ZVJlY29yZElkcyA9IChyZWNvcmRzOiBBY3Rpb25Qcm9wc1sncmVjb3JkcyddKSA9PiB7XG5cdGNvbnN0IGZyb21Qcm9wcyA9IChyZWNvcmRzID8/IFtdKS5tYXAoKHIpID0+IHIuaWQpLmZpbHRlcihCb29sZWFuKSBhcyBzdHJpbmdbXTtcblx0aWYgKGZyb21Qcm9wcy5sZW5ndGgpIHJldHVybiBmcm9tUHJvcHM7XG5cdGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykgcmV0dXJuIFtdO1xuXHRjb25zdCByYXcgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpLmdldCgncmVjb3JkSWRzJykgPz8gJyc7XG5cdHJldHVybiByYXdcblx0XHQuc3BsaXQoJywnKVxuXHRcdC5tYXAoKGlkKSA9PiBpZC50cmltKCkpXG5cdFx0LmZpbHRlcihCb29sZWFuKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFByb2R1Y3RCdWxrQWRqdXN0UHJpY2VBY3Rpb24oeyBhY3Rpb24sIHJlc291cmNlLCByZWNvcmRzIH06IEFjdGlvblByb3BzKSB7XG5cdGNvbnN0IGFkZE5vdGljZSA9IHVzZU5vdGljZSgpO1xuXHRjb25zdCB7IHRyYW5zbGF0ZUFjdGlvbiwgdHJhbnNsYXRlTWVzc2FnZSB9ID0gdXNlVHJhbnNsYXRpb24oKTtcblxuXHRjb25zdCByZWNvcmRJZHMgPSB1c2VNZW1vKCgpID0+IHJlc29sdmVSZWNvcmRJZHMocmVjb3JkcyksIFtyZWNvcmRzXSk7XG5cdGNvbnN0IFtkaXJlY3Rpb24sIHNldERpcmVjdGlvbl0gPSB1c2VTdGF0ZTwnaW5jcmVhc2UnIHwgJ2RlY3JlYXNlJz4oJ2luY3JlYXNlJyk7XG5cdGNvbnN0IFtraW5kLCBzZXRLaW5kXSA9IHVzZVN0YXRlPCdwZXJjZW50JyB8ICdmaXhlZCc+KCdwZXJjZW50Jyk7XG5cdGNvbnN0IFt2YWx1ZSwgc2V0VmFsdWVdID0gdXNlU3RhdGUoJzEwJyk7XG5cdGNvbnN0IFthcHBseVRvRGlzY291bnQsIHNldEFwcGx5VG9EaXNjb3VudF0gPSB1c2VTdGF0ZShmYWxzZSk7XG5cdGNvbnN0IFtzYXZpbmcsIHNldFNhdmluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG5cblx0Y29uc3QgdGl0bGUgPSB0cmFuc2xhdGVBY3Rpb24oYWN0aW9uLm5hbWUsIHJlc291cmNlLmlkKTtcblx0Y29uc3QgcGFyc2VkVmFsdWUgPSBOdW1iZXIodmFsdWUpO1xuXHRjb25zdCBjYW5TYXZlID0gcmVjb3JkSWRzLmxlbmd0aCA+IDAgJiYgTnVtYmVyLmlzRmluaXRlKHBhcnNlZFZhbHVlKSAmJiBwYXJzZWRWYWx1ZSA+IDA7XG5cblx0Y29uc3QgaGFuZGxlU2F2ZSA9IGFzeW5jICgpID0+IHtcblx0XHRpZiAoIWNhblNhdmUgfHwgc2F2aW5nKSByZXR1cm47XG5cdFx0c2V0U2F2aW5nKHRydWUpO1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuXHRcdFx0Zm9ybURhdGEuYXBwZW5kKCdkaXJlY3Rpb24nLCBkaXJlY3Rpb24pO1xuXHRcdFx0Zm9ybURhdGEuYXBwZW5kKCdraW5kJywga2luZCk7XG5cdFx0XHRmb3JtRGF0YS5hcHBlbmQoJ3ZhbHVlJywgdmFsdWUpO1xuXHRcdFx0Zm9ybURhdGEuYXBwZW5kKCdhcHBseVRvRGlzY291bnQnLCBTdHJpbmcoYXBwbHlUb0Rpc2NvdW50KSk7XG5cdFx0XHRjb25zdCByZXNwb25zZSA9IGF3YWl0IGFwaS5idWxrQWN0aW9uKHtcblx0XHRcdFx0cmVzb3VyY2VJZDogcmVzb3VyY2UuaWQsXG5cdFx0XHRcdHJlY29yZElkcyxcblx0XHRcdFx0YWN0aW9uTmFtZTogYWN0aW9uLm5hbWUsXG5cdFx0XHRcdG1ldGhvZDogJ3Bvc3QnLFxuXHRcdFx0XHRkYXRhOiBmb3JtRGF0YSxcblx0XHRcdH0pO1xuXHRcdFx0aWYgKHJlc3BvbnNlLmRhdGEubm90aWNlKSBhZGROb3RpY2UocmVzcG9uc2UuZGF0YS5ub3RpY2UpO1xuXHRcdH0gY2F0Y2gge1xuXHRcdFx0YWRkTm90aWNlKHsgbWVzc2FnZTogJ3Byb2R1Y3QtYnVsay1mYWlsZWQnLCB0eXBlOiAnZXJyb3InIH0pO1xuXHRcdH0gZmluYWxseSB7XG5cdFx0XHRzZXRTYXZpbmcoZmFsc2UpO1xuXHRcdH1cblx0fTtcblxuXHRyZXR1cm4gKFxuXHRcdDxCb3ggdmFyaWFudD0nd2hpdGUnIHA9J3h4bCcgYm9yZGVyUmFkaXVzPSd4bCcgYm94U2hhZG93PSdzbScgc3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnIH19PlxuXHRcdFx0PFRleHQgZm9udFNpemU9J3hsJyBmb250V2VpZ2h0PSdib2xkJyBtYj0nbWQnPlxuXHRcdFx0XHR7dGl0bGV9XG5cdFx0XHQ8L1RleHQ+XG5cdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJyBtYj0neGwnPlxuXHRcdFx0XHR7dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1idWxrLXNlbGVjdGVkJywgeyBjb3VudDogcmVjb3JkSWRzLmxlbmd0aCB9KX1cblx0XHRcdDwvVGV4dD5cblxuXHRcdFx0PEJveCBzdHlsZT17eyBkaXNwbGF5OiAnZ3JpZCcsIGdyaWRUZW1wbGF0ZUNvbHVtbnM6ICdyZXBlYXQoYXV0by1maXQsIG1pbm1heCgyMjBweCwgMWZyKSknLCBnYXA6IDEyIH19PlxuXHRcdFx0XHQ8Rm9ybUdyb3VwPlxuXHRcdFx0XHRcdDxMYWJlbD57dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1idWxrLXByaWNlLWRpcmVjdGlvbicpfTwvTGFiZWw+XG5cdFx0XHRcdFx0PFNlbGVjdCB2YWx1ZT17ZGlyZWN0aW9ufSBvbkNoYW5nZT17KGU6IGFueSkgPT4gc2V0RGlyZWN0aW9uKFN0cmluZyhlPy50YXJnZXQ/LnZhbHVlID8/ICdpbmNyZWFzZScpIGFzIGFueSl9PlxuXHRcdFx0XHRcdFx0PG9wdGlvbiB2YWx1ZT0naW5jcmVhc2UnPnt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWJ1bGstcHJpY2UtaW5jcmVhc2UnKX08L29wdGlvbj5cblx0XHRcdFx0XHRcdDxvcHRpb24gdmFsdWU9J2RlY3JlYXNlJz57dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1idWxrLXByaWNlLWRlY3JlYXNlJyl9PC9vcHRpb24+XG5cdFx0XHRcdFx0PC9TZWxlY3Q+XG5cdFx0XHRcdDwvRm9ybUdyb3VwPlxuXHRcdFx0XHQ8Rm9ybUdyb3VwPlxuXHRcdFx0XHRcdDxMYWJlbD57dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1idWxrLXByaWNlLWtpbmQnKX08L0xhYmVsPlxuXHRcdFx0XHRcdDxTZWxlY3QgdmFsdWU9e2tpbmR9IG9uQ2hhbmdlPXsoZTogYW55KSA9PiBzZXRLaW5kKFN0cmluZyhlPy50YXJnZXQ/LnZhbHVlID8/ICdwZXJjZW50JykgYXMgYW55KX0+XG5cdFx0XHRcdFx0XHQ8b3B0aW9uIHZhbHVlPSdwZXJjZW50Jz57dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1idWxrLXByaWNlLXBlcmNlbnQnKX08L29wdGlvbj5cblx0XHRcdFx0XHRcdDxvcHRpb24gdmFsdWU9J2ZpeGVkJz57dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1idWxrLXByaWNlLWZpeGVkJyl9PC9vcHRpb24+XG5cdFx0XHRcdFx0PC9TZWxlY3Q+XG5cdFx0XHRcdDwvRm9ybUdyb3VwPlxuXHRcdFx0XHQ8Rm9ybUdyb3VwPlxuXHRcdFx0XHRcdDxMYWJlbD57dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1idWxrLXByaWNlLXZhbHVlJyl9PC9MYWJlbD5cblx0XHRcdFx0XHQ8aW5wdXRcblx0XHRcdFx0XHRcdHR5cGU9J251bWJlcidcblx0XHRcdFx0XHRcdHN0ZXA9JzAuMDEnXG5cdFx0XHRcdFx0XHR2YWx1ZT17dmFsdWV9XG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17KGUpID0+IHNldFZhbHVlKGUudGFyZ2V0LnZhbHVlKX1cblx0XHRcdFx0XHRcdHN0eWxlPXt7XG5cdFx0XHRcdFx0XHRcdHdpZHRoOiAnMTAwJScsXG5cdFx0XHRcdFx0XHRcdHBhZGRpbmc6ICcxMHB4IDEycHgnLFxuXHRcdFx0XHRcdFx0XHRib3JkZXJSYWRpdXM6IDgsXG5cdFx0XHRcdFx0XHRcdGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJyxcblx0XHRcdFx0XHRcdFx0Zm9udFNpemU6IDE0LFxuXHRcdFx0XHRcdFx0fX1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQ8L0Zvcm1Hcm91cD5cblx0XHRcdDwvQm94PlxuXG5cdFx0XHQ8Qm94IG10PSdsZyc+XG5cdFx0XHRcdDxsYWJlbCBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGdhcDogMTAsIGFsaWduSXRlbXM6ICdjZW50ZXInIH19PlxuXHRcdFx0XHRcdDxpbnB1dCB0eXBlPSdjaGVja2JveCcgY2hlY2tlZD17YXBwbHlUb0Rpc2NvdW50fSBvbkNoYW5nZT17KGUpID0+IHNldEFwcGx5VG9EaXNjb3VudChlLnRhcmdldC5jaGVja2VkKX0gLz5cblx0XHRcdFx0XHQ8VGV4dD57dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1idWxrLXByaWNlLWFwcGx5LWRpc2NvdW50Jyl9PC9UZXh0PlxuXHRcdFx0XHQ8L2xhYmVsPlxuXHRcdFx0PC9Cb3g+XG5cblx0XHRcdDxCb3ggbXQ9J3hsJz5cblx0XHRcdFx0PEJ1dHRvbiB2YXJpYW50PSdjb250YWluZWQnIGNvbG9yPSdwcmltYXJ5JyBzdHlsZT17YWN0aW9uQnV0dG9uU3R5bGV9IGRpc2FibGVkPXshY2FuU2F2ZSB8fCBzYXZpbmd9IG9uQ2xpY2s9e2hhbmRsZVNhdmV9PlxuXHRcdFx0XHRcdHtzYXZpbmcgPyB0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWJ1bGstc2F2aW5nJykgOiB0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWJ1bGstYXBwbHknKX1cblx0XHRcdFx0PC9CdXR0b24+XG5cdFx0XHQ8L0JveD5cblx0XHQ8L0JveD5cblx0KTtcbn1cbiIsImltcG9ydCB7IHVzZU1lbW8sIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQXBpQ2xpZW50LCB0eXBlIEFjdGlvblByb3BzLCB1c2VOb3RpY2UsIHVzZVRyYW5zbGF0aW9uIH0gZnJvbSAnYWRtaW5qcyc7XG5pbXBvcnQgeyBCb3gsIEJ1dHRvbiwgRm9ybUdyb3VwLCBMYWJlbCwgU2VsZWN0LCBUZXh0IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSc7XG5cbmNvbnN0IGFwaSA9IG5ldyBBcGlDbGllbnQoKTtcblxuY29uc3QgYWN0aW9uQnV0dG9uU3R5bGUgPSB7XG5cdGJvcmRlckNvbG9yOiAnd2hpdGUnLFxuXHRiYWNrZ3JvdW5kOiAnI2ZhY2MxNScsXG5cdGNvbG9yOiAnYmxhY2snLFxufTtcblxuY29uc3QgcmVzb2x2ZVJlY29yZElkcyA9IChyZWNvcmRzOiBBY3Rpb25Qcm9wc1sncmVjb3JkcyddKSA9PiB7XG5cdGNvbnN0IGZyb21Qcm9wcyA9IChyZWNvcmRzID8/IFtdKS5tYXAoKHIpID0+IHIuaWQpLmZpbHRlcihCb29sZWFuKSBhcyBzdHJpbmdbXTtcblx0aWYgKGZyb21Qcm9wcy5sZW5ndGgpIHJldHVybiBmcm9tUHJvcHM7XG5cdGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykgcmV0dXJuIFtdO1xuXHRjb25zdCByYXcgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpLmdldCgncmVjb3JkSWRzJykgPz8gJyc7XG5cdHJldHVybiByYXdcblx0XHQuc3BsaXQoJywnKVxuXHRcdC5tYXAoKGlkKSA9PiBpZC50cmltKCkpXG5cdFx0LmZpbHRlcihCb29sZWFuKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFByb2R1Y3RCdWxrVG9nZ2xlSW5TdG9ja0FjdGlvbih7IGFjdGlvbiwgcmVzb3VyY2UsIHJlY29yZHMgfTogQWN0aW9uUHJvcHMpIHtcblx0Y29uc3QgYWRkTm90aWNlID0gdXNlTm90aWNlKCk7XG5cdGNvbnN0IHsgdHJhbnNsYXRlQWN0aW9uLCB0cmFuc2xhdGVNZXNzYWdlIH0gPSB1c2VUcmFuc2xhdGlvbigpO1xuXG5cdGNvbnN0IHJlY29yZElkcyA9IHVzZU1lbW8oKCkgPT4gcmVzb2x2ZVJlY29yZElkcyhyZWNvcmRzKSwgW3JlY29yZHNdKTtcblx0Y29uc3QgW21vZGUsIHNldE1vZGVdID0gdXNlU3RhdGU8J3RvZ2dsZScgfCAnc2V0Jz4oJ3RvZ2dsZScpO1xuXHRjb25zdCBbdmFsdWUsIHNldFZhbHVlXSA9IHVzZVN0YXRlPCd0cnVlJyB8ICdmYWxzZSc+KCd0cnVlJyk7XG5cdGNvbnN0IFtzYXZpbmcsIHNldFNhdmluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG5cblx0Y29uc3QgdGl0bGUgPSB0cmFuc2xhdGVBY3Rpb24oYWN0aW9uLm5hbWUsIHJlc291cmNlLmlkKTtcblx0Y29uc3QgY2FuU2F2ZSA9IHJlY29yZElkcy5sZW5ndGggPiAwO1xuXG5cdGNvbnN0IGhhbmRsZVNhdmUgPSBhc3luYyAoKSA9PiB7XG5cdFx0aWYgKCFjYW5TYXZlIHx8IHNhdmluZykgcmV0dXJuO1xuXHRcdHNldFNhdmluZyh0cnVlKTtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcblx0XHRcdGZvcm1EYXRhLmFwcGVuZCgnbW9kZScsIG1vZGUpO1xuXHRcdFx0Zm9ybURhdGEuYXBwZW5kKCd2YWx1ZScsIHZhbHVlKTtcblx0XHRcdGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXBpLmJ1bGtBY3Rpb24oe1xuXHRcdFx0XHRyZXNvdXJjZUlkOiByZXNvdXJjZS5pZCxcblx0XHRcdFx0cmVjb3JkSWRzLFxuXHRcdFx0XHRhY3Rpb25OYW1lOiBhY3Rpb24ubmFtZSxcblx0XHRcdFx0bWV0aG9kOiAncG9zdCcsXG5cdFx0XHRcdGRhdGE6IGZvcm1EYXRhLFxuXHRcdFx0fSk7XG5cdFx0XHRpZiAocmVzcG9uc2UuZGF0YS5ub3RpY2UpIGFkZE5vdGljZShyZXNwb25zZS5kYXRhLm5vdGljZSk7XG5cdFx0fSBjYXRjaCB7XG5cdFx0XHRhZGROb3RpY2UoeyBtZXNzYWdlOiAncHJvZHVjdC1idWxrLWZhaWxlZCcsIHR5cGU6ICdlcnJvcicgfSk7XG5cdFx0fSBmaW5hbGx5IHtcblx0XHRcdHNldFNhdmluZyhmYWxzZSk7XG5cdFx0fVxuXHR9O1xuXG5cdHJldHVybiAoXG5cdFx0PEJveCB2YXJpYW50PSd3aGl0ZScgcD0neHhsJyBib3JkZXJSYWRpdXM9J3hsJyBib3hTaGFkb3c9J3NtJyBzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQgI0UyRThGMCcgfX0+XG5cdFx0XHQ8VGV4dCBmb250U2l6ZT0neGwnIGZvbnRXZWlnaHQ9J2JvbGQnIG1iPSdtZCc+XG5cdFx0XHRcdHt0aXRsZX1cblx0XHRcdDwvVGV4dD5cblx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnIG1iPSd4bCc+XG5cdFx0XHRcdHt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWJ1bGstc2VsZWN0ZWQnLCB7IGNvdW50OiByZWNvcmRJZHMubGVuZ3RoIH0pfVxuXHRcdFx0PC9UZXh0PlxuXG5cdFx0XHQ8Rm9ybUdyb3VwPlxuXHRcdFx0XHQ8TGFiZWw+e3RyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtYnVsay1zdG9jay1tb2RlJyl9PC9MYWJlbD5cblx0XHRcdFx0PFNlbGVjdCB2YWx1ZT17bW9kZX0gb25DaGFuZ2U9eyhlOiBhbnkpID0+IHNldE1vZGUoU3RyaW5nKGU/LnRhcmdldD8udmFsdWUgPz8gJ3RvZ2dsZScpIGFzIGFueSl9PlxuXHRcdFx0XHRcdDxvcHRpb24gdmFsdWU9J3RvZ2dsZSc+e3RyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtYnVsay1zdG9jay10b2dnbGUnKX08L29wdGlvbj5cblx0XHRcdFx0XHQ8b3B0aW9uIHZhbHVlPSdzZXQnPnt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWJ1bGstc3RvY2stc2V0Jyl9PC9vcHRpb24+XG5cdFx0XHRcdDwvU2VsZWN0PlxuXHRcdFx0PC9Gb3JtR3JvdXA+XG5cblx0XHRcdHttb2RlID09PSAnc2V0JyA/IChcblx0XHRcdFx0PEZvcm1Hcm91cD5cblx0XHRcdFx0XHQ8TGFiZWw+e3RyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtYnVsay1zdG9jay12YWx1ZScpfTwvTGFiZWw+XG5cdFx0XHRcdFx0PFNlbGVjdCB2YWx1ZT17dmFsdWV9IG9uQ2hhbmdlPXsoZTogYW55KSA9PiBzZXRWYWx1ZShTdHJpbmcoZT8udGFyZ2V0Py52YWx1ZSA/PyAndHJ1ZScpIGFzIGFueSl9PlxuXHRcdFx0XHRcdFx0PG9wdGlvbiB2YWx1ZT0ndHJ1ZSc+e3RyYW5zbGF0ZU1lc3NhZ2UoJ2xhYmVscy5pblN0b2NrLnRydWUnKX08L29wdGlvbj5cblx0XHRcdFx0XHRcdDxvcHRpb24gdmFsdWU9J2ZhbHNlJz57dHJhbnNsYXRlTWVzc2FnZSgnbGFiZWxzLmluU3RvY2suZmFsc2UnKX08L29wdGlvbj5cblx0XHRcdFx0XHQ8L1NlbGVjdD5cblx0XHRcdFx0PC9Gb3JtR3JvdXA+XG5cdFx0XHQpIDogbnVsbH1cblxuXHRcdFx0PEJveCBtdD0neGwnPlxuXHRcdFx0XHQ8QnV0dG9uIHZhcmlhbnQ9J2NvbnRhaW5lZCcgY29sb3I9J3ByaW1hcnknIHN0eWxlPXthY3Rpb25CdXR0b25TdHlsZX0gZGlzYWJsZWQ9eyFjYW5TYXZlIHx8IHNhdmluZ30gb25DbGljaz17aGFuZGxlU2F2ZX0+XG5cdFx0XHRcdFx0e3NhdmluZyA/IHRyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtYnVsay1zYXZpbmcnKSA6IHRyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtYnVsay1hcHBseScpfVxuXHRcdFx0XHQ8L0J1dHRvbj5cblx0XHRcdDwvQm94PlxuXHRcdDwvQm94PlxuXHQpO1xufVxuIiwiaW1wb3J0IHsgdXNlVHJhbnNsYXRpb24gfSBmcm9tICdhZG1pbmpzJztcbmltcG9ydCB7IEJveCwgQnV0dG9uLCBIMiwgSDQsIEg1LCBJbGx1c3RyYXRpb24sIFRleHQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcblxudHlwZSBRdWlja0FjdGlvbiA9IHtcblx0a2V5OiBzdHJpbmc7XG5cdHBhdGg6IHN0cmluZztcbn07XG5cbmNvbnN0IHF1aWNrQWN0aW9uczogUXVpY2tBY3Rpb25bXSA9IFtcblx0eyBrZXk6ICdvcmRlcnMnLCBwYXRoOiAncmVzb3VyY2VzL09yZGVyJyB9LFxuXHR7IGtleTogJ3Byb2R1Y3RzJywgcGF0aDogJ3Jlc291cmNlcy9Qcm9kdWN0JyB9LFxuXHR7IGtleTogJ2N1c3RvbWVycycsIHBhdGg6ICdyZXNvdXJjZXMvVXNlcicgfSxcblx0eyBrZXk6ICdyZXZpZXdzJywgcGF0aDogJ3Jlc291cmNlcy9SZXZpZXcnIH0sXG5dO1xuXG5jb25zdCBhY3Rpb25CdXR0b25TdHlsZSA9IHtcblx0Ym9yZGVyQ29sb3I6ICd3aGl0ZScsXG5cdGJhY2tncm91bmQ6ICcjZmFjYzE1Jyxcblx0Y29sb3I6ICdibGFjaycsXG59O1xuXG5jb25zdCByZXNvbHZlUGF0aCA9IChwYXRoOiBzdHJpbmcpID0+IHtcblx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSByZXR1cm4gcGF0aDtcblx0Y29uc3QgZ2xvYmFsQW55ID0gd2luZG93IGFzIHR5cGVvZiB3aW5kb3cgJiB7XG5cdFx0UkVEVVhfU1RBVEU/OiB7IHBhdGhzPzogeyByb290UGF0aD86IHN0cmluZyB9IH07XG5cdH07XG5cdGNvbnN0IHJvb3RQYXRoID0gZ2xvYmFsQW55LlJFRFVYX1NUQVRFPy5wYXRocz8ucm9vdFBhdGggPz8gJyc7XG5cdGNvbnN0IG5vcm1hbGl6ZWRSb290ID0gcm9vdFBhdGgucmVwbGFjZSgvXFwvJC8sICcnKTtcblx0Y29uc3Qgbm9ybWFsaXplZFBhdGggPSBwYXRoLnJlcGxhY2UoL15cXC8vLCAnJyk7XG5cdGlmICghbm9ybWFsaXplZFJvb3QpIHJldHVybiBwYXRoO1xuXHRyZXR1cm4gYCR7bm9ybWFsaXplZFJvb3R9LyR7bm9ybWFsaXplZFBhdGh9YDtcbn07XG5cbmNvbnN0IGdvVG8gPSAocGF0aDogc3RyaW5nKSA9PiAoKSA9PiB7XG5cdGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuXHRcdHdpbmRvdy5sb2NhdGlvbi5hc3NpZ24ocmVzb2x2ZVBhdGgocGF0aCkpO1xuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBEYXNoYm9hcmQoKSB7XG5cdGNvbnN0IHsgdHJhbnNsYXRlTWVzc2FnZSB9ID0gdXNlVHJhbnNsYXRpb24oKTtcblxuXHRyZXR1cm4gKFxuXHRcdDxCb3ggdmFyaWFudD0nZ3JleScgcD0neHhsJz5cblx0XHRcdDxCb3hcblx0XHRcdFx0dmFyaWFudD0nd2hpdGUnXG5cdFx0XHRcdHA9J3h4bCdcblx0XHRcdFx0Ym9yZGVyUmFkaXVzPSd4bCdcblx0XHRcdFx0Ym94U2hhZG93PSdzbSdcblx0XHRcdFx0c3R5bGU9e3tcblx0XHRcdFx0XHRkaXNwbGF5OiAnZmxleCcsXG5cdFx0XHRcdFx0YWxpZ25JdGVtczogJ2NlbnRlcicsXG5cdFx0XHRcdFx0anVzdGlmeUNvbnRlbnQ6ICdzcGFjZS1iZXR3ZWVuJyxcblx0XHRcdFx0XHRnYXA6IDMyLFxuXHRcdFx0XHRcdGZsZXhXcmFwOiAnd3JhcCcsXG5cdFx0XHRcdH19XG5cdFx0XHQ+XG5cdFx0XHRcdDxCb3ggc3R5bGU9e3sgbWF4V2lkdGg6IDUyMCB9fT5cblx0XHRcdFx0XHQ8SDIgbWI9J2xnJz57dHJhbnNsYXRlTWVzc2FnZSgnZGFzaGJvYXJkLnRpdGxlJyl9PC9IMj5cblx0XHRcdFx0XHQ8VGV4dCBmb250U2l6ZT0nbGcnIG1iPSd4bCc+XG5cdFx0XHRcdFx0XHR7dHJhbnNsYXRlTWVzc2FnZSgnZGFzaGJvYXJkLnN1YnRpdGxlJyl9XG5cdFx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0XHRcdDxCb3ggc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBnYXA6IDEyLCBmbGV4V3JhcDogJ3dyYXAnIH19PlxuXHRcdFx0XHRcdFx0PEJ1dHRvblxuXHRcdFx0XHRcdFx0XHR2YXJpYW50PSdjb250YWluZWQnXG5cdFx0XHRcdFx0XHRcdGNvbG9yPSdwcmltYXJ5J1xuXHRcdFx0XHRcdFx0XHRzdHlsZT17YWN0aW9uQnV0dG9uU3R5bGV9XG5cdFx0XHRcdFx0XHRcdG9uQ2xpY2s9e2dvVG8oJ3Jlc291cmNlcy9PcmRlcicpfVxuXHRcdFx0XHRcdFx0PlxuXHRcdFx0XHRcdFx0XHR7dHJhbnNsYXRlTWVzc2FnZSgnZGFzaGJvYXJkLnByaW1hcnlBY3Rpb25zLm9yZGVycycpfVxuXHRcdFx0XHRcdFx0PC9CdXR0b24+XG5cdFx0XHRcdFx0XHQ8QnV0dG9uXG5cdFx0XHRcdFx0XHRcdHZhcmlhbnQ9J2NvbnRhaW5lZCdcblx0XHRcdFx0XHRcdFx0Y29sb3I9J3ByaW1hcnknXG5cdFx0XHRcdFx0XHRcdHN0eWxlPXthY3Rpb25CdXR0b25TdHlsZX1cblx0XHRcdFx0XHRcdFx0b25DbGljaz17Z29UbygncmVzb3VyY2VzL1Byb2R1Y3QvYWN0aW9ucy9uZXcnKX1cblx0XHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoJ2Rhc2hib2FyZC5wcmltYXJ5QWN0aW9ucy5wcm9kdWN0cycpfVxuXHRcdFx0XHRcdFx0PC9CdXR0b24+XG5cdFx0XHRcdFx0XHQ8QnV0dG9uXG5cdFx0XHRcdFx0XHRcdHZhcmlhbnQ9J2NvbnRhaW5lZCdcblx0XHRcdFx0XHRcdFx0Y29sb3I9J3ByaW1hcnknXG5cdFx0XHRcdFx0XHRcdHN0eWxlPXthY3Rpb25CdXR0b25TdHlsZX1cblx0XHRcdFx0XHRcdFx0b25DbGljaz17Z29UbygncmVzb3VyY2VzL1JldmlldycpfVxuXHRcdFx0XHRcdFx0PlxuXHRcdFx0XHRcdFx0XHR7dHJhbnNsYXRlTWVzc2FnZSgnZGFzaGJvYXJkLnByaW1hcnlBY3Rpb25zLnJldmlld3MnKX1cblx0XHRcdFx0XHRcdDwvQnV0dG9uPlxuXHRcdFx0XHRcdDwvQm94PlxuXHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0PEJveCBzdHlsZT17eyBtaW5XaWR0aDogMjQwLCBkaXNwbGF5OiAnZmxleCcsIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyB9fT5cblx0XHRcdFx0XHQ8SWxsdXN0cmF0aW9uIHZhcmlhbnQ9J0JhZycgd2lkdGg9ezIwMH0gaGVpZ2h0PXsxODB9IC8+XG5cdFx0XHRcdDwvQm94PlxuXHRcdFx0PC9Cb3g+XG5cblx0XHRcdDxCb3ggbXQ9J3h4bCc+XG5cdFx0XHRcdDxIND57dHJhbnNsYXRlTWVzc2FnZSgnZGFzaGJvYXJkLmRhaWx5Rm9jdXMudGl0bGUnKX08L0g0PlxuXHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJz57dHJhbnNsYXRlTWVzc2FnZSgnZGFzaGJvYXJkLmRhaWx5Rm9jdXMuc3VidGl0bGUnKX08L1RleHQ+XG5cdFx0XHQ8L0JveD5cblxuXHRcdFx0PEJveFxuXHRcdFx0XHRtdD0nbGcnXG5cdFx0XHRcdHN0eWxlPXt7XG5cdFx0XHRcdFx0ZGlzcGxheTogJ2dyaWQnLFxuXHRcdFx0XHRcdGdyaWRUZW1wbGF0ZUNvbHVtbnM6ICdyZXBlYXQoYXV0by1maXQsIG1pbm1heCgyNDBweCwgMWZyKSknLFxuXHRcdFx0XHRcdGdhcDogMTYsXG5cdFx0XHRcdH19XG5cdFx0XHQ+XG5cdFx0XHRcdHtxdWlja0FjdGlvbnMubWFwKChhY3Rpb24pID0+IChcblx0XHRcdFx0XHQ8Qm94XG5cdFx0XHRcdFx0XHRrZXk9e2FjdGlvbi5rZXl9XG5cdFx0XHRcdFx0XHR2YXJpYW50PSd3aGl0ZSdcblx0XHRcdFx0XHRcdHA9J3hsJ1xuXHRcdFx0XHRcdFx0Ym9yZGVyUmFkaXVzPSd4bCdcblx0XHRcdFx0XHRcdGJveFNoYWRvdz0nc20nXG5cdFx0XHRcdFx0XHRzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQgI0UyRThGMCcgfX1cblx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHQ8SDUgbWI9J21kJz57dHJhbnNsYXRlTWVzc2FnZShgZGFzaGJvYXJkLmNhcmRzLiR7YWN0aW9uLmtleX0udGl0bGVgKX08L0g1PlxuXHRcdFx0XHRcdFx0PFRleHQgY29sb3I9J2dyZXk2MCcgbWI9J3hsJz5cblx0XHRcdFx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoYGRhc2hib2FyZC5jYXJkcy4ke2FjdGlvbi5rZXl9LmRlc2NyaXB0aW9uYCl9XG5cdFx0XHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHRcdFx0XHQ8QnV0dG9uXG5cdFx0XHRcdFx0XHRcdHZhcmlhbnQ9J2NvbnRhaW5lZCdcblx0XHRcdFx0XHRcdFx0Y29sb3I9J3ByaW1hcnknXG5cdFx0XHRcdFx0XHRcdHN0eWxlPXthY3Rpb25CdXR0b25TdHlsZX1cblx0XHRcdFx0XHRcdFx0b25DbGljaz17Z29UbyhhY3Rpb24ucGF0aCl9XG5cdFx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHRcdHt0cmFuc2xhdGVNZXNzYWdlKGBkYXNoYm9hcmQuY2FyZHMuJHthY3Rpb24ua2V5fS5idXR0b25gKX1cblx0XHRcdFx0XHRcdDwvQnV0dG9uPlxuXHRcdFx0XHRcdDwvQm94PlxuXHRcdFx0XHQpKX1cblx0XHRcdDwvQm94PlxuXHRcdDwvQm94PlxuXHQpO1xufVxuIiwiaW1wb3J0IHsgdXNlVHJhbnNsYXRpb24gfSBmcm9tICdhZG1pbmpzJztcbmltcG9ydCB7IEJveCwgQnV0dG9uLCBGb3JtR3JvdXAsIEgyLCBINSwgSWxsdXN0cmF0aW9uLCBJbnB1dCwgTGFiZWwsIE1lc3NhZ2VCb3gsIFRleHQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcbmltcG9ydCB7IHVzZVN0YXRlLCB0eXBlIENoYW5nZUV2ZW50IH0gZnJvbSAncmVhY3QnO1xuXG50eXBlIExvZ2luU3RhdGUgPSB7XG5cdGFjdGlvbj86IHN0cmluZztcblx0ZXJyb3JNZXNzYWdlPzogc3RyaW5nIHwgbnVsbDtcbn07XG5cbnR5cGUgQnJhbmRpbmdTdGF0ZSA9IHtcblx0bG9nbz86IHN0cmluZztcblx0Y29tcGFueU5hbWU/OiBzdHJpbmc7XG5cdHdpdGhNYWRlV2l0aExvdmU/OiBib29sZWFuO1xufTtcblxudHlwZSBXaW5kb3dXaXRoQWRtaW5TdGF0ZSA9IFdpbmRvdyAmIHtcblx0X19BUFBfU1RBVEVfXz86IExvZ2luU3RhdGU7XG5cdFJFRFVYX1NUQVRFPzoge1xuXHRcdGJyYW5kaW5nPzogQnJhbmRpbmdTdGF0ZTtcblx0fTtcbn07XG5cbmNvbnN0IGFjdGlvbkJ1dHRvblN0eWxlID0ge1xuXHRib3JkZXJDb2xvcjogJ3doaXRlJyxcblx0YmFja2dyb3VuZDogJyNmYWNjMTUnLFxuXHRjb2xvcjogJ2JsYWNrJyxcbn07XG5cbmNvbnN0IGxhYmVsU3R5bGUgPSB7XG5cdGZvbnRTaXplOiAxNCxcbn07XG5cbmNvbnN0IGdldE1lc3NhZ2VUZXh0ID0gKG1lc3NhZ2U6IHN0cmluZywgdHJhbnNsYXRlTWVzc2FnZTogKGtleTogc3RyaW5nKSA9PiBzdHJpbmcpID0+XG5cdG1lc3NhZ2Uuc3BsaXQoJyAnKS5sZW5ndGggPiAxID8gbWVzc2FnZSA6IHRyYW5zbGF0ZU1lc3NhZ2UobWVzc2FnZSk7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIExvZ2luKCkge1xuXHRjb25zdCB3aW5kb3dTdGF0ZSA9IHdpbmRvdyBhcyBXaW5kb3dXaXRoQWRtaW5TdGF0ZTtcblx0Y29uc3QgcHJvcHMgPSB3aW5kb3dTdGF0ZS5fX0FQUF9TVEFURV9fO1xuXHRjb25zdCBhY3Rpb24gPSBwcm9wcz8uYWN0aW9uID8/ICcnO1xuXHRjb25zdCBtZXNzYWdlID0gcHJvcHM/LmVycm9yTWVzc2FnZSA/PyB1bmRlZmluZWQ7XG5cdGNvbnN0IGJyYW5kaW5nID0gd2luZG93U3RhdGUuUkVEVVhfU1RBVEU/LmJyYW5kaW5nID8/IHt9O1xuXHRjb25zdCB7IHRyYW5zbGF0ZUNvbXBvbmVudCwgdHJhbnNsYXRlTWVzc2FnZSB9ID0gdXNlVHJhbnNsYXRpb24oKTtcblx0Y29uc3QgW2VtYWlsLCBzZXRFbWFpbF0gPSB1c2VTdGF0ZSgndGVzdEBjb20nKTtcblx0Y29uc3QgW3Bhc3N3b3JkLCBzZXRQYXNzd29yZF0gPSB1c2VTdGF0ZSgndGVzdCcpO1xuXG5cdGNvbnN0IGhhbmRsZUVtYWlsQ2hhbmdlID0gKGV2ZW50OiBDaGFuZ2VFdmVudDxIVE1MSW5wdXRFbGVtZW50PikgPT4ge1xuXHRcdHNldEVtYWlsKGV2ZW50LnRhcmdldC52YWx1ZSk7XG5cdH07XG5cblx0Y29uc3QgaGFuZGxlUGFzc3dvcmRDaGFuZ2UgPSAoZXZlbnQ6IENoYW5nZUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+KSA9PiB7XG5cdFx0c2V0UGFzc3dvcmQoZXZlbnQudGFyZ2V0LnZhbHVlKTtcblx0fTtcblxuXHRyZXR1cm4gKFxuXHRcdDxCb3hcblx0XHRcdHZhcmlhbnQ9J2dyZXknXG5cdFx0XHRmbGV4XG5cdFx0XHRjbGFzc05hbWU9J2FkbWluLWxvZ2luLXBhZ2UnXG5cdFx0XHRzdHlsZT17e1xuXHRcdFx0XHRtaW5IZWlnaHQ6ICcxMDAlJyxcblx0XHRcdFx0YWxpZ25JdGVtczogJ2NlbnRlcicsXG5cdFx0XHRcdGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcblx0XHRcdFx0cGFkZGluZzogJzMycHggMTZweCcsXG5cdFx0XHR9fVxuXHRcdD5cblx0XHRcdDxCb3hcblx0XHRcdFx0dmFyaWFudD0nd2hpdGUnXG5cdFx0XHRcdHA9J3h4bCdcblx0XHRcdFx0Ym9yZGVyUmFkaXVzPSd4bCdcblx0XHRcdFx0Ym94U2hhZG93PSdzbSdcblx0XHRcdFx0c3R5bGU9e3tcblx0XHRcdFx0XHR3aWR0aDogJ21pbig5NjBweCwgMTAwJSknLFxuXHRcdFx0XHRcdGRpc3BsYXk6ICdncmlkJyxcblx0XHRcdFx0XHRncmlkVGVtcGxhdGVDb2x1bW5zOiAncmVwZWF0KGF1dG8tZml0LCBtaW5tYXgoMjgwcHgsIDFmcikpJyxcblx0XHRcdFx0XHRnYXA6IDMyLFxuXHRcdFx0XHR9fVxuXHRcdFx0PlxuXHRcdFx0XHQ8Qm94IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGdhcDogMTYgfX0+XG5cdFx0XHRcdFx0PEgyPnt0cmFuc2xhdGVDb21wb25lbnQoJ0xvZ2luLnRpdGxlJyl9PC9IMj5cblx0XHRcdFx0XHQ8VGV4dCBmb250U2l6ZT0nbGcnPnt0cmFuc2xhdGVDb21wb25lbnQoJ0xvZ2luLnN1YnRpdGxlJyl9PC9UZXh0PlxuXHRcdFx0XHRcdDxCb3hcblx0XHRcdFx0XHRcdHZhcmlhbnQ9J2dyZXknXG5cdFx0XHRcdFx0XHRib3JkZXJSYWRpdXM9J3hsJ1xuXHRcdFx0XHRcdFx0cD0neGwnXG5cdFx0XHRcdFx0XHRzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6IDE2IH19XG5cdFx0XHRcdFx0PlxuXHRcdFx0XHRcdFx0PElsbHVzdHJhdGlvbiB2YXJpYW50PSdCYWcnIHdpZHRoPXsxMjB9IGhlaWdodD17MTEwfSAvPlxuXHRcdFx0XHRcdFx0PFRleHQgY29sb3I9J2dyZXk2MCc+e3RyYW5zbGF0ZUNvbXBvbmVudCgnTG9naW4uc3VwcG9ydFRleHQnKX08L1RleHQ+XG5cdFx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdDwvQm94PlxuXHRcdFx0XHQ8Qm94IGFzPSdmb3JtJyBhY3Rpb249e2FjdGlvbn0gbWV0aG9kPSdQT1NUJyBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBnYXA6IDE2IH19PlxuXHRcdFx0XHRcdDxINSBtYXJnaW5Cb3R0b209J2xnJz5cblx0XHRcdFx0XHRcdHticmFuZGluZz8ubG9nbyA/IChcblx0XHRcdFx0XHRcdFx0PGltZ1xuXHRcdFx0XHRcdFx0XHRcdHNyYz17YnJhbmRpbmcubG9nb31cblx0XHRcdFx0XHRcdFx0XHRhbHQ9e2JyYW5kaW5nLmNvbXBhbnlOYW1lfVxuXHRcdFx0XHRcdFx0XHRcdHN0eWxlPXt7IG1heFdpZHRoOiAyMDAgfX1cblx0XHRcdFx0XHRcdFx0Lz5cblx0XHRcdFx0XHRcdCkgOiAoXG5cdFx0XHRcdFx0XHRcdGJyYW5kaW5nPy5jb21wYW55TmFtZSA/PyAnQWRtaW4nXG5cdFx0XHRcdFx0XHQpfVxuXHRcdFx0XHRcdDwvSDU+XG5cdFx0XHRcdFx0e21lc3NhZ2UgPyAoXG5cdFx0XHRcdFx0XHQ8TWVzc2FnZUJveFxuXHRcdFx0XHRcdFx0XHRteT0nbGcnXG5cdFx0XHRcdFx0XHRcdG1lc3NhZ2U9e2dldE1lc3NhZ2VUZXh0KG1lc3NhZ2UsIHRyYW5zbGF0ZU1lc3NhZ2UpfVxuXHRcdFx0XHRcdFx0XHR2YXJpYW50PSdkYW5nZXInXG5cdFx0XHRcdFx0XHQvPlxuXHRcdFx0XHRcdCkgOiBudWxsfVxuXHRcdFx0XHRcdDxGb3JtR3JvdXA+XG5cdFx0XHRcdFx0XHQ8TGFiZWwgcmVxdWlyZWQgc3R5bGU9e2xhYmVsU3R5bGV9PlxuXHRcdFx0XHRcdFx0XHR7dHJhbnNsYXRlQ29tcG9uZW50KCdMb2dpbi5wcm9wZXJ0aWVzLmVtYWlsJyl9XG5cdFx0XHRcdFx0XHQ8L0xhYmVsPlxuXHRcdFx0XHRcdFx0PElucHV0XG5cdFx0XHRcdFx0XHRcdG5hbWU9J2VtYWlsJ1xuXHRcdFx0XHRcdFx0XHR0eXBlPSdlbWFpbCdcblx0XHRcdFx0XHRcdFx0YXV0b0NvbXBsZXRlPSdvZmYnXG5cdFx0XHRcdFx0XHRcdHBsYWNlaG9sZGVyPXt0cmFuc2xhdGVDb21wb25lbnQoJ0xvZ2luLnByb3BlcnRpZXMuZW1haWwnKX1cblx0XHRcdFx0XHRcdFx0dmFsdWU9e2VtYWlsfVxuXHRcdFx0XHRcdFx0XHRvbkNoYW5nZT17aGFuZGxlRW1haWxDaGFuZ2V9XG5cdFx0XHRcdFx0XHQvPlxuXHRcdFx0XHRcdDwvRm9ybUdyb3VwPlxuXHRcdFx0XHRcdDxGb3JtR3JvdXA+XG5cdFx0XHRcdFx0XHQ8TGFiZWwgcmVxdWlyZWQgc3R5bGU9e2xhYmVsU3R5bGV9PlxuXHRcdFx0XHRcdFx0XHR7dHJhbnNsYXRlQ29tcG9uZW50KCdMb2dpbi5wcm9wZXJ0aWVzLnBhc3N3b3JkJyl9XG5cdFx0XHRcdFx0XHQ8L0xhYmVsPlxuXHRcdFx0XHRcdFx0PElucHV0XG5cdFx0XHRcdFx0XHRcdHR5cGU9J3Bhc3N3b3JkJ1xuXHRcdFx0XHRcdFx0XHRuYW1lPSdwYXNzd29yZCdcblx0XHRcdFx0XHRcdFx0YXV0b0NvbXBsZXRlPSduZXctcGFzc3dvcmQnXG5cdFx0XHRcdFx0XHRcdHBsYWNlaG9sZGVyPXt0cmFuc2xhdGVDb21wb25lbnQoJ0xvZ2luLnByb3BlcnRpZXMucGFzc3dvcmQnKX1cblx0XHRcdFx0XHRcdFx0dmFsdWU9e3Bhc3N3b3JkfVxuXHRcdFx0XHRcdFx0XHRvbkNoYW5nZT17aGFuZGxlUGFzc3dvcmRDaGFuZ2V9XG5cdFx0XHRcdFx0XHQvPlxuXHRcdFx0XHRcdDwvRm9ybUdyb3VwPlxuXHRcdFx0XHRcdDxCb3g+XG5cdFx0XHRcdFx0XHQ8QnV0dG9uIHZhcmlhbnQ9J2NvbnRhaW5lZCcgY29sb3I9J3ByaW1hcnknIHN0eWxlPXthY3Rpb25CdXR0b25TdHlsZX0+XG5cdFx0XHRcdFx0XHRcdHt0cmFuc2xhdGVDb21wb25lbnQoJ0xvZ2luLmxvZ2luQnV0dG9uJyl9XG5cdFx0XHRcdFx0XHQ8L0J1dHRvbj5cblx0XHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0PC9Cb3g+XG5cdFx0XHQ8L0JveD5cblx0XHQ8L0JveD5cblx0KTtcbn1cbiIsImltcG9ydCB7IHVzZVRyYW5zbGF0aW9uIH0gZnJvbSAnYWRtaW5qcyc7XG5pbXBvcnQgeyBCb3gsIEN1cnJlbnRVc2VyTmF2IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSc7XG5cbnR5cGUgTG9nZ2VkSW5Qcm9wcyA9IHtcblx0c2Vzc2lvbjoge1xuXHRcdGVtYWlsPzogc3RyaW5nO1xuXHRcdHRpdGxlPzogc3RyaW5nO1xuXHRcdGF2YXRhclVybD86IHN0cmluZztcblx0fTtcblx0cGF0aHM6IHtcblx0XHRsb2dvdXRQYXRoOiBzdHJpbmc7XG5cdH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBMb2dnZWRJbih7IHNlc3Npb24sIHBhdGhzIH06IExvZ2dlZEluUHJvcHMpIHtcblx0Y29uc3QgeyB0cmFuc2xhdGVCdXR0b24gfSA9IHVzZVRyYW5zbGF0aW9uKCk7XG5cblx0Y29uc3QgZHJvcEFjdGlvbnMgPSBbXG5cdFx0e1xuXHRcdFx0bGFiZWw6IHRyYW5zbGF0ZUJ1dHRvbignbG9nb3V0JyksXG5cdFx0XHRvbkNsaWNrOiAoZXZlbnQ6IEV2ZW50KSA9PiB7XG5cdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gcGF0aHMubG9nb3V0UGF0aDtcblx0XHRcdH0sXG5cdFx0XHRpY29uOiAnTG9nT3V0Jyxcblx0XHR9LFxuXHRdO1xuXG5cdHJldHVybiAoXG5cdFx0PEJveCBmbGV4U2hyaW5rPXswfSBkYXRhLWNzcz0nbG9nZ2VkLWluJz5cblx0XHRcdDxDdXJyZW50VXNlck5hdlxuXHRcdFx0XHRuYW1lPXtzZXNzaW9uLmVtYWlsfVxuXHRcdFx0XHR0aXRsZT17c2Vzc2lvbi50aXRsZX1cblx0XHRcdFx0YXZhdGFyVXJsPXtzZXNzaW9uLmF2YXRhclVybH1cblx0XHRcdFx0ZHJvcEFjdGlvbnM9e2Ryb3BBY3Rpb25zfVxuXHRcdFx0Lz5cblx0XHQ8L0JveD5cblx0KTtcbn1cbiIsImltcG9ydCB7IHVzZVRyYW5zbGF0aW9uIH0gZnJvbSAnYWRtaW5qcyc7XG5pbXBvcnQge1xuXHRCb3gsXG5cdEJ1dHRvbixcblx0RHJvcERvd24sXG5cdERyb3BEb3duSXRlbSxcblx0RHJvcERvd25NZW51LFxuXHREcm9wRG93blRyaWdnZXIsXG5cdEljb24sXG5cdFRleHQsXG59IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xuaW1wb3J0IExvZ2dlZEluIGZyb20gJy4vTG9nZ2VkSW4nO1xuXG50eXBlIFRvcEJhclByb3BzID0ge1xuXHR0b2dnbGVTaWRlYmFyOiAoKSA9PiB2b2lkO1xufTtcblxudHlwZSBBZG1pblN0YXRlID0ge1xuXHRzZXNzaW9uPzogeyBlbWFpbD86IHN0cmluZzsgdGl0bGU/OiBzdHJpbmc7IGF2YXRhclVybD86IHN0cmluZyB9O1xuXHRwYXRocz86IHsgcm9vdFBhdGg/OiBzdHJpbmc7IGxvZ291dFBhdGg/OiBzdHJpbmcgfTtcblx0dmVyc2lvbnM/OiB7IGFkbWluPzogc3RyaW5nOyBhcHA/OiBzdHJpbmcgfTtcbn07XG5cbnR5cGUgVmVyc2lvbnMgPSB7XG5cdGFkbWluPzogc3RyaW5nO1xuXHRhcHA/OiBzdHJpbmc7XG59O1xuXG50eXBlIFdpbmRvd1dpdGhBZG1pblN0YXRlID0gV2luZG93ICYge1xuXHRSRURVWF9TVEFURT86IEFkbWluU3RhdGU7XG59O1xuXG5jb25zdCBWZXJzaW9uID0gKHsgdmVyc2lvbnMgfTogeyB2ZXJzaW9uczogVmVyc2lvbnMgfSkgPT4ge1xuXHRjb25zdCB7IHRyYW5zbGF0ZUxhYmVsIH0gPSB1c2VUcmFuc2xhdGlvbigpO1xuXHRjb25zdCB7IGFkbWluLCBhcHAgfSA9IHZlcnNpb25zO1xuXG5cdHJldHVybiAoXG5cdFx0PEJveCBmbGV4IGZsZXhHcm93PXsxfSBweT0nZGVmYXVsdCcgcHg9J3h4bCcgZGF0YS1jc3M9J3ZlcnNpb24nPlxuXHRcdFx0e2FkbWluID8gKFxuXHRcdFx0XHQ8VGV4dCBkaXNwbGF5PXtbJ25vbmUnLCAnYmxvY2snXX0gY29sb3I9J2dyZXkxMDAnIHN0eWxlPXt7IHBhZGRpbmc6ICcxMnB4IDI0cHggMTJweCAwJyB9fT5cblx0XHRcdFx0XHR7dHJhbnNsYXRlTGFiZWwoJ2FkbWluVmVyc2lvbicsIHsgdmVyc2lvbjogYWRtaW4gfSl9XG5cdFx0XHRcdDwvVGV4dD5cblx0XHRcdCkgOiBudWxsfVxuXHRcdFx0e2FwcCA/IChcblx0XHRcdFx0PFRleHQgZGlzcGxheT17Wydub25lJywgJ2Jsb2NrJ119IGNvbG9yPSdncmV5MTAwJyBzdHlsZT17eyBwYWRkaW5nOiAnMTJweCAyNHB4IDEycHggMCcgfX0+XG5cdFx0XHRcdFx0e3RyYW5zbGF0ZUxhYmVsKCdhcHBWZXJzaW9uJywgeyB2ZXJzaW9uOiBhcHAgfSl9XG5cdFx0XHRcdDwvVGV4dD5cblx0XHRcdCkgOiBudWxsfVxuXHRcdDwvQm94PlxuXHQpO1xufTtcblxuY29uc3QgTGFuZ3VhZ2VTZWxlY3QgPSAoKSA9PiB7XG5cdGNvbnN0IHsgaTE4biwgdHJhbnNsYXRlQ29tcG9uZW50IH0gPSB1c2VUcmFuc2xhdGlvbigpO1xuXHRjb25zdCBzdXBwb3J0ZWRMbmdzUmF3ID0gaTE4bj8ub3B0aW9ucz8uc3VwcG9ydGVkTG5ncztcblx0Y29uc3Qgc3VwcG9ydGVkTG5ncyA9IEFycmF5LmlzQXJyYXkoc3VwcG9ydGVkTG5nc1JhdykgPyBzdXBwb3J0ZWRMbmdzUmF3IDogW107XG5cdGNvbnN0IGF2YWlsYWJsZUxhbmd1YWdlcyA9IHN1cHBvcnRlZExuZ3MuZmlsdGVyKChsYW5nOiBzdHJpbmcpID0+IGxhbmcgIT09ICdjaW1vZGUnKTtcblxuXHRpZiAoYXZhaWxhYmxlTGFuZ3VhZ2VzLmxlbmd0aCA8PSAxKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHRyZXR1cm4gKFxuXHRcdDxCb3ggZmxleCBhbGlnbkl0ZW1zPSdjZW50ZXInPlxuXHRcdFx0PERyb3BEb3duPlxuXHRcdFx0XHQ8RHJvcERvd25UcmlnZ2VyPlxuXHRcdFx0XHRcdDxCdXR0b24gY29sb3I9J3RleHQnPlxuXHRcdFx0XHRcdFx0PEljb24gaWNvbj0nR2xvYmUnIC8+XG5cdFx0XHRcdFx0XHR7dHJhbnNsYXRlQ29tcG9uZW50KGBMYW5ndWFnZVNlbGVjdG9yLmF2YWlsYWJsZUxhbmd1YWdlcy4ke2kxOG4ubGFuZ3VhZ2V9YCwge1xuXHRcdFx0XHRcdFx0XHRkZWZhdWx0VmFsdWU6IGkxOG4ubGFuZ3VhZ2UsXG5cdFx0XHRcdFx0XHR9KX1cblx0XHRcdFx0XHQ8L0J1dHRvbj5cblx0XHRcdFx0PC9Ecm9wRG93blRyaWdnZXI+XG5cdFx0XHRcdDxEcm9wRG93bk1lbnU+XG5cdFx0XHRcdFx0e2F2YWlsYWJsZUxhbmd1YWdlcy5tYXAoKGxhbmcpID0+IChcblx0XHRcdFx0XHRcdDxEcm9wRG93bkl0ZW0ga2V5PXtsYW5nfSBvbkNsaWNrPXsoKSA9PiBpMThuLmNoYW5nZUxhbmd1YWdlKGxhbmcpfT5cblx0XHRcdFx0XHRcdFx0e3RyYW5zbGF0ZUNvbXBvbmVudChgTGFuZ3VhZ2VTZWxlY3Rvci5hdmFpbGFibGVMYW5ndWFnZXMuJHtsYW5nfWAsIHtcblx0XHRcdFx0XHRcdFx0XHRkZWZhdWx0VmFsdWU6IGxhbmcsXG5cdFx0XHRcdFx0XHRcdH0pfVxuXHRcdFx0XHRcdFx0PC9Ecm9wRG93bkl0ZW0+XG5cdFx0XHRcdFx0KSl9XG5cdFx0XHRcdDwvRHJvcERvd25NZW51PlxuXHRcdFx0PC9Ecm9wRG93bj5cblx0XHQ8L0JveD5cblx0KTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFRvcEJhcih7IHRvZ2dsZVNpZGViYXIgfTogVG9wQmFyUHJvcHMpIHtcblx0Y29uc3Qgd2luZG93U3RhdGUgPSB0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiAod2luZG93IGFzIFdpbmRvd1dpdGhBZG1pblN0YXRlKTtcblx0Y29uc3QgcmVkdXhTdGF0ZSA9IHdpbmRvd1N0YXRlPy5SRURVWF9TVEFURSA/PyB7fTtcblx0Y29uc3Qgc2Vzc2lvbiA9IHJlZHV4U3RhdGUuc2Vzc2lvbjtcblx0Y29uc3QgcGF0aHMgPSByZWR1eFN0YXRlLnBhdGhzO1xuXHRjb25zdCB2ZXJzaW9ucyA9IHJlZHV4U3RhdGUudmVyc2lvbnM7XG5cdGNvbnN0IHsgdHJhbnNsYXRlTWVzc2FnZSB9ID0gdXNlVHJhbnNsYXRpb24oKTtcblx0Y29uc3Qgcm9vdFBhdGggPSBwYXRocz8ucm9vdFBhdGggPz8gJy9hZG1pbic7XG5cdGNvbnN0IGxvZ291dFBhdGggPSBwYXRocz8ubG9nb3V0UGF0aCA/PyBgJHtyb290UGF0aH0vbG9nb3V0YDtcblx0Y29uc3QgaG9tZUxhYmVsID0gdHJhbnNsYXRlTWVzc2FnZSgnYWRtaW4taG9tZScpO1xuXG5cdHJldHVybiAoXG5cdFx0PEJveFxuXHRcdFx0ZGF0YS1jc3M9J3RvcGJhcidcblx0XHRcdHN0eWxlPXt7XG5cdFx0XHRcdGhlaWdodDogJzY0cHgnLFxuXHRcdFx0XHRib3JkZXJCb3R0b206ICcxcHggc29saWQgI0UyRThGMCcsXG5cdFx0XHRcdGJhY2tncm91bmQ6ICcjRkZGRkZGJyxcblx0XHRcdFx0ZGlzcGxheTogJ2ZsZXgnLFxuXHRcdFx0XHRmbGV4RGlyZWN0aW9uOiAncm93Jyxcblx0XHRcdFx0ZmxleFNocmluazogMCxcblx0XHRcdFx0YWxpZ25JdGVtczogJ2NlbnRlcicsXG5cdFx0XHR9fVxuXHRcdD5cblx0XHRcdDxCb3ggZGlzcGxheT0nZmxleCcgYWxpZ25JdGVtcz0nY2VudGVyJyBzdHlsZT17eyBnYXA6IDEyIH19PlxuXHRcdFx0XHQ8Qm94XG5cdFx0XHRcdFx0cHk9J2xnJ1xuXHRcdFx0XHRcdHB4PXtbJ2RlZmF1bHQnLCAnbGcnXX1cblx0XHRcdFx0XHRvbkNsaWNrPXt0b2dnbGVTaWRlYmFyfVxuXHRcdFx0XHRcdGRpc3BsYXk9e1snYmxvY2snLCAnYmxvY2snLCAnYmxvY2snLCAnYmxvY2snLCAnbm9uZSddfVxuXHRcdFx0XHRcdHN0eWxlPXt7IGN1cnNvcjogJ3BvaW50ZXInIH19XG5cdFx0XHRcdD5cblx0XHRcdFx0XHQ8SWNvbiBpY29uPSdNZW51JyBzaXplPXsyNH0gLz5cblx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdDxhIGhyZWY9e3Jvb3RQYXRofSBjbGFzc05hbWU9J2FkbWluLWhvbWUtbGluayc+XG5cdFx0XHRcdFx0PEljb24gaWNvbj0nSG9tZScgLz5cblx0XHRcdFx0XHR7aG9tZUxhYmVsfVxuXHRcdFx0XHQ8L2E+XG5cdFx0XHQ8L0JveD5cblx0XHRcdDxWZXJzaW9uIHZlcnNpb25zPXt2ZXJzaW9ucyA/PyB7fX0gLz5cblx0XHRcdDxMYW5ndWFnZVNlbGVjdCAvPlxuXHRcdFx0e3Nlc3Npb24/LmVtYWlsID8gPExvZ2dlZEluIHNlc3Npb249e3Nlc3Npb259IHBhdGhzPXt7IGxvZ291dFBhdGggfX0gLz4gOiBudWxsfVxuXHRcdDwvQm94PlxuXHQpO1xufVxuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBgbnVsbGAgb3IgYHVuZGVmaW5lZGAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgbnVsbGlzaCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzTmlsKG51bGwpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNOaWwodm9pZCAwKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzTmlsKE5hTik7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc05pbCh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT0gbnVsbDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc05pbDtcbiIsIi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBfLm1hcGAgZm9yIGFycmF5cyB3aXRob3V0IHN1cHBvcnQgZm9yIGl0ZXJhdGVlXG4gKiBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBbYXJyYXldIFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBuZXcgbWFwcGVkIGFycmF5LlxuICovXG5mdW5jdGlvbiBhcnJheU1hcChhcnJheSwgaXRlcmF0ZWUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBhcnJheSA9PSBudWxsID8gMCA6IGFycmF5Lmxlbmd0aCxcbiAgICAgIHJlc3VsdCA9IEFycmF5KGxlbmd0aCk7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICByZXN1bHRbaW5kZXhdID0gaXRlcmF0ZWUoYXJyYXlbaW5kZXhdLCBpbmRleCwgYXJyYXkpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXJyYXlNYXA7XG4iLCIvKipcbiAqIFJlbW92ZXMgYWxsIGtleS12YWx1ZSBlbnRyaWVzIGZyb20gdGhlIGxpc3QgY2FjaGUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGNsZWFyXG4gKiBAbWVtYmVyT2YgTGlzdENhY2hlXG4gKi9cbmZ1bmN0aW9uIGxpc3RDYWNoZUNsZWFyKCkge1xuICB0aGlzLl9fZGF0YV9fID0gW107XG4gIHRoaXMuc2l6ZSA9IDA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbGlzdENhY2hlQ2xlYXI7XG4iLCIvKipcbiAqIFBlcmZvcm1zIGFcbiAqIFtgU2FtZVZhbHVlWmVyb2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXNhbWV2YWx1ZXplcm8pXG4gKiBjb21wYXJpc29uIGJldHdlZW4gdHdvIHZhbHVlcyB0byBkZXRlcm1pbmUgaWYgdGhleSBhcmUgZXF1aXZhbGVudC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB7Kn0gb3RoZXIgVGhlIG90aGVyIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAnYSc6IDEgfTtcbiAqIHZhciBvdGhlciA9IHsgJ2EnOiAxIH07XG4gKlxuICogXy5lcShvYmplY3QsIG9iamVjdCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5lcShvYmplY3QsIG90aGVyKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5lcSgnYScsICdhJyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5lcSgnYScsIE9iamVjdCgnYScpKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5lcShOYU4sIE5hTik7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGVxKHZhbHVlLCBvdGhlcikge1xuICByZXR1cm4gdmFsdWUgPT09IG90aGVyIHx8ICh2YWx1ZSAhPT0gdmFsdWUgJiYgb3RoZXIgIT09IG90aGVyKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBlcTtcbiIsInZhciBlcSA9IHJlcXVpcmUoJy4vZXEnKTtcblxuLyoqXG4gKiBHZXRzIHRoZSBpbmRleCBhdCB3aGljaCB0aGUgYGtleWAgaXMgZm91bmQgaW4gYGFycmF5YCBvZiBrZXktdmFsdWUgcGFpcnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBpbnNwZWN0LlxuICogQHBhcmFtIHsqfSBrZXkgVGhlIGtleSB0byBzZWFyY2ggZm9yLlxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIG1hdGNoZWQgdmFsdWUsIGVsc2UgYC0xYC5cbiAqL1xuZnVuY3Rpb24gYXNzb2NJbmRleE9mKGFycmF5LCBrZXkpIHtcbiAgdmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcbiAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgaWYgKGVxKGFycmF5W2xlbmd0aF1bMF0sIGtleSkpIHtcbiAgICAgIHJldHVybiBsZW5ndGg7XG4gICAgfVxuICB9XG4gIHJldHVybiAtMTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhc3NvY0luZGV4T2Y7XG4iLCJ2YXIgYXNzb2NJbmRleE9mID0gcmVxdWlyZSgnLi9fYXNzb2NJbmRleE9mJyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBhcnJheVByb3RvID0gQXJyYXkucHJvdG90eXBlO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBzcGxpY2UgPSBhcnJheVByb3RvLnNwbGljZTtcblxuLyoqXG4gKiBSZW1vdmVzIGBrZXlgIGFuZCBpdHMgdmFsdWUgZnJvbSB0aGUgbGlzdCBjYWNoZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZGVsZXRlXG4gKiBAbWVtYmVyT2YgTGlzdENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHJlbW92ZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZW50cnkgd2FzIHJlbW92ZWQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gbGlzdENhY2hlRGVsZXRlKGtleSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX18sXG4gICAgICBpbmRleCA9IGFzc29jSW5kZXhPZihkYXRhLCBrZXkpO1xuXG4gIGlmIChpbmRleCA8IDApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIGxhc3RJbmRleCA9IGRhdGEubGVuZ3RoIC0gMTtcbiAgaWYgKGluZGV4ID09IGxhc3RJbmRleCkge1xuICAgIGRhdGEucG9wKCk7XG4gIH0gZWxzZSB7XG4gICAgc3BsaWNlLmNhbGwoZGF0YSwgaW5kZXgsIDEpO1xuICB9XG4gIC0tdGhpcy5zaXplO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBsaXN0Q2FjaGVEZWxldGU7XG4iLCJ2YXIgYXNzb2NJbmRleE9mID0gcmVxdWlyZSgnLi9fYXNzb2NJbmRleE9mJyk7XG5cbi8qKlxuICogR2V0cyB0aGUgbGlzdCBjYWNoZSB2YWx1ZSBmb3IgYGtleWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGdldFxuICogQG1lbWJlck9mIExpc3RDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZW50cnkgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGxpc3RDYWNoZUdldChrZXkpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fLFxuICAgICAgaW5kZXggPSBhc3NvY0luZGV4T2YoZGF0YSwga2V5KTtcblxuICByZXR1cm4gaW5kZXggPCAwID8gdW5kZWZpbmVkIDogZGF0YVtpbmRleF1bMV07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbGlzdENhY2hlR2V0O1xuIiwidmFyIGFzc29jSW5kZXhPZiA9IHJlcXVpcmUoJy4vX2Fzc29jSW5kZXhPZicpO1xuXG4vKipcbiAqIENoZWNrcyBpZiBhIGxpc3QgY2FjaGUgdmFsdWUgZm9yIGBrZXlgIGV4aXN0cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgaGFzXG4gKiBAbWVtYmVyT2YgTGlzdENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIGVudHJ5IHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFuIGVudHJ5IGZvciBga2V5YCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gbGlzdENhY2hlSGFzKGtleSkge1xuICByZXR1cm4gYXNzb2NJbmRleE9mKHRoaXMuX19kYXRhX18sIGtleSkgPiAtMTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBsaXN0Q2FjaGVIYXM7XG4iLCJ2YXIgYXNzb2NJbmRleE9mID0gcmVxdWlyZSgnLi9fYXNzb2NJbmRleE9mJyk7XG5cbi8qKlxuICogU2V0cyB0aGUgbGlzdCBjYWNoZSBga2V5YCB0byBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBzZXRcbiAqIEBtZW1iZXJPZiBMaXN0Q2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gc2V0LlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2V0LlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgbGlzdCBjYWNoZSBpbnN0YW5jZS5cbiAqL1xuZnVuY3Rpb24gbGlzdENhY2hlU2V0KGtleSwgdmFsdWUpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fLFxuICAgICAgaW5kZXggPSBhc3NvY0luZGV4T2YoZGF0YSwga2V5KTtcblxuICBpZiAoaW5kZXggPCAwKSB7XG4gICAgKyt0aGlzLnNpemU7XG4gICAgZGF0YS5wdXNoKFtrZXksIHZhbHVlXSk7XG4gIH0gZWxzZSB7XG4gICAgZGF0YVtpbmRleF1bMV0gPSB2YWx1ZTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBsaXN0Q2FjaGVTZXQ7XG4iLCJ2YXIgbGlzdENhY2hlQ2xlYXIgPSByZXF1aXJlKCcuL19saXN0Q2FjaGVDbGVhcicpLFxuICAgIGxpc3RDYWNoZURlbGV0ZSA9IHJlcXVpcmUoJy4vX2xpc3RDYWNoZURlbGV0ZScpLFxuICAgIGxpc3RDYWNoZUdldCA9IHJlcXVpcmUoJy4vX2xpc3RDYWNoZUdldCcpLFxuICAgIGxpc3RDYWNoZUhhcyA9IHJlcXVpcmUoJy4vX2xpc3RDYWNoZUhhcycpLFxuICAgIGxpc3RDYWNoZVNldCA9IHJlcXVpcmUoJy4vX2xpc3RDYWNoZVNldCcpO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gbGlzdCBjYWNoZSBvYmplY3QuXG4gKlxuICogQHByaXZhdGVcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtBcnJheX0gW2VudHJpZXNdIFRoZSBrZXktdmFsdWUgcGFpcnMgdG8gY2FjaGUuXG4gKi9cbmZ1bmN0aW9uIExpc3RDYWNoZShlbnRyaWVzKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gZW50cmllcyA9PSBudWxsID8gMCA6IGVudHJpZXMubGVuZ3RoO1xuXG4gIHRoaXMuY2xlYXIoKTtcbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIgZW50cnkgPSBlbnRyaWVzW2luZGV4XTtcbiAgICB0aGlzLnNldChlbnRyeVswXSwgZW50cnlbMV0pO1xuICB9XG59XG5cbi8vIEFkZCBtZXRob2RzIHRvIGBMaXN0Q2FjaGVgLlxuTGlzdENhY2hlLnByb3RvdHlwZS5jbGVhciA9IGxpc3RDYWNoZUNsZWFyO1xuTGlzdENhY2hlLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBsaXN0Q2FjaGVEZWxldGU7XG5MaXN0Q2FjaGUucHJvdG90eXBlLmdldCA9IGxpc3RDYWNoZUdldDtcbkxpc3RDYWNoZS5wcm90b3R5cGUuaGFzID0gbGlzdENhY2hlSGFzO1xuTGlzdENhY2hlLnByb3RvdHlwZS5zZXQgPSBsaXN0Q2FjaGVTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gTGlzdENhY2hlO1xuIiwidmFyIExpc3RDYWNoZSA9IHJlcXVpcmUoJy4vX0xpc3RDYWNoZScpO1xuXG4vKipcbiAqIFJlbW92ZXMgYWxsIGtleS12YWx1ZSBlbnRyaWVzIGZyb20gdGhlIHN0YWNrLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBjbGVhclxuICogQG1lbWJlck9mIFN0YWNrXG4gKi9cbmZ1bmN0aW9uIHN0YWNrQ2xlYXIoKSB7XG4gIHRoaXMuX19kYXRhX18gPSBuZXcgTGlzdENhY2hlO1xuICB0aGlzLnNpemUgPSAwO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YWNrQ2xlYXI7XG4iLCIvKipcbiAqIFJlbW92ZXMgYGtleWAgYW5kIGl0cyB2YWx1ZSBmcm9tIHRoZSBzdGFjay5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZGVsZXRlXG4gKiBAbWVtYmVyT2YgU3RhY2tcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gcmVtb3ZlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBlbnRyeSB3YXMgcmVtb3ZlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBzdGFja0RlbGV0ZShrZXkpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fLFxuICAgICAgcmVzdWx0ID0gZGF0YVsnZGVsZXRlJ10oa2V5KTtcblxuICB0aGlzLnNpemUgPSBkYXRhLnNpemU7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3RhY2tEZWxldGU7XG4iLCIvKipcbiAqIEdldHMgdGhlIHN0YWNrIHZhbHVlIGZvciBga2V5YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZ2V0XG4gKiBAbWVtYmVyT2YgU3RhY2tcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGVudHJ5IHZhbHVlLlxuICovXG5mdW5jdGlvbiBzdGFja0dldChrZXkpIHtcbiAgcmV0dXJuIHRoaXMuX19kYXRhX18uZ2V0KGtleSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3RhY2tHZXQ7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBhIHN0YWNrIHZhbHVlIGZvciBga2V5YCBleGlzdHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGhhc1xuICogQG1lbWJlck9mIFN0YWNrXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIGVudHJ5IHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFuIGVudHJ5IGZvciBga2V5YCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gc3RhY2tIYXMoa2V5KSB7XG4gIHJldHVybiB0aGlzLl9fZGF0YV9fLmhhcyhrZXkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YWNrSGFzO1xuIiwiLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBnbG9iYWxgIGZyb20gTm9kZS5qcy4gKi9cbnZhciBmcmVlR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWwgJiYgZ2xvYmFsLk9iamVjdCA9PT0gT2JqZWN0ICYmIGdsb2JhbDtcblxubW9kdWxlLmV4cG9ydHMgPSBmcmVlR2xvYmFsO1xuIiwidmFyIGZyZWVHbG9iYWwgPSByZXF1aXJlKCcuL19mcmVlR2xvYmFsJyk7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgc2VsZmAuICovXG52YXIgZnJlZVNlbGYgPSB0eXBlb2Ygc2VsZiA9PSAnb2JqZWN0JyAmJiBzZWxmICYmIHNlbGYuT2JqZWN0ID09PSBPYmplY3QgJiYgc2VsZjtcblxuLyoqIFVzZWQgYXMgYSByZWZlcmVuY2UgdG8gdGhlIGdsb2JhbCBvYmplY3QuICovXG52YXIgcm9vdCA9IGZyZWVHbG9iYWwgfHwgZnJlZVNlbGYgfHwgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblxubW9kdWxlLmV4cG9ydHMgPSByb290O1xuIiwidmFyIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIFN5bWJvbCA9IHJvb3QuU3ltYm9sO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN5bWJvbDtcbiIsInZhciBTeW1ib2wgPSByZXF1aXJlKCcuL19TeW1ib2wnKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG5hdGl2ZU9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHN5bVRvU3RyaW5nVGFnID0gU3ltYm9sID8gU3ltYm9sLnRvU3RyaW5nVGFnIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgYmFzZUdldFRhZ2Agd2hpY2ggaWdub3JlcyBgU3ltYm9sLnRvU3RyaW5nVGFnYCB2YWx1ZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgcmF3IGB0b1N0cmluZ1RhZ2AuXG4gKi9cbmZ1bmN0aW9uIGdldFJhd1RhZyh2YWx1ZSkge1xuICB2YXIgaXNPd24gPSBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBzeW1Ub1N0cmluZ1RhZyksXG4gICAgICB0YWcgPSB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ107XG5cbiAgdHJ5IHtcbiAgICB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ10gPSB1bmRlZmluZWQ7XG4gICAgdmFyIHVubWFza2VkID0gdHJ1ZTtcbiAgfSBjYXRjaCAoZSkge31cblxuICB2YXIgcmVzdWx0ID0gbmF0aXZlT2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIGlmICh1bm1hc2tlZCkge1xuICAgIGlmIChpc093bikge1xuICAgICAgdmFsdWVbc3ltVG9TdHJpbmdUYWddID0gdGFnO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWxldGUgdmFsdWVbc3ltVG9TdHJpbmdUYWddO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFJhd1RhZztcbiIsIi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBuYXRpdmVPYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKipcbiAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYSBzdHJpbmcgdXNpbmcgYE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmdgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjb252ZXJ0LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgY29udmVydGVkIHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gb2JqZWN0VG9TdHJpbmcodmFsdWUpIHtcbiAgcmV0dXJuIG5hdGl2ZU9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG9iamVjdFRvU3RyaW5nO1xuIiwidmFyIFN5bWJvbCA9IHJlcXVpcmUoJy4vX1N5bWJvbCcpLFxuICAgIGdldFJhd1RhZyA9IHJlcXVpcmUoJy4vX2dldFJhd1RhZycpLFxuICAgIG9iamVjdFRvU3RyaW5nID0gcmVxdWlyZSgnLi9fb2JqZWN0VG9TdHJpbmcnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIG51bGxUYWcgPSAnW29iamVjdCBOdWxsXScsXG4gICAgdW5kZWZpbmVkVGFnID0gJ1tvYmplY3QgVW5kZWZpbmVkXSc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHN5bVRvU3RyaW5nVGFnID0gU3ltYm9sID8gU3ltYm9sLnRvU3RyaW5nVGFnIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBnZXRUYWdgIHdpdGhvdXQgZmFsbGJhY2tzIGZvciBidWdneSBlbnZpcm9ubWVudHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgYHRvU3RyaW5nVGFnYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUdldFRhZyh2YWx1ZSkge1xuICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkVGFnIDogbnVsbFRhZztcbiAgfVxuICByZXR1cm4gKHN5bVRvU3RyaW5nVGFnICYmIHN5bVRvU3RyaW5nVGFnIGluIE9iamVjdCh2YWx1ZSkpXG4gICAgPyBnZXRSYXdUYWcodmFsdWUpXG4gICAgOiBvYmplY3RUb1N0cmluZyh2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUdldFRhZztcbiIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgdGhlXG4gKiBbbGFuZ3VhZ2UgdHlwZV0oaHR0cDovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLWVjbWFzY3JpcHQtbGFuZ3VhZ2UtdHlwZXMpXG4gKiBvZiBgT2JqZWN0YC4gKGUuZy4gYXJyYXlzLCBmdW5jdGlvbnMsIG9iamVjdHMsIHJlZ2V4ZXMsIGBuZXcgTnVtYmVyKDApYCwgYW5kIGBuZXcgU3RyaW5nKCcnKWApXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3Qoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KF8ubm9vcCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiAodHlwZSA9PSAnb2JqZWN0JyB8fCB0eXBlID09ICdmdW5jdGlvbicpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzT2JqZWN0O1xuIiwidmFyIGJhc2VHZXRUYWcgPSByZXF1aXJlKCcuL19iYXNlR2V0VGFnJyksXG4gICAgaXNPYmplY3QgPSByZXF1aXJlKCcuL2lzT2JqZWN0Jyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBhc3luY1RhZyA9ICdbb2JqZWN0IEFzeW5jRnVuY3Rpb25dJyxcbiAgICBmdW5jVGFnID0gJ1tvYmplY3QgRnVuY3Rpb25dJyxcbiAgICBnZW5UYWcgPSAnW29iamVjdCBHZW5lcmF0b3JGdW5jdGlvbl0nLFxuICAgIHByb3h5VGFnID0gJ1tvYmplY3QgUHJveHldJztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgYEZ1bmN0aW9uYCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBmdW5jdGlvbiwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzRnVuY3Rpb24oXyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0Z1bmN0aW9uKC9hYmMvKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsdWUpIHtcbiAgaWYgKCFpc09iamVjdCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy8gVGhlIHVzZSBvZiBgT2JqZWN0I3RvU3RyaW5nYCBhdm9pZHMgaXNzdWVzIHdpdGggdGhlIGB0eXBlb2ZgIG9wZXJhdG9yXG4gIC8vIGluIFNhZmFyaSA5IHdoaWNoIHJldHVybnMgJ29iamVjdCcgZm9yIHR5cGVkIGFycmF5cyBhbmQgb3RoZXIgY29uc3RydWN0b3JzLlxuICB2YXIgdGFnID0gYmFzZUdldFRhZyh2YWx1ZSk7XG4gIHJldHVybiB0YWcgPT0gZnVuY1RhZyB8fCB0YWcgPT0gZ2VuVGFnIHx8IHRhZyA9PSBhc3luY1RhZyB8fCB0YWcgPT0gcHJveHlUYWc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNGdW5jdGlvbjtcbiIsInZhciByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiogVXNlZCB0byBkZXRlY3Qgb3ZlcnJlYWNoaW5nIGNvcmUtanMgc2hpbXMuICovXG52YXIgY29yZUpzRGF0YSA9IHJvb3RbJ19fY29yZS1qc19zaGFyZWRfXyddO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvcmVKc0RhdGE7XG4iLCJ2YXIgY29yZUpzRGF0YSA9IHJlcXVpcmUoJy4vX2NvcmVKc0RhdGEnKTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IG1ldGhvZHMgbWFzcXVlcmFkaW5nIGFzIG5hdGl2ZS4gKi9cbnZhciBtYXNrU3JjS2V5ID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdWlkID0gL1teLl0rJC8uZXhlYyhjb3JlSnNEYXRhICYmIGNvcmVKc0RhdGEua2V5cyAmJiBjb3JlSnNEYXRhLmtleXMuSUVfUFJPVE8gfHwgJycpO1xuICByZXR1cm4gdWlkID8gKCdTeW1ib2woc3JjKV8xLicgKyB1aWQpIDogJyc7XG59KCkpO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgZnVuY2AgaGFzIGl0cyBzb3VyY2UgbWFza2VkLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgZnVuY2AgaXMgbWFza2VkLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzTWFza2VkKGZ1bmMpIHtcbiAgcmV0dXJuICEhbWFza1NyY0tleSAmJiAobWFza1NyY0tleSBpbiBmdW5jKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc01hc2tlZDtcbiIsIi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBmdW5jUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGRlY29tcGlsZWQgc291cmNlIG9mIGZ1bmN0aW9ucy4gKi9cbnZhciBmdW5jVG9TdHJpbmcgPSBmdW5jUHJvdG8udG9TdHJpbmc7XG5cbi8qKlxuICogQ29udmVydHMgYGZ1bmNgIHRvIGl0cyBzb3VyY2UgY29kZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHNvdXJjZSBjb2RlLlxuICovXG5mdW5jdGlvbiB0b1NvdXJjZShmdW5jKSB7XG4gIGlmIChmdW5jICE9IG51bGwpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGZ1bmNUb1N0cmluZy5jYWxsKGZ1bmMpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiAoZnVuYyArICcnKTtcbiAgICB9IGNhdGNoIChlKSB7fVxuICB9XG4gIHJldHVybiAnJztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0b1NvdXJjZTtcbiIsInZhciBpc0Z1bmN0aW9uID0gcmVxdWlyZSgnLi9pc0Z1bmN0aW9uJyksXG4gICAgaXNNYXNrZWQgPSByZXF1aXJlKCcuL19pc01hc2tlZCcpLFxuICAgIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9pc09iamVjdCcpLFxuICAgIHRvU291cmNlID0gcmVxdWlyZSgnLi9fdG9Tb3VyY2UnKTtcblxuLyoqXG4gKiBVc2VkIHRvIG1hdGNoIGBSZWdFeHBgXG4gKiBbc3ludGF4IGNoYXJhY3RlcnNdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXBhdHRlcm5zKS5cbiAqL1xudmFyIHJlUmVnRXhwQ2hhciA9IC9bXFxcXF4kLiorPygpW1xcXXt9fF0vZztcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGhvc3QgY29uc3RydWN0b3JzIChTYWZhcmkpLiAqL1xudmFyIHJlSXNIb3N0Q3RvciA9IC9eXFxbb2JqZWN0IC4rP0NvbnN0cnVjdG9yXFxdJC87XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBmdW5jUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGUsXG4gICAgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byByZXNvbHZlIHRoZSBkZWNvbXBpbGVkIHNvdXJjZSBvZiBmdW5jdGlvbnMuICovXG52YXIgZnVuY1RvU3RyaW5nID0gZnVuY1Byb3RvLnRvU3RyaW5nO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKiogVXNlZCB0byBkZXRlY3QgaWYgYSBtZXRob2QgaXMgbmF0aXZlLiAqL1xudmFyIHJlSXNOYXRpdmUgPSBSZWdFeHAoJ14nICtcbiAgZnVuY1RvU3RyaW5nLmNhbGwoaGFzT3duUHJvcGVydHkpLnJlcGxhY2UocmVSZWdFeHBDaGFyLCAnXFxcXCQmJylcbiAgLnJlcGxhY2UoL2hhc093blByb3BlcnR5fChmdW5jdGlvbikuKj8oPz1cXFxcXFwoKXwgZm9yIC4rPyg/PVxcXFxcXF0pL2csICckMS4qPycpICsgJyQnXG4pO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzTmF0aXZlYCB3aXRob3V0IGJhZCBzaGltIGNoZWNrcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIG5hdGl2ZSBmdW5jdGlvbixcbiAqICBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc05hdGl2ZSh2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0KHZhbHVlKSB8fCBpc01hc2tlZCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHBhdHRlcm4gPSBpc0Z1bmN0aW9uKHZhbHVlKSA/IHJlSXNOYXRpdmUgOiByZUlzSG9zdEN0b3I7XG4gIHJldHVybiBwYXR0ZXJuLnRlc3QodG9Tb3VyY2UodmFsdWUpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlSXNOYXRpdmU7XG4iLCIvKipcbiAqIEdldHMgdGhlIHZhbHVlIGF0IGBrZXlgIG9mIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gW29iamVjdF0gVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHByb3BlcnR5IHZhbHVlLlxuICovXG5mdW5jdGlvbiBnZXRWYWx1ZShvYmplY3QsIGtleSkge1xuICByZXR1cm4gb2JqZWN0ID09IG51bGwgPyB1bmRlZmluZWQgOiBvYmplY3Rba2V5XTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRWYWx1ZTtcbiIsInZhciBiYXNlSXNOYXRpdmUgPSByZXF1aXJlKCcuL19iYXNlSXNOYXRpdmUnKSxcbiAgICBnZXRWYWx1ZSA9IHJlcXVpcmUoJy4vX2dldFZhbHVlJyk7XG5cbi8qKlxuICogR2V0cyB0aGUgbmF0aXZlIGZ1bmN0aW9uIGF0IGBrZXlgIG9mIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIG1ldGhvZCB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZnVuY3Rpb24gaWYgaXQncyBuYXRpdmUsIGVsc2UgYHVuZGVmaW5lZGAuXG4gKi9cbmZ1bmN0aW9uIGdldE5hdGl2ZShvYmplY3QsIGtleSkge1xuICB2YXIgdmFsdWUgPSBnZXRWYWx1ZShvYmplY3QsIGtleSk7XG4gIHJldHVybiBiYXNlSXNOYXRpdmUodmFsdWUpID8gdmFsdWUgOiB1bmRlZmluZWQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0TmF0aXZlO1xuIiwidmFyIGdldE5hdGl2ZSA9IHJlcXVpcmUoJy4vX2dldE5hdGl2ZScpLFxuICAgIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHRoYXQgYXJlIHZlcmlmaWVkIHRvIGJlIG5hdGl2ZS4gKi9cbnZhciBNYXAgPSBnZXROYXRpdmUocm9vdCwgJ01hcCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcDtcbiIsInZhciBnZXROYXRpdmUgPSByZXF1aXJlKCcuL19nZXROYXRpdmUnKTtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgdGhhdCBhcmUgdmVyaWZpZWQgdG8gYmUgbmF0aXZlLiAqL1xudmFyIG5hdGl2ZUNyZWF0ZSA9IGdldE5hdGl2ZShPYmplY3QsICdjcmVhdGUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBuYXRpdmVDcmVhdGU7XG4iLCJ2YXIgbmF0aXZlQ3JlYXRlID0gcmVxdWlyZSgnLi9fbmF0aXZlQ3JlYXRlJyk7XG5cbi8qKlxuICogUmVtb3ZlcyBhbGwga2V5LXZhbHVlIGVudHJpZXMgZnJvbSB0aGUgaGFzaC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgY2xlYXJcbiAqIEBtZW1iZXJPZiBIYXNoXG4gKi9cbmZ1bmN0aW9uIGhhc2hDbGVhcigpIHtcbiAgdGhpcy5fX2RhdGFfXyA9IG5hdGl2ZUNyZWF0ZSA/IG5hdGl2ZUNyZWF0ZShudWxsKSA6IHt9O1xuICB0aGlzLnNpemUgPSAwO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGhhc2hDbGVhcjtcbiIsIi8qKlxuICogUmVtb3ZlcyBga2V5YCBhbmQgaXRzIHZhbHVlIGZyb20gdGhlIGhhc2guXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGRlbGV0ZVxuICogQG1lbWJlck9mIEhhc2hcbiAqIEBwYXJhbSB7T2JqZWN0fSBoYXNoIFRoZSBoYXNoIHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gcmVtb3ZlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBlbnRyeSB3YXMgcmVtb3ZlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBoYXNoRGVsZXRlKGtleSkge1xuICB2YXIgcmVzdWx0ID0gdGhpcy5oYXMoa2V5KSAmJiBkZWxldGUgdGhpcy5fX2RhdGFfX1trZXldO1xuICB0aGlzLnNpemUgLT0gcmVzdWx0ID8gMSA6IDA7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaGFzaERlbGV0ZTtcbiIsInZhciBuYXRpdmVDcmVhdGUgPSByZXF1aXJlKCcuL19uYXRpdmVDcmVhdGUnKTtcblxuLyoqIFVzZWQgdG8gc3RhbmQtaW4gZm9yIGB1bmRlZmluZWRgIGhhc2ggdmFsdWVzLiAqL1xudmFyIEhBU0hfVU5ERUZJTkVEID0gJ19fbG9kYXNoX2hhc2hfdW5kZWZpbmVkX18nO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIEdldHMgdGhlIGhhc2ggdmFsdWUgZm9yIGBrZXlgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBnZXRcbiAqIEBtZW1iZXJPZiBIYXNoXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBlbnRyeSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gaGFzaEdldChrZXkpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fO1xuICBpZiAobmF0aXZlQ3JlYXRlKSB7XG4gICAgdmFyIHJlc3VsdCA9IGRhdGFba2V5XTtcbiAgICByZXR1cm4gcmVzdWx0ID09PSBIQVNIX1VOREVGSU5FRCA/IHVuZGVmaW5lZCA6IHJlc3VsdDtcbiAgfVxuICByZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChkYXRhLCBrZXkpID8gZGF0YVtrZXldIDogdW5kZWZpbmVkO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGhhc2hHZXQ7XG4iLCJ2YXIgbmF0aXZlQ3JlYXRlID0gcmVxdWlyZSgnLi9fbmF0aXZlQ3JlYXRlJyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGEgaGFzaCB2YWx1ZSBmb3IgYGtleWAgZXhpc3RzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBoYXNcbiAqIEBtZW1iZXJPZiBIYXNoXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIGVudHJ5IHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFuIGVudHJ5IGZvciBga2V5YCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaGFzaEhhcyhrZXkpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fO1xuICByZXR1cm4gbmF0aXZlQ3JlYXRlID8gKGRhdGFba2V5XSAhPT0gdW5kZWZpbmVkKSA6IGhhc093blByb3BlcnR5LmNhbGwoZGF0YSwga2V5KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBoYXNoSGFzO1xuIiwidmFyIG5hdGl2ZUNyZWF0ZSA9IHJlcXVpcmUoJy4vX25hdGl2ZUNyZWF0ZScpO1xuXG4vKiogVXNlZCB0byBzdGFuZC1pbiBmb3IgYHVuZGVmaW5lZGAgaGFzaCB2YWx1ZXMuICovXG52YXIgSEFTSF9VTkRFRklORUQgPSAnX19sb2Rhc2hfaGFzaF91bmRlZmluZWRfXyc7XG5cbi8qKlxuICogU2V0cyB0aGUgaGFzaCBga2V5YCB0byBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBzZXRcbiAqIEBtZW1iZXJPZiBIYXNoXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHNldC5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHNldC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGhhc2ggaW5zdGFuY2UuXG4gKi9cbmZ1bmN0aW9uIGhhc2hTZXQoa2V5LCB2YWx1ZSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX187XG4gIHRoaXMuc2l6ZSArPSB0aGlzLmhhcyhrZXkpID8gMCA6IDE7XG4gIGRhdGFba2V5XSA9IChuYXRpdmVDcmVhdGUgJiYgdmFsdWUgPT09IHVuZGVmaW5lZCkgPyBIQVNIX1VOREVGSU5FRCA6IHZhbHVlO1xuICByZXR1cm4gdGhpcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBoYXNoU2V0O1xuIiwidmFyIGhhc2hDbGVhciA9IHJlcXVpcmUoJy4vX2hhc2hDbGVhcicpLFxuICAgIGhhc2hEZWxldGUgPSByZXF1aXJlKCcuL19oYXNoRGVsZXRlJyksXG4gICAgaGFzaEdldCA9IHJlcXVpcmUoJy4vX2hhc2hHZXQnKSxcbiAgICBoYXNoSGFzID0gcmVxdWlyZSgnLi9faGFzaEhhcycpLFxuICAgIGhhc2hTZXQgPSByZXF1aXJlKCcuL19oYXNoU2V0Jyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGhhc2ggb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7QXJyYXl9IFtlbnRyaWVzXSBUaGUga2V5LXZhbHVlIHBhaXJzIHRvIGNhY2hlLlxuICovXG5mdW5jdGlvbiBIYXNoKGVudHJpZXMpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBlbnRyaWVzID09IG51bGwgPyAwIDogZW50cmllcy5sZW5ndGg7XG5cbiAgdGhpcy5jbGVhcigpO1xuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBlbnRyeSA9IGVudHJpZXNbaW5kZXhdO1xuICAgIHRoaXMuc2V0KGVudHJ5WzBdLCBlbnRyeVsxXSk7XG4gIH1cbn1cblxuLy8gQWRkIG1ldGhvZHMgdG8gYEhhc2hgLlxuSGFzaC5wcm90b3R5cGUuY2xlYXIgPSBoYXNoQ2xlYXI7XG5IYXNoLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBoYXNoRGVsZXRlO1xuSGFzaC5wcm90b3R5cGUuZ2V0ID0gaGFzaEdldDtcbkhhc2gucHJvdG90eXBlLmhhcyA9IGhhc2hIYXM7XG5IYXNoLnByb3RvdHlwZS5zZXQgPSBoYXNoU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhhc2g7XG4iLCJ2YXIgSGFzaCA9IHJlcXVpcmUoJy4vX0hhc2gnKSxcbiAgICBMaXN0Q2FjaGUgPSByZXF1aXJlKCcuL19MaXN0Q2FjaGUnKSxcbiAgICBNYXAgPSByZXF1aXJlKCcuL19NYXAnKTtcblxuLyoqXG4gKiBSZW1vdmVzIGFsbCBrZXktdmFsdWUgZW50cmllcyBmcm9tIHRoZSBtYXAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGNsZWFyXG4gKiBAbWVtYmVyT2YgTWFwQ2FjaGVcbiAqL1xuZnVuY3Rpb24gbWFwQ2FjaGVDbGVhcigpIHtcbiAgdGhpcy5zaXplID0gMDtcbiAgdGhpcy5fX2RhdGFfXyA9IHtcbiAgICAnaGFzaCc6IG5ldyBIYXNoLFxuICAgICdtYXAnOiBuZXcgKE1hcCB8fCBMaXN0Q2FjaGUpLFxuICAgICdzdHJpbmcnOiBuZXcgSGFzaFxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1hcENhY2hlQ2xlYXI7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHN1aXRhYmxlIGZvciB1c2UgYXMgdW5pcXVlIG9iamVjdCBrZXkuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgc3VpdGFibGUsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNLZXlhYmxlKHZhbHVlKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICByZXR1cm4gKHR5cGUgPT0gJ3N0cmluZycgfHwgdHlwZSA9PSAnbnVtYmVyJyB8fCB0eXBlID09ICdzeW1ib2wnIHx8IHR5cGUgPT0gJ2Jvb2xlYW4nKVxuICAgID8gKHZhbHVlICE9PSAnX19wcm90b19fJylcbiAgICA6ICh2YWx1ZSA9PT0gbnVsbCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNLZXlhYmxlO1xuIiwidmFyIGlzS2V5YWJsZSA9IHJlcXVpcmUoJy4vX2lzS2V5YWJsZScpO1xuXG4vKipcbiAqIEdldHMgdGhlIGRhdGEgZm9yIGBtYXBgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gbWFwIFRoZSBtYXAgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSByZWZlcmVuY2Uga2V5LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIG1hcCBkYXRhLlxuICovXG5mdW5jdGlvbiBnZXRNYXBEYXRhKG1hcCwga2V5KSB7XG4gIHZhciBkYXRhID0gbWFwLl9fZGF0YV9fO1xuICByZXR1cm4gaXNLZXlhYmxlKGtleSlcbiAgICA/IGRhdGFbdHlwZW9mIGtleSA9PSAnc3RyaW5nJyA/ICdzdHJpbmcnIDogJ2hhc2gnXVxuICAgIDogZGF0YS5tYXA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0TWFwRGF0YTtcbiIsInZhciBnZXRNYXBEYXRhID0gcmVxdWlyZSgnLi9fZ2V0TWFwRGF0YScpO1xuXG4vKipcbiAqIFJlbW92ZXMgYGtleWAgYW5kIGl0cyB2YWx1ZSBmcm9tIHRoZSBtYXAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGRlbGV0ZVxuICogQG1lbWJlck9mIE1hcENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHJlbW92ZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZW50cnkgd2FzIHJlbW92ZWQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gbWFwQ2FjaGVEZWxldGUoa2V5KSB7XG4gIHZhciByZXN1bHQgPSBnZXRNYXBEYXRhKHRoaXMsIGtleSlbJ2RlbGV0ZSddKGtleSk7XG4gIHRoaXMuc2l6ZSAtPSByZXN1bHQgPyAxIDogMDtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtYXBDYWNoZURlbGV0ZTtcbiIsInZhciBnZXRNYXBEYXRhID0gcmVxdWlyZSgnLi9fZ2V0TWFwRGF0YScpO1xuXG4vKipcbiAqIEdldHMgdGhlIG1hcCB2YWx1ZSBmb3IgYGtleWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGdldFxuICogQG1lbWJlck9mIE1hcENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBlbnRyeSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gbWFwQ2FjaGVHZXQoa2V5KSB7XG4gIHJldHVybiBnZXRNYXBEYXRhKHRoaXMsIGtleSkuZ2V0KGtleSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWFwQ2FjaGVHZXQ7XG4iLCJ2YXIgZ2V0TWFwRGF0YSA9IHJlcXVpcmUoJy4vX2dldE1hcERhdGEnKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYSBtYXAgdmFsdWUgZm9yIGBrZXlgIGV4aXN0cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgaGFzXG4gKiBAbWVtYmVyT2YgTWFwQ2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgZW50cnkgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYW4gZW50cnkgZm9yIGBrZXlgIGV4aXN0cywgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBtYXBDYWNoZUhhcyhrZXkpIHtcbiAgcmV0dXJuIGdldE1hcERhdGEodGhpcywga2V5KS5oYXMoa2V5KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtYXBDYWNoZUhhcztcbiIsInZhciBnZXRNYXBEYXRhID0gcmVxdWlyZSgnLi9fZ2V0TWFwRGF0YScpO1xuXG4vKipcbiAqIFNldHMgdGhlIG1hcCBga2V5YCB0byBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBzZXRcbiAqIEBtZW1iZXJPZiBNYXBDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBtYXAgY2FjaGUgaW5zdGFuY2UuXG4gKi9cbmZ1bmN0aW9uIG1hcENhY2hlU2V0KGtleSwgdmFsdWUpIHtcbiAgdmFyIGRhdGEgPSBnZXRNYXBEYXRhKHRoaXMsIGtleSksXG4gICAgICBzaXplID0gZGF0YS5zaXplO1xuXG4gIGRhdGEuc2V0KGtleSwgdmFsdWUpO1xuICB0aGlzLnNpemUgKz0gZGF0YS5zaXplID09IHNpemUgPyAwIDogMTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWFwQ2FjaGVTZXQ7XG4iLCJ2YXIgbWFwQ2FjaGVDbGVhciA9IHJlcXVpcmUoJy4vX21hcENhY2hlQ2xlYXInKSxcbiAgICBtYXBDYWNoZURlbGV0ZSA9IHJlcXVpcmUoJy4vX21hcENhY2hlRGVsZXRlJyksXG4gICAgbWFwQ2FjaGVHZXQgPSByZXF1aXJlKCcuL19tYXBDYWNoZUdldCcpLFxuICAgIG1hcENhY2hlSGFzID0gcmVxdWlyZSgnLi9fbWFwQ2FjaGVIYXMnKSxcbiAgICBtYXBDYWNoZVNldCA9IHJlcXVpcmUoJy4vX21hcENhY2hlU2V0Jyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG1hcCBjYWNoZSBvYmplY3QgdG8gc3RvcmUga2V5LXZhbHVlIHBhaXJzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7QXJyYXl9IFtlbnRyaWVzXSBUaGUga2V5LXZhbHVlIHBhaXJzIHRvIGNhY2hlLlxuICovXG5mdW5jdGlvbiBNYXBDYWNoZShlbnRyaWVzKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gZW50cmllcyA9PSBudWxsID8gMCA6IGVudHJpZXMubGVuZ3RoO1xuXG4gIHRoaXMuY2xlYXIoKTtcbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIgZW50cnkgPSBlbnRyaWVzW2luZGV4XTtcbiAgICB0aGlzLnNldChlbnRyeVswXSwgZW50cnlbMV0pO1xuICB9XG59XG5cbi8vIEFkZCBtZXRob2RzIHRvIGBNYXBDYWNoZWAuXG5NYXBDYWNoZS5wcm90b3R5cGUuY2xlYXIgPSBtYXBDYWNoZUNsZWFyO1xuTWFwQ2FjaGUucHJvdG90eXBlWydkZWxldGUnXSA9IG1hcENhY2hlRGVsZXRlO1xuTWFwQ2FjaGUucHJvdG90eXBlLmdldCA9IG1hcENhY2hlR2V0O1xuTWFwQ2FjaGUucHJvdG90eXBlLmhhcyA9IG1hcENhY2hlSGFzO1xuTWFwQ2FjaGUucHJvdG90eXBlLnNldCA9IG1hcENhY2hlU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcENhY2hlO1xuIiwidmFyIExpc3RDYWNoZSA9IHJlcXVpcmUoJy4vX0xpc3RDYWNoZScpLFxuICAgIE1hcCA9IHJlcXVpcmUoJy4vX01hcCcpLFxuICAgIE1hcENhY2hlID0gcmVxdWlyZSgnLi9fTWFwQ2FjaGUnKTtcblxuLyoqIFVzZWQgYXMgdGhlIHNpemUgdG8gZW5hYmxlIGxhcmdlIGFycmF5IG9wdGltaXphdGlvbnMuICovXG52YXIgTEFSR0VfQVJSQVlfU0laRSA9IDIwMDtcblxuLyoqXG4gKiBTZXRzIHRoZSBzdGFjayBga2V5YCB0byBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBzZXRcbiAqIEBtZW1iZXJPZiBTdGFja1xuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBzdGFjayBjYWNoZSBpbnN0YW5jZS5cbiAqL1xuZnVuY3Rpb24gc3RhY2tTZXQoa2V5LCB2YWx1ZSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX187XG4gIGlmIChkYXRhIGluc3RhbmNlb2YgTGlzdENhY2hlKSB7XG4gICAgdmFyIHBhaXJzID0gZGF0YS5fX2RhdGFfXztcbiAgICBpZiAoIU1hcCB8fCAocGFpcnMubGVuZ3RoIDwgTEFSR0VfQVJSQVlfU0laRSAtIDEpKSB7XG4gICAgICBwYWlycy5wdXNoKFtrZXksIHZhbHVlXSk7XG4gICAgICB0aGlzLnNpemUgPSArK2RhdGEuc2l6ZTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBkYXRhID0gdGhpcy5fX2RhdGFfXyA9IG5ldyBNYXBDYWNoZShwYWlycyk7XG4gIH1cbiAgZGF0YS5zZXQoa2V5LCB2YWx1ZSk7XG4gIHRoaXMuc2l6ZSA9IGRhdGEuc2l6ZTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3RhY2tTZXQ7XG4iLCJ2YXIgTGlzdENhY2hlID0gcmVxdWlyZSgnLi9fTGlzdENhY2hlJyksXG4gICAgc3RhY2tDbGVhciA9IHJlcXVpcmUoJy4vX3N0YWNrQ2xlYXInKSxcbiAgICBzdGFja0RlbGV0ZSA9IHJlcXVpcmUoJy4vX3N0YWNrRGVsZXRlJyksXG4gICAgc3RhY2tHZXQgPSByZXF1aXJlKCcuL19zdGFja0dldCcpLFxuICAgIHN0YWNrSGFzID0gcmVxdWlyZSgnLi9fc3RhY2tIYXMnKSxcbiAgICBzdGFja1NldCA9IHJlcXVpcmUoJy4vX3N0YWNrU2V0Jyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIHN0YWNrIGNhY2hlIG9iamVjdCB0byBzdG9yZSBrZXktdmFsdWUgcGFpcnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtBcnJheX0gW2VudHJpZXNdIFRoZSBrZXktdmFsdWUgcGFpcnMgdG8gY2FjaGUuXG4gKi9cbmZ1bmN0aW9uIFN0YWNrKGVudHJpZXMpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fID0gbmV3IExpc3RDYWNoZShlbnRyaWVzKTtcbiAgdGhpcy5zaXplID0gZGF0YS5zaXplO1xufVxuXG4vLyBBZGQgbWV0aG9kcyB0byBgU3RhY2tgLlxuU3RhY2sucHJvdG90eXBlLmNsZWFyID0gc3RhY2tDbGVhcjtcblN0YWNrLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBzdGFja0RlbGV0ZTtcblN0YWNrLnByb3RvdHlwZS5nZXQgPSBzdGFja0dldDtcblN0YWNrLnByb3RvdHlwZS5oYXMgPSBzdGFja0hhcztcblN0YWNrLnByb3RvdHlwZS5zZXQgPSBzdGFja1NldDtcblxubW9kdWxlLmV4cG9ydHMgPSBTdGFjaztcbiIsIi8qKiBVc2VkIHRvIHN0YW5kLWluIGZvciBgdW5kZWZpbmVkYCBoYXNoIHZhbHVlcy4gKi9cbnZhciBIQVNIX1VOREVGSU5FRCA9ICdfX2xvZGFzaF9oYXNoX3VuZGVmaW5lZF9fJztcblxuLyoqXG4gKiBBZGRzIGB2YWx1ZWAgdG8gdGhlIGFycmF5IGNhY2hlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBhZGRcbiAqIEBtZW1iZXJPZiBTZXRDYWNoZVxuICogQGFsaWFzIHB1c2hcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNhY2hlLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgY2FjaGUgaW5zdGFuY2UuXG4gKi9cbmZ1bmN0aW9uIHNldENhY2hlQWRkKHZhbHVlKSB7XG4gIHRoaXMuX19kYXRhX18uc2V0KHZhbHVlLCBIQVNIX1VOREVGSU5FRCk7XG4gIHJldHVybiB0aGlzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNldENhY2hlQWRkO1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBpbiB0aGUgYXJyYXkgY2FjaGUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGhhc1xuICogQG1lbWJlck9mIFNldENhY2hlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBzZWFyY2ggZm9yLlxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBmb3VuZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBzZXRDYWNoZUhhcyh2YWx1ZSkge1xuICByZXR1cm4gdGhpcy5fX2RhdGFfXy5oYXModmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNldENhY2hlSGFzO1xuIiwidmFyIE1hcENhY2hlID0gcmVxdWlyZSgnLi9fTWFwQ2FjaGUnKSxcbiAgICBzZXRDYWNoZUFkZCA9IHJlcXVpcmUoJy4vX3NldENhY2hlQWRkJyksXG4gICAgc2V0Q2FjaGVIYXMgPSByZXF1aXJlKCcuL19zZXRDYWNoZUhhcycpO1xuXG4vKipcbiAqXG4gKiBDcmVhdGVzIGFuIGFycmF5IGNhY2hlIG9iamVjdCB0byBzdG9yZSB1bmlxdWUgdmFsdWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7QXJyYXl9IFt2YWx1ZXNdIFRoZSB2YWx1ZXMgdG8gY2FjaGUuXG4gKi9cbmZ1bmN0aW9uIFNldENhY2hlKHZhbHVlcykge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IHZhbHVlcyA9PSBudWxsID8gMCA6IHZhbHVlcy5sZW5ndGg7XG5cbiAgdGhpcy5fX2RhdGFfXyA9IG5ldyBNYXBDYWNoZTtcbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB0aGlzLmFkZCh2YWx1ZXNbaW5kZXhdKTtcbiAgfVxufVxuXG4vLyBBZGQgbWV0aG9kcyB0byBgU2V0Q2FjaGVgLlxuU2V0Q2FjaGUucHJvdG90eXBlLmFkZCA9IFNldENhY2hlLnByb3RvdHlwZS5wdXNoID0gc2V0Q2FjaGVBZGQ7XG5TZXRDYWNoZS5wcm90b3R5cGUuaGFzID0gc2V0Q2FjaGVIYXM7XG5cbm1vZHVsZS5leHBvcnRzID0gU2V0Q2FjaGU7XG4iLCIvKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgXy5zb21lYCBmb3IgYXJyYXlzIHdpdGhvdXQgc3VwcG9ydCBmb3IgaXRlcmF0ZWVcbiAqIHNob3J0aGFuZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IFthcnJheV0gVGhlIGFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHByZWRpY2F0ZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFueSBlbGVtZW50IHBhc3NlcyB0aGUgcHJlZGljYXRlIGNoZWNrLFxuICogIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gYXJyYXlTb21lKGFycmF5LCBwcmVkaWNhdGUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBhcnJheSA9PSBudWxsID8gMCA6IGFycmF5Lmxlbmd0aDtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIGlmIChwcmVkaWNhdGUoYXJyYXlbaW5kZXhdLCBpbmRleCwgYXJyYXkpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFycmF5U29tZTtcbiIsIi8qKlxuICogQ2hlY2tzIGlmIGEgYGNhY2hlYCB2YWx1ZSBmb3IgYGtleWAgZXhpc3RzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gY2FjaGUgVGhlIGNhY2hlIHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBlbnRyeSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBhbiBlbnRyeSBmb3IgYGtleWAgZXhpc3RzLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGNhY2hlSGFzKGNhY2hlLCBrZXkpIHtcbiAgcmV0dXJuIGNhY2hlLmhhcyhrZXkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNhY2hlSGFzO1xuIiwidmFyIFNldENhY2hlID0gcmVxdWlyZSgnLi9fU2V0Q2FjaGUnKSxcbiAgICBhcnJheVNvbWUgPSByZXF1aXJlKCcuL19hcnJheVNvbWUnKSxcbiAgICBjYWNoZUhhcyA9IHJlcXVpcmUoJy4vX2NhY2hlSGFzJyk7XG5cbi8qKiBVc2VkIHRvIGNvbXBvc2UgYml0bWFza3MgZm9yIHZhbHVlIGNvbXBhcmlzb25zLiAqL1xudmFyIENPTVBBUkVfUEFSVElBTF9GTEFHID0gMSxcbiAgICBDT01QQVJFX1VOT1JERVJFRF9GTEFHID0gMjtcblxuLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYGJhc2VJc0VxdWFsRGVlcGAgZm9yIGFycmF5cyB3aXRoIHN1cHBvcnQgZm9yXG4gKiBwYXJ0aWFsIGRlZXAgY29tcGFyaXNvbnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBjb21wYXJlLlxuICogQHBhcmFtIHtBcnJheX0gb3RoZXIgVGhlIG90aGVyIGFycmF5IHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0ge251bWJlcn0gYml0bWFzayBUaGUgYml0bWFzayBmbGFncy4gU2VlIGBiYXNlSXNFcXVhbGAgZm9yIG1vcmUgZGV0YWlscy5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGN1c3RvbWl6ZXIgVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBjb21wYXJpc29ucy5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGVxdWFsRnVuYyBUaGUgZnVuY3Rpb24gdG8gZGV0ZXJtaW5lIGVxdWl2YWxlbnRzIG9mIHZhbHVlcy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBzdGFjayBUcmFja3MgdHJhdmVyc2VkIGBhcnJheWAgYW5kIGBvdGhlcmAgb2JqZWN0cy5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYXJyYXlzIGFyZSBlcXVpdmFsZW50LCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGVxdWFsQXJyYXlzKGFycmF5LCBvdGhlciwgYml0bWFzaywgY3VzdG9taXplciwgZXF1YWxGdW5jLCBzdGFjaykge1xuICB2YXIgaXNQYXJ0aWFsID0gYml0bWFzayAmIENPTVBBUkVfUEFSVElBTF9GTEFHLFxuICAgICAgYXJyTGVuZ3RoID0gYXJyYXkubGVuZ3RoLFxuICAgICAgb3RoTGVuZ3RoID0gb3RoZXIubGVuZ3RoO1xuXG4gIGlmIChhcnJMZW5ndGggIT0gb3RoTGVuZ3RoICYmICEoaXNQYXJ0aWFsICYmIG90aExlbmd0aCA+IGFyckxlbmd0aCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy8gQ2hlY2sgdGhhdCBjeWNsaWMgdmFsdWVzIGFyZSBlcXVhbC5cbiAgdmFyIGFyclN0YWNrZWQgPSBzdGFjay5nZXQoYXJyYXkpO1xuICB2YXIgb3RoU3RhY2tlZCA9IHN0YWNrLmdldChvdGhlcik7XG4gIGlmIChhcnJTdGFja2VkICYmIG90aFN0YWNrZWQpIHtcbiAgICByZXR1cm4gYXJyU3RhY2tlZCA9PSBvdGhlciAmJiBvdGhTdGFja2VkID09IGFycmF5O1xuICB9XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgcmVzdWx0ID0gdHJ1ZSxcbiAgICAgIHNlZW4gPSAoYml0bWFzayAmIENPTVBBUkVfVU5PUkRFUkVEX0ZMQUcpID8gbmV3IFNldENhY2hlIDogdW5kZWZpbmVkO1xuXG4gIHN0YWNrLnNldChhcnJheSwgb3RoZXIpO1xuICBzdGFjay5zZXQob3RoZXIsIGFycmF5KTtcblxuICAvLyBJZ25vcmUgbm9uLWluZGV4IHByb3BlcnRpZXMuXG4gIHdoaWxlICgrK2luZGV4IDwgYXJyTGVuZ3RoKSB7XG4gICAgdmFyIGFyclZhbHVlID0gYXJyYXlbaW5kZXhdLFxuICAgICAgICBvdGhWYWx1ZSA9IG90aGVyW2luZGV4XTtcblxuICAgIGlmIChjdXN0b21pemVyKSB7XG4gICAgICB2YXIgY29tcGFyZWQgPSBpc1BhcnRpYWxcbiAgICAgICAgPyBjdXN0b21pemVyKG90aFZhbHVlLCBhcnJWYWx1ZSwgaW5kZXgsIG90aGVyLCBhcnJheSwgc3RhY2spXG4gICAgICAgIDogY3VzdG9taXplcihhcnJWYWx1ZSwgb3RoVmFsdWUsIGluZGV4LCBhcnJheSwgb3RoZXIsIHN0YWNrKTtcbiAgICB9XG4gICAgaWYgKGNvbXBhcmVkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmIChjb21wYXJlZCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHJlc3VsdCA9IGZhbHNlO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIC8vIFJlY3Vyc2l2ZWx5IGNvbXBhcmUgYXJyYXlzIChzdXNjZXB0aWJsZSB0byBjYWxsIHN0YWNrIGxpbWl0cykuXG4gICAgaWYgKHNlZW4pIHtcbiAgICAgIGlmICghYXJyYXlTb21lKG90aGVyLCBmdW5jdGlvbihvdGhWYWx1ZSwgb3RoSW5kZXgpIHtcbiAgICAgICAgICAgIGlmICghY2FjaGVIYXMoc2Vlbiwgb3RoSW5kZXgpICYmXG4gICAgICAgICAgICAgICAgKGFyclZhbHVlID09PSBvdGhWYWx1ZSB8fCBlcXVhbEZ1bmMoYXJyVmFsdWUsIG90aFZhbHVlLCBiaXRtYXNrLCBjdXN0b21pemVyLCBzdGFjaykpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBzZWVuLnB1c2gob3RoSW5kZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pKSB7XG4gICAgICAgIHJlc3VsdCA9IGZhbHNlO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCEoXG4gICAgICAgICAgYXJyVmFsdWUgPT09IG90aFZhbHVlIHx8XG4gICAgICAgICAgICBlcXVhbEZ1bmMoYXJyVmFsdWUsIG90aFZhbHVlLCBiaXRtYXNrLCBjdXN0b21pemVyLCBzdGFjaylcbiAgICAgICAgKSkge1xuICAgICAgcmVzdWx0ID0gZmFsc2U7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgc3RhY2tbJ2RlbGV0ZSddKGFycmF5KTtcbiAgc3RhY2tbJ2RlbGV0ZSddKG90aGVyKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBlcXVhbEFycmF5cztcbiIsInZhciByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBVaW50OEFycmF5ID0gcm9vdC5VaW50OEFycmF5O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFVpbnQ4QXJyYXk7XG4iLCIvKipcbiAqIENvbnZlcnRzIGBtYXBgIHRvIGl0cyBrZXktdmFsdWUgcGFpcnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBtYXAgVGhlIG1hcCB0byBjb252ZXJ0LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBrZXktdmFsdWUgcGFpcnMuXG4gKi9cbmZ1bmN0aW9uIG1hcFRvQXJyYXkobWFwKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgcmVzdWx0ID0gQXJyYXkobWFwLnNpemUpO1xuXG4gIG1hcC5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICByZXN1bHRbKytpbmRleF0gPSBba2V5LCB2YWx1ZV07XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1hcFRvQXJyYXk7XG4iLCIvKipcbiAqIENvbnZlcnRzIGBzZXRgIHRvIGFuIGFycmF5IG9mIGl0cyB2YWx1ZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBzZXQgVGhlIHNldCB0byBjb252ZXJ0LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSB2YWx1ZXMuXG4gKi9cbmZ1bmN0aW9uIHNldFRvQXJyYXkoc2V0KSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgcmVzdWx0ID0gQXJyYXkoc2V0LnNpemUpO1xuXG4gIHNldC5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmVzdWx0WysraW5kZXhdID0gdmFsdWU7XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNldFRvQXJyYXk7XG4iLCJ2YXIgU3ltYm9sID0gcmVxdWlyZSgnLi9fU3ltYm9sJyksXG4gICAgVWludDhBcnJheSA9IHJlcXVpcmUoJy4vX1VpbnQ4QXJyYXknKSxcbiAgICBlcSA9IHJlcXVpcmUoJy4vZXEnKSxcbiAgICBlcXVhbEFycmF5cyA9IHJlcXVpcmUoJy4vX2VxdWFsQXJyYXlzJyksXG4gICAgbWFwVG9BcnJheSA9IHJlcXVpcmUoJy4vX21hcFRvQXJyYXknKSxcbiAgICBzZXRUb0FycmF5ID0gcmVxdWlyZSgnLi9fc2V0VG9BcnJheScpO1xuXG4vKiogVXNlZCB0byBjb21wb3NlIGJpdG1hc2tzIGZvciB2YWx1ZSBjb21wYXJpc29ucy4gKi9cbnZhciBDT01QQVJFX1BBUlRJQUxfRkxBRyA9IDEsXG4gICAgQ09NUEFSRV9VTk9SREVSRURfRkxBRyA9IDI7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBib29sVGFnID0gJ1tvYmplY3QgQm9vbGVhbl0nLFxuICAgIGRhdGVUYWcgPSAnW29iamVjdCBEYXRlXScsXG4gICAgZXJyb3JUYWcgPSAnW29iamVjdCBFcnJvcl0nLFxuICAgIG1hcFRhZyA9ICdbb2JqZWN0IE1hcF0nLFxuICAgIG51bWJlclRhZyA9ICdbb2JqZWN0IE51bWJlcl0nLFxuICAgIHJlZ2V4cFRhZyA9ICdbb2JqZWN0IFJlZ0V4cF0nLFxuICAgIHNldFRhZyA9ICdbb2JqZWN0IFNldF0nLFxuICAgIHN0cmluZ1RhZyA9ICdbb2JqZWN0IFN0cmluZ10nLFxuICAgIHN5bWJvbFRhZyA9ICdbb2JqZWN0IFN5bWJvbF0nO1xuXG52YXIgYXJyYXlCdWZmZXJUYWcgPSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nLFxuICAgIGRhdGFWaWV3VGFnID0gJ1tvYmplY3QgRGF0YVZpZXddJztcblxuLyoqIFVzZWQgdG8gY29udmVydCBzeW1ib2xzIHRvIHByaW1pdGl2ZXMgYW5kIHN0cmluZ3MuICovXG52YXIgc3ltYm9sUHJvdG8gPSBTeW1ib2wgPyBTeW1ib2wucHJvdG90eXBlIDogdW5kZWZpbmVkLFxuICAgIHN5bWJvbFZhbHVlT2YgPSBzeW1ib2xQcm90byA/IHN5bWJvbFByb3RvLnZhbHVlT2YgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlSXNFcXVhbERlZXBgIGZvciBjb21wYXJpbmcgb2JqZWN0cyBvZlxuICogdGhlIHNhbWUgYHRvU3RyaW5nVGFnYC5cbiAqXG4gKiAqKk5vdGU6KiogVGhpcyBmdW5jdGlvbiBvbmx5IHN1cHBvcnRzIGNvbXBhcmluZyB2YWx1ZXMgd2l0aCB0YWdzIG9mXG4gKiBgQm9vbGVhbmAsIGBEYXRlYCwgYEVycm9yYCwgYE51bWJlcmAsIGBSZWdFeHBgLCBvciBgU3RyaW5nYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0ge09iamVjdH0gb3RoZXIgVGhlIG90aGVyIG9iamVjdCB0byBjb21wYXJlLlxuICogQHBhcmFtIHtzdHJpbmd9IHRhZyBUaGUgYHRvU3RyaW5nVGFnYCBvZiB0aGUgb2JqZWN0cyB0byBjb21wYXJlLlxuICogQHBhcmFtIHtudW1iZXJ9IGJpdG1hc2sgVGhlIGJpdG1hc2sgZmxhZ3MuIFNlZSBgYmFzZUlzRXF1YWxgIGZvciBtb3JlIGRldGFpbHMuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjdXN0b21pemVyIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY29tcGFyaXNvbnMuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBlcXVhbEZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGRldGVybWluZSBlcXVpdmFsZW50cyBvZiB2YWx1ZXMuXG4gKiBAcGFyYW0ge09iamVjdH0gc3RhY2sgVHJhY2tzIHRyYXZlcnNlZCBgb2JqZWN0YCBhbmQgYG90aGVyYCBvYmplY3RzLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBvYmplY3RzIGFyZSBlcXVpdmFsZW50LCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGVxdWFsQnlUYWcob2JqZWN0LCBvdGhlciwgdGFnLCBiaXRtYXNrLCBjdXN0b21pemVyLCBlcXVhbEZ1bmMsIHN0YWNrKSB7XG4gIHN3aXRjaCAodGFnKSB7XG4gICAgY2FzZSBkYXRhVmlld1RhZzpcbiAgICAgIGlmICgob2JqZWN0LmJ5dGVMZW5ndGggIT0gb3RoZXIuYnl0ZUxlbmd0aCkgfHxcbiAgICAgICAgICAob2JqZWN0LmJ5dGVPZmZzZXQgIT0gb3RoZXIuYnl0ZU9mZnNldCkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgb2JqZWN0ID0gb2JqZWN0LmJ1ZmZlcjtcbiAgICAgIG90aGVyID0gb3RoZXIuYnVmZmVyO1xuXG4gICAgY2FzZSBhcnJheUJ1ZmZlclRhZzpcbiAgICAgIGlmICgob2JqZWN0LmJ5dGVMZW5ndGggIT0gb3RoZXIuYnl0ZUxlbmd0aCkgfHxcbiAgICAgICAgICAhZXF1YWxGdW5jKG5ldyBVaW50OEFycmF5KG9iamVjdCksIG5ldyBVaW50OEFycmF5KG90aGVyKSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG5cbiAgICBjYXNlIGJvb2xUYWc6XG4gICAgY2FzZSBkYXRlVGFnOlxuICAgIGNhc2UgbnVtYmVyVGFnOlxuICAgICAgLy8gQ29lcmNlIGJvb2xlYW5zIHRvIGAxYCBvciBgMGAgYW5kIGRhdGVzIHRvIG1pbGxpc2Vjb25kcy5cbiAgICAgIC8vIEludmFsaWQgZGF0ZXMgYXJlIGNvZXJjZWQgdG8gYE5hTmAuXG4gICAgICByZXR1cm4gZXEoK29iamVjdCwgK290aGVyKTtcblxuICAgIGNhc2UgZXJyb3JUYWc6XG4gICAgICByZXR1cm4gb2JqZWN0Lm5hbWUgPT0gb3RoZXIubmFtZSAmJiBvYmplY3QubWVzc2FnZSA9PSBvdGhlci5tZXNzYWdlO1xuXG4gICAgY2FzZSByZWdleHBUYWc6XG4gICAgY2FzZSBzdHJpbmdUYWc6XG4gICAgICAvLyBDb2VyY2UgcmVnZXhlcyB0byBzdHJpbmdzIGFuZCB0cmVhdCBzdHJpbmdzLCBwcmltaXRpdmVzIGFuZCBvYmplY3RzLFxuICAgICAgLy8gYXMgZXF1YWwuIFNlZSBodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtcmVnZXhwLnByb3RvdHlwZS50b3N0cmluZ1xuICAgICAgLy8gZm9yIG1vcmUgZGV0YWlscy5cbiAgICAgIHJldHVybiBvYmplY3QgPT0gKG90aGVyICsgJycpO1xuXG4gICAgY2FzZSBtYXBUYWc6XG4gICAgICB2YXIgY29udmVydCA9IG1hcFRvQXJyYXk7XG5cbiAgICBjYXNlIHNldFRhZzpcbiAgICAgIHZhciBpc1BhcnRpYWwgPSBiaXRtYXNrICYgQ09NUEFSRV9QQVJUSUFMX0ZMQUc7XG4gICAgICBjb252ZXJ0IHx8IChjb252ZXJ0ID0gc2V0VG9BcnJheSk7XG5cbiAgICAgIGlmIChvYmplY3Quc2l6ZSAhPSBvdGhlci5zaXplICYmICFpc1BhcnRpYWwpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgLy8gQXNzdW1lIGN5Y2xpYyB2YWx1ZXMgYXJlIGVxdWFsLlxuICAgICAgdmFyIHN0YWNrZWQgPSBzdGFjay5nZXQob2JqZWN0KTtcbiAgICAgIGlmIChzdGFja2VkKSB7XG4gICAgICAgIHJldHVybiBzdGFja2VkID09IG90aGVyO1xuICAgICAgfVxuICAgICAgYml0bWFzayB8PSBDT01QQVJFX1VOT1JERVJFRF9GTEFHO1xuXG4gICAgICAvLyBSZWN1cnNpdmVseSBjb21wYXJlIG9iamVjdHMgKHN1c2NlcHRpYmxlIHRvIGNhbGwgc3RhY2sgbGltaXRzKS5cbiAgICAgIHN0YWNrLnNldChvYmplY3QsIG90aGVyKTtcbiAgICAgIHZhciByZXN1bHQgPSBlcXVhbEFycmF5cyhjb252ZXJ0KG9iamVjdCksIGNvbnZlcnQob3RoZXIpLCBiaXRtYXNrLCBjdXN0b21pemVyLCBlcXVhbEZ1bmMsIHN0YWNrKTtcbiAgICAgIHN0YWNrWydkZWxldGUnXShvYmplY3QpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcblxuICAgIGNhc2Ugc3ltYm9sVGFnOlxuICAgICAgaWYgKHN5bWJvbFZhbHVlT2YpIHtcbiAgICAgICAgcmV0dXJuIHN5bWJvbFZhbHVlT2YuY2FsbChvYmplY3QpID09IHN5bWJvbFZhbHVlT2YuY2FsbChvdGhlcik7XG4gICAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGVxdWFsQnlUYWc7XG4iLCIvKipcbiAqIEFwcGVuZHMgdGhlIGVsZW1lbnRzIG9mIGB2YWx1ZXNgIHRvIGBhcnJheWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge0FycmF5fSB2YWx1ZXMgVGhlIHZhbHVlcyB0byBhcHBlbmQuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYGFycmF5YC5cbiAqL1xuZnVuY3Rpb24gYXJyYXlQdXNoKGFycmF5LCB2YWx1ZXMpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSB2YWx1ZXMubGVuZ3RoLFxuICAgICAgb2Zmc2V0ID0gYXJyYXkubGVuZ3RoO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgYXJyYXlbb2Zmc2V0ICsgaW5kZXhdID0gdmFsdWVzW2luZGV4XTtcbiAgfVxuICByZXR1cm4gYXJyYXk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXJyYXlQdXNoO1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGFuIGBBcnJheWAgb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIGFycmF5LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcnJheShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheShkb2N1bWVudC5ib2R5LmNoaWxkcmVuKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0FycmF5KCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0FycmF5KF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG5cbm1vZHVsZS5leHBvcnRzID0gaXNBcnJheTtcbiIsInZhciBhcnJheVB1c2ggPSByZXF1aXJlKCcuL19hcnJheVB1c2gnKSxcbiAgICBpc0FycmF5ID0gcmVxdWlyZSgnLi9pc0FycmF5Jyk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYGdldEFsbEtleXNgIGFuZCBgZ2V0QWxsS2V5c0luYCB3aGljaCB1c2VzXG4gKiBga2V5c0Z1bmNgIGFuZCBgc3ltYm9sc0Z1bmNgIHRvIGdldCB0aGUgZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBhbmRcbiAqIHN5bWJvbHMgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGtleXNGdW5jIFRoZSBmdW5jdGlvbiB0byBnZXQgdGhlIGtleXMgb2YgYG9iamVjdGAuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBzeW1ib2xzRnVuYyBUaGUgZnVuY3Rpb24gdG8gZ2V0IHRoZSBzeW1ib2xzIG9mIGBvYmplY3RgLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcyBhbmQgc3ltYm9scy5cbiAqL1xuZnVuY3Rpb24gYmFzZUdldEFsbEtleXMob2JqZWN0LCBrZXlzRnVuYywgc3ltYm9sc0Z1bmMpIHtcbiAgdmFyIHJlc3VsdCA9IGtleXNGdW5jKG9iamVjdCk7XG4gIHJldHVybiBpc0FycmF5KG9iamVjdCkgPyByZXN1bHQgOiBhcnJheVB1c2gocmVzdWx0LCBzeW1ib2xzRnVuYyhvYmplY3QpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlR2V0QWxsS2V5cztcbiIsIi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBfLmZpbHRlcmAgZm9yIGFycmF5cyB3aXRob3V0IHN1cHBvcnQgZm9yXG4gKiBpdGVyYXRlZSBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBbYXJyYXldIFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBwcmVkaWNhdGUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgbmV3IGZpbHRlcmVkIGFycmF5LlxuICovXG5mdW5jdGlvbiBhcnJheUZpbHRlcihhcnJheSwgcHJlZGljYXRlKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gYXJyYXkgPT0gbnVsbCA/IDAgOiBhcnJheS5sZW5ndGgsXG4gICAgICByZXNJbmRleCA9IDAsXG4gICAgICByZXN1bHQgPSBbXTtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciB2YWx1ZSA9IGFycmF5W2luZGV4XTtcbiAgICBpZiAocHJlZGljYXRlKHZhbHVlLCBpbmRleCwgYXJyYXkpKSB7XG4gICAgICByZXN1bHRbcmVzSW5kZXgrK10gPSB2YWx1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhcnJheUZpbHRlcjtcbiIsIi8qKlxuICogVGhpcyBtZXRob2QgcmV0dXJucyBhIG5ldyBlbXB0eSBhcnJheS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMTMuMFxuICogQGNhdGVnb3J5IFV0aWxcbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgbmV3IGVtcHR5IGFycmF5LlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgYXJyYXlzID0gXy50aW1lcygyLCBfLnN0dWJBcnJheSk7XG4gKlxuICogY29uc29sZS5sb2coYXJyYXlzKTtcbiAqIC8vID0+IFtbXSwgW11dXG4gKlxuICogY29uc29sZS5sb2coYXJyYXlzWzBdID09PSBhcnJheXNbMV0pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gc3R1YkFycmF5KCkge1xuICByZXR1cm4gW107XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3R1YkFycmF5O1xuIiwidmFyIGFycmF5RmlsdGVyID0gcmVxdWlyZSgnLi9fYXJyYXlGaWx0ZXInKSxcbiAgICBzdHViQXJyYXkgPSByZXF1aXJlKCcuL3N0dWJBcnJheScpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBwcm9wZXJ0eUlzRW51bWVyYWJsZSA9IG9iamVjdFByb3RvLnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlR2V0U3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgb3duIGVudW1lcmFibGUgc3ltYm9scyBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBzeW1ib2xzLlxuICovXG52YXIgZ2V0U3ltYm9scyA9ICFuYXRpdmVHZXRTeW1ib2xzID8gc3R1YkFycmF5IDogZnVuY3Rpb24ob2JqZWN0KSB7XG4gIGlmIChvYmplY3QgPT0gbnVsbCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICBvYmplY3QgPSBPYmplY3Qob2JqZWN0KTtcbiAgcmV0dXJuIGFycmF5RmlsdGVyKG5hdGl2ZUdldFN5bWJvbHMob2JqZWN0KSwgZnVuY3Rpb24oc3ltYm9sKSB7XG4gICAgcmV0dXJuIHByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwob2JqZWN0LCBzeW1ib2wpO1xuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0U3ltYm9scztcbiIsIi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8udGltZXNgIHdpdGhvdXQgc3VwcG9ydCBmb3IgaXRlcmF0ZWUgc2hvcnRoYW5kc1xuICogb3IgbWF4IGFycmF5IGxlbmd0aCBjaGVja3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSBuIFRoZSBudW1iZXIgb2YgdGltZXMgdG8gaW52b2tlIGBpdGVyYXRlZWAuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiByZXN1bHRzLlxuICovXG5mdW5jdGlvbiBiYXNlVGltZXMobiwgaXRlcmF0ZWUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICByZXN1bHQgPSBBcnJheShuKTtcblxuICB3aGlsZSAoKytpbmRleCA8IG4pIHtcbiAgICByZXN1bHRbaW5kZXhdID0gaXRlcmF0ZWUoaW5kZXgpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZVRpbWVzO1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZS4gQSB2YWx1ZSBpcyBvYmplY3QtbGlrZSBpZiBpdCdzIG5vdCBgbnVsbGBcbiAqIGFuZCBoYXMgYSBgdHlwZW9mYCByZXN1bHQgb2YgXCJvYmplY3RcIi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZSh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0TGlrZSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNPYmplY3RMaWtlO1xuIiwidmFyIGJhc2VHZXRUYWcgPSByZXF1aXJlKCcuL19iYXNlR2V0VGFnJyksXG4gICAgaXNPYmplY3RMaWtlID0gcmVxdWlyZSgnLi9pc09iamVjdExpa2UnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGFyZ3NUYWcgPSAnW29iamVjdCBBcmd1bWVudHNdJztcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pc0FyZ3VtZW50c2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LFxuICovXG5mdW5jdGlvbiBiYXNlSXNBcmd1bWVudHModmFsdWUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgYmFzZUdldFRhZyh2YWx1ZSkgPT0gYXJnc1RhZztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlSXNBcmd1bWVudHM7XG4iLCJ2YXIgYmFzZUlzQXJndW1lbnRzID0gcmVxdWlyZSgnLi9fYmFzZUlzQXJndW1lbnRzJyksXG4gICAgaXNPYmplY3RMaWtlID0gcmVxdWlyZSgnLi9pc09iamVjdExpa2UnKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgcHJvcGVydHlJc0VudW1lcmFibGUgPSBvYmplY3RQcm90by5wcm9wZXJ0eUlzRW51bWVyYWJsZTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBsaWtlbHkgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIGBhcmd1bWVudHNgIG9iamVjdCxcbiAqICBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcmd1bWVudHMoZnVuY3Rpb24oKSB7IHJldHVybiBhcmd1bWVudHM7IH0oKSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FyZ3VtZW50cyhbMSwgMiwgM10pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzQXJndW1lbnRzID0gYmFzZUlzQXJndW1lbnRzKGZ1bmN0aW9uKCkgeyByZXR1cm4gYXJndW1lbnRzOyB9KCkpID8gYmFzZUlzQXJndW1lbnRzIDogZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgJ2NhbGxlZScpICYmXG4gICAgIXByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwodmFsdWUsICdjYWxsZWUnKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gaXNBcmd1bWVudHM7XG4iLCIvKipcbiAqIFRoaXMgbWV0aG9kIHJldHVybnMgYGZhbHNlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMTMuMFxuICogQGNhdGVnb3J5IFV0aWxcbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8udGltZXMoMiwgXy5zdHViRmFsc2UpO1xuICogLy8gPT4gW2ZhbHNlLCBmYWxzZV1cbiAqL1xuZnVuY3Rpb24gc3R1YkZhbHNlKCkge1xuICByZXR1cm4gZmFsc2U7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3R1YkZhbHNlO1xuIiwidmFyIHJvb3QgPSByZXF1aXJlKCcuL19yb290JyksXG4gICAgc3R1YkZhbHNlID0gcmVxdWlyZSgnLi9zdHViRmFsc2UnKTtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBleHBvcnRzYC4gKi9cbnZhciBmcmVlRXhwb3J0cyA9IHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnICYmIGV4cG9ydHMgJiYgIWV4cG9ydHMubm9kZVR5cGUgJiYgZXhwb3J0cztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBtb2R1bGVgLiAqL1xudmFyIGZyZWVNb2R1bGUgPSBmcmVlRXhwb3J0cyAmJiB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJiAhbW9kdWxlLm5vZGVUeXBlICYmIG1vZHVsZTtcblxuLyoqIERldGVjdCB0aGUgcG9wdWxhciBDb21tb25KUyBleHRlbnNpb24gYG1vZHVsZS5leHBvcnRzYC4gKi9cbnZhciBtb2R1bGVFeHBvcnRzID0gZnJlZU1vZHVsZSAmJiBmcmVlTW9kdWxlLmV4cG9ydHMgPT09IGZyZWVFeHBvcnRzO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBCdWZmZXIgPSBtb2R1bGVFeHBvcnRzID8gcm9vdC5CdWZmZXIgOiB1bmRlZmluZWQ7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVJc0J1ZmZlciA9IEJ1ZmZlciA/IEJ1ZmZlci5pc0J1ZmZlciA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIGJ1ZmZlci5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMy4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIGJ1ZmZlciwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQnVmZmVyKG5ldyBCdWZmZXIoMikpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNCdWZmZXIobmV3IFVpbnQ4QXJyYXkoMikpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzQnVmZmVyID0gbmF0aXZlSXNCdWZmZXIgfHwgc3R1YkZhbHNlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlzQnVmZmVyO1xuIiwiLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgTUFYX1NBRkVfSU5URUdFUiA9IDkwMDcxOTkyNTQ3NDA5OTE7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCB1bnNpZ25lZCBpbnRlZ2VyIHZhbHVlcy4gKi9cbnZhciByZUlzVWludCA9IC9eKD86MHxbMS05XVxcZCopJC87XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBhcnJheS1saWtlIGluZGV4LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbbGVuZ3RoPU1BWF9TQUZFX0lOVEVHRVJdIFRoZSB1cHBlciBib3VuZHMgb2YgYSB2YWxpZCBpbmRleC5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgaW5kZXgsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNJbmRleCh2YWx1ZSwgbGVuZ3RoKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICBsZW5ndGggPSBsZW5ndGggPT0gbnVsbCA/IE1BWF9TQUZFX0lOVEVHRVIgOiBsZW5ndGg7XG5cbiAgcmV0dXJuICEhbGVuZ3RoICYmXG4gICAgKHR5cGUgPT0gJ251bWJlcicgfHxcbiAgICAgICh0eXBlICE9ICdzeW1ib2wnICYmIHJlSXNVaW50LnRlc3QodmFsdWUpKSkgJiZcbiAgICAgICAgKHZhbHVlID4gLTEgJiYgdmFsdWUgJSAxID09IDAgJiYgdmFsdWUgPCBsZW5ndGgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzSW5kZXg7XG4iLCIvKiogVXNlZCBhcyByZWZlcmVuY2VzIGZvciB2YXJpb3VzIGBOdW1iZXJgIGNvbnN0YW50cy4gKi9cbnZhciBNQVhfU0FGRV9JTlRFR0VSID0gOTAwNzE5OTI1NDc0MDk5MTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGFycmF5LWxpa2UgbGVuZ3RoLlxuICpcbiAqICoqTm90ZToqKiBUaGlzIG1ldGhvZCBpcyBsb29zZWx5IGJhc2VkIG9uXG4gKiBbYFRvTGVuZ3RoYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtdG9sZW5ndGgpLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgbGVuZ3RoLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNMZW5ndGgoMyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0xlbmd0aChOdW1iZXIuTUlOX1ZBTFVFKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0xlbmd0aChJbmZpbml0eSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNMZW5ndGgoJzMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzTGVuZ3RoKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ251bWJlcicgJiZcbiAgICB2YWx1ZSA+IC0xICYmIHZhbHVlICUgMSA9PSAwICYmIHZhbHVlIDw9IE1BWF9TQUZFX0lOVEVHRVI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNMZW5ndGg7XG4iLCJ2YXIgYmFzZUdldFRhZyA9IHJlcXVpcmUoJy4vX2Jhc2VHZXRUYWcnKSxcbiAgICBpc0xlbmd0aCA9IHJlcXVpcmUoJy4vaXNMZW5ndGgnKSxcbiAgICBpc09iamVjdExpa2UgPSByZXF1aXJlKCcuL2lzT2JqZWN0TGlrZScpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXJnc1RhZyA9ICdbb2JqZWN0IEFyZ3VtZW50c10nLFxuICAgIGFycmF5VGFnID0gJ1tvYmplY3QgQXJyYXldJyxcbiAgICBib29sVGFnID0gJ1tvYmplY3QgQm9vbGVhbl0nLFxuICAgIGRhdGVUYWcgPSAnW29iamVjdCBEYXRlXScsXG4gICAgZXJyb3JUYWcgPSAnW29iamVjdCBFcnJvcl0nLFxuICAgIGZ1bmNUYWcgPSAnW29iamVjdCBGdW5jdGlvbl0nLFxuICAgIG1hcFRhZyA9ICdbb2JqZWN0IE1hcF0nLFxuICAgIG51bWJlclRhZyA9ICdbb2JqZWN0IE51bWJlcl0nLFxuICAgIG9iamVjdFRhZyA9ICdbb2JqZWN0IE9iamVjdF0nLFxuICAgIHJlZ2V4cFRhZyA9ICdbb2JqZWN0IFJlZ0V4cF0nLFxuICAgIHNldFRhZyA9ICdbb2JqZWN0IFNldF0nLFxuICAgIHN0cmluZ1RhZyA9ICdbb2JqZWN0IFN0cmluZ10nLFxuICAgIHdlYWtNYXBUYWcgPSAnW29iamVjdCBXZWFrTWFwXSc7XG5cbnZhciBhcnJheUJ1ZmZlclRhZyA9ICdbb2JqZWN0IEFycmF5QnVmZmVyXScsXG4gICAgZGF0YVZpZXdUYWcgPSAnW29iamVjdCBEYXRhVmlld10nLFxuICAgIGZsb2F0MzJUYWcgPSAnW29iamVjdCBGbG9hdDMyQXJyYXldJyxcbiAgICBmbG9hdDY0VGFnID0gJ1tvYmplY3QgRmxvYXQ2NEFycmF5XScsXG4gICAgaW50OFRhZyA9ICdbb2JqZWN0IEludDhBcnJheV0nLFxuICAgIGludDE2VGFnID0gJ1tvYmplY3QgSW50MTZBcnJheV0nLFxuICAgIGludDMyVGFnID0gJ1tvYmplY3QgSW50MzJBcnJheV0nLFxuICAgIHVpbnQ4VGFnID0gJ1tvYmplY3QgVWludDhBcnJheV0nLFxuICAgIHVpbnQ4Q2xhbXBlZFRhZyA9ICdbb2JqZWN0IFVpbnQ4Q2xhbXBlZEFycmF5XScsXG4gICAgdWludDE2VGFnID0gJ1tvYmplY3QgVWludDE2QXJyYXldJyxcbiAgICB1aW50MzJUYWcgPSAnW29iamVjdCBVaW50MzJBcnJheV0nO1xuXG4vKiogVXNlZCB0byBpZGVudGlmeSBgdG9TdHJpbmdUYWdgIHZhbHVlcyBvZiB0eXBlZCBhcnJheXMuICovXG52YXIgdHlwZWRBcnJheVRhZ3MgPSB7fTtcbnR5cGVkQXJyYXlUYWdzW2Zsb2F0MzJUYWddID0gdHlwZWRBcnJheVRhZ3NbZmxvYXQ2NFRhZ10gPVxudHlwZWRBcnJheVRhZ3NbaW50OFRhZ10gPSB0eXBlZEFycmF5VGFnc1tpbnQxNlRhZ10gPVxudHlwZWRBcnJheVRhZ3NbaW50MzJUYWddID0gdHlwZWRBcnJheVRhZ3NbdWludDhUYWddID1cbnR5cGVkQXJyYXlUYWdzW3VpbnQ4Q2xhbXBlZFRhZ10gPSB0eXBlZEFycmF5VGFnc1t1aW50MTZUYWddID1cbnR5cGVkQXJyYXlUYWdzW3VpbnQzMlRhZ10gPSB0cnVlO1xudHlwZWRBcnJheVRhZ3NbYXJnc1RhZ10gPSB0eXBlZEFycmF5VGFnc1thcnJheVRhZ10gPVxudHlwZWRBcnJheVRhZ3NbYXJyYXlCdWZmZXJUYWddID0gdHlwZWRBcnJheVRhZ3NbYm9vbFRhZ10gPVxudHlwZWRBcnJheVRhZ3NbZGF0YVZpZXdUYWddID0gdHlwZWRBcnJheVRhZ3NbZGF0ZVRhZ10gPVxudHlwZWRBcnJheVRhZ3NbZXJyb3JUYWddID0gdHlwZWRBcnJheVRhZ3NbZnVuY1RhZ10gPVxudHlwZWRBcnJheVRhZ3NbbWFwVGFnXSA9IHR5cGVkQXJyYXlUYWdzW251bWJlclRhZ10gPVxudHlwZWRBcnJheVRhZ3Nbb2JqZWN0VGFnXSA9IHR5cGVkQXJyYXlUYWdzW3JlZ2V4cFRhZ10gPVxudHlwZWRBcnJheVRhZ3Nbc2V0VGFnXSA9IHR5cGVkQXJyYXlUYWdzW3N0cmluZ1RhZ10gPVxudHlwZWRBcnJheVRhZ3Nbd2Vha01hcFRhZ10gPSBmYWxzZTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pc1R5cGVkQXJyYXlgIHdpdGhvdXQgTm9kZS5qcyBvcHRpbWl6YXRpb25zLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgdHlwZWQgYXJyYXksIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUlzVHlwZWRBcnJheSh2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJlxuICAgIGlzTGVuZ3RoKHZhbHVlLmxlbmd0aCkgJiYgISF0eXBlZEFycmF5VGFnc1tiYXNlR2V0VGFnKHZhbHVlKV07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUlzVHlwZWRBcnJheTtcbiIsIi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8udW5hcnlgIHdpdGhvdXQgc3VwcG9ydCBmb3Igc3RvcmluZyBtZXRhZGF0YS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gY2FwIGFyZ3VtZW50cyBmb3IuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBjYXBwZWQgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VVbmFyeShmdW5jKSB7XG4gIHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiBmdW5jKHZhbHVlKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlVW5hcnk7XG4iLCJ2YXIgZnJlZUdsb2JhbCA9IHJlcXVpcmUoJy4vX2ZyZWVHbG9iYWwnKTtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBleHBvcnRzYC4gKi9cbnZhciBmcmVlRXhwb3J0cyA9IHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnICYmIGV4cG9ydHMgJiYgIWV4cG9ydHMubm9kZVR5cGUgJiYgZXhwb3J0cztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBtb2R1bGVgLiAqL1xudmFyIGZyZWVNb2R1bGUgPSBmcmVlRXhwb3J0cyAmJiB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJiAhbW9kdWxlLm5vZGVUeXBlICYmIG1vZHVsZTtcblxuLyoqIERldGVjdCB0aGUgcG9wdWxhciBDb21tb25KUyBleHRlbnNpb24gYG1vZHVsZS5leHBvcnRzYC4gKi9cbnZhciBtb2R1bGVFeHBvcnRzID0gZnJlZU1vZHVsZSAmJiBmcmVlTW9kdWxlLmV4cG9ydHMgPT09IGZyZWVFeHBvcnRzO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYHByb2Nlc3NgIGZyb20gTm9kZS5qcy4gKi9cbnZhciBmcmVlUHJvY2VzcyA9IG1vZHVsZUV4cG9ydHMgJiYgZnJlZUdsb2JhbC5wcm9jZXNzO1xuXG4vKiogVXNlZCB0byBhY2Nlc3MgZmFzdGVyIE5vZGUuanMgaGVscGVycy4gKi9cbnZhciBub2RlVXRpbCA9IChmdW5jdGlvbigpIHtcbiAgdHJ5IHtcbiAgICAvLyBVc2UgYHV0aWwudHlwZXNgIGZvciBOb2RlLmpzIDEwKy5cbiAgICB2YXIgdHlwZXMgPSBmcmVlTW9kdWxlICYmIGZyZWVNb2R1bGUucmVxdWlyZSAmJiBmcmVlTW9kdWxlLnJlcXVpcmUoJ3V0aWwnKS50eXBlcztcblxuICAgIGlmICh0eXBlcykge1xuICAgICAgcmV0dXJuIHR5cGVzO1xuICAgIH1cblxuICAgIC8vIExlZ2FjeSBgcHJvY2Vzcy5iaW5kaW5nKCd1dGlsJylgIGZvciBOb2RlLmpzIDwgMTAuXG4gICAgcmV0dXJuIGZyZWVQcm9jZXNzICYmIGZyZWVQcm9jZXNzLmJpbmRpbmcgJiYgZnJlZVByb2Nlc3MuYmluZGluZygndXRpbCcpO1xuICB9IGNhdGNoIChlKSB7fVxufSgpKTtcblxubW9kdWxlLmV4cG9ydHMgPSBub2RlVXRpbDtcbiIsInZhciBiYXNlSXNUeXBlZEFycmF5ID0gcmVxdWlyZSgnLi9fYmFzZUlzVHlwZWRBcnJheScpLFxuICAgIGJhc2VVbmFyeSA9IHJlcXVpcmUoJy4vX2Jhc2VVbmFyeScpLFxuICAgIG5vZGVVdGlsID0gcmVxdWlyZSgnLi9fbm9kZVV0aWwnKTtcblxuLyogTm9kZS5qcyBoZWxwZXIgcmVmZXJlbmNlcy4gKi9cbnZhciBub2RlSXNUeXBlZEFycmF5ID0gbm9kZVV0aWwgJiYgbm9kZVV0aWwuaXNUeXBlZEFycmF5O1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSB0eXBlZCBhcnJheS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDMuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHR5cGVkIGFycmF5LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNUeXBlZEFycmF5KG5ldyBVaW50OEFycmF5KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzVHlwZWRBcnJheShbXSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNUeXBlZEFycmF5ID0gbm9kZUlzVHlwZWRBcnJheSA/IGJhc2VVbmFyeShub2RlSXNUeXBlZEFycmF5KSA6IGJhc2VJc1R5cGVkQXJyYXk7XG5cbm1vZHVsZS5leHBvcnRzID0gaXNUeXBlZEFycmF5O1xuIiwidmFyIGJhc2VUaW1lcyA9IHJlcXVpcmUoJy4vX2Jhc2VUaW1lcycpLFxuICAgIGlzQXJndW1lbnRzID0gcmVxdWlyZSgnLi9pc0FyZ3VtZW50cycpLFxuICAgIGlzQXJyYXkgPSByZXF1aXJlKCcuL2lzQXJyYXknKSxcbiAgICBpc0J1ZmZlciA9IHJlcXVpcmUoJy4vaXNCdWZmZXInKSxcbiAgICBpc0luZGV4ID0gcmVxdWlyZSgnLi9faXNJbmRleCcpLFxuICAgIGlzVHlwZWRBcnJheSA9IHJlcXVpcmUoJy4vaXNUeXBlZEFycmF5Jyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiB0aGUgYXJyYXktbGlrZSBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaW5oZXJpdGVkIFNwZWNpZnkgcmV0dXJuaW5nIGluaGVyaXRlZCBwcm9wZXJ0eSBuYW1lcy5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIGFycmF5TGlrZUtleXModmFsdWUsIGluaGVyaXRlZCkge1xuICB2YXIgaXNBcnIgPSBpc0FycmF5KHZhbHVlKSxcbiAgICAgIGlzQXJnID0gIWlzQXJyICYmIGlzQXJndW1lbnRzKHZhbHVlKSxcbiAgICAgIGlzQnVmZiA9ICFpc0FyciAmJiAhaXNBcmcgJiYgaXNCdWZmZXIodmFsdWUpLFxuICAgICAgaXNUeXBlID0gIWlzQXJyICYmICFpc0FyZyAmJiAhaXNCdWZmICYmIGlzVHlwZWRBcnJheSh2YWx1ZSksXG4gICAgICBza2lwSW5kZXhlcyA9IGlzQXJyIHx8IGlzQXJnIHx8IGlzQnVmZiB8fCBpc1R5cGUsXG4gICAgICByZXN1bHQgPSBza2lwSW5kZXhlcyA/IGJhc2VUaW1lcyh2YWx1ZS5sZW5ndGgsIFN0cmluZykgOiBbXSxcbiAgICAgIGxlbmd0aCA9IHJlc3VsdC5sZW5ndGg7XG5cbiAgZm9yICh2YXIga2V5IGluIHZhbHVlKSB7XG4gICAgaWYgKChpbmhlcml0ZWQgfHwgaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwga2V5KSkgJiZcbiAgICAgICAgIShza2lwSW5kZXhlcyAmJiAoXG4gICAgICAgICAgIC8vIFNhZmFyaSA5IGhhcyBlbnVtZXJhYmxlIGBhcmd1bWVudHMubGVuZ3RoYCBpbiBzdHJpY3QgbW9kZS5cbiAgICAgICAgICAga2V5ID09ICdsZW5ndGgnIHx8XG4gICAgICAgICAgIC8vIE5vZGUuanMgMC4xMCBoYXMgZW51bWVyYWJsZSBub24taW5kZXggcHJvcGVydGllcyBvbiBidWZmZXJzLlxuICAgICAgICAgICAoaXNCdWZmICYmIChrZXkgPT0gJ29mZnNldCcgfHwga2V5ID09ICdwYXJlbnQnKSkgfHxcbiAgICAgICAgICAgLy8gUGhhbnRvbUpTIDIgaGFzIGVudW1lcmFibGUgbm9uLWluZGV4IHByb3BlcnRpZXMgb24gdHlwZWQgYXJyYXlzLlxuICAgICAgICAgICAoaXNUeXBlICYmIChrZXkgPT0gJ2J1ZmZlcicgfHwga2V5ID09ICdieXRlTGVuZ3RoJyB8fCBrZXkgPT0gJ2J5dGVPZmZzZXQnKSkgfHxcbiAgICAgICAgICAgLy8gU2tpcCBpbmRleCBwcm9wZXJ0aWVzLlxuICAgICAgICAgICBpc0luZGV4KGtleSwgbGVuZ3RoKVxuICAgICAgICApKSkge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhcnJheUxpa2VLZXlzO1xuIiwiLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBsaWtlbHkgYSBwcm90b3R5cGUgb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgcHJvdG90eXBlLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzUHJvdG90eXBlKHZhbHVlKSB7XG4gIHZhciBDdG9yID0gdmFsdWUgJiYgdmFsdWUuY29uc3RydWN0b3IsXG4gICAgICBwcm90byA9ICh0eXBlb2YgQ3RvciA9PSAnZnVuY3Rpb24nICYmIEN0b3IucHJvdG90eXBlKSB8fCBvYmplY3RQcm90bztcblxuICByZXR1cm4gdmFsdWUgPT09IHByb3RvO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzUHJvdG90eXBlO1xuIiwiLyoqXG4gKiBDcmVhdGVzIGEgdW5hcnkgZnVuY3Rpb24gdGhhdCBpbnZva2VzIGBmdW5jYCB3aXRoIGl0cyBhcmd1bWVudCB0cmFuc2Zvcm1lZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gd3JhcC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHRyYW5zZm9ybSBUaGUgYXJndW1lbnQgdHJhbnNmb3JtLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIG92ZXJBcmcoZnVuYywgdHJhbnNmb3JtKSB7XG4gIHJldHVybiBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gZnVuYyh0cmFuc2Zvcm0oYXJnKSk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gb3ZlckFyZztcbiIsInZhciBvdmVyQXJnID0gcmVxdWlyZSgnLi9fb3ZlckFyZycpO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlS2V5cyA9IG92ZXJBcmcoT2JqZWN0LmtleXMsIE9iamVjdCk7XG5cbm1vZHVsZS5leHBvcnRzID0gbmF0aXZlS2V5cztcbiIsInZhciBpc1Byb3RvdHlwZSA9IHJlcXVpcmUoJy4vX2lzUHJvdG90eXBlJyksXG4gICAgbmF0aXZlS2V5cyA9IHJlcXVpcmUoJy4vX25hdGl2ZUtleXMnKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5rZXlzYCB3aGljaCBkb2Vzbid0IHRyZWF0IHNwYXJzZSBhcnJheXMgYXMgZGVuc2UuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VLZXlzKG9iamVjdCkge1xuICBpZiAoIWlzUHJvdG90eXBlKG9iamVjdCkpIHtcbiAgICByZXR1cm4gbmF0aXZlS2V5cyhvYmplY3QpO1xuICB9XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIE9iamVjdChvYmplY3QpKSB7XG4gICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpICYmIGtleSAhPSAnY29uc3RydWN0b3InKSB7XG4gICAgICByZXN1bHQucHVzaChrZXkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VLZXlzO1xuIiwidmFyIGlzRnVuY3Rpb24gPSByZXF1aXJlKCcuL2lzRnVuY3Rpb24nKSxcbiAgICBpc0xlbmd0aCA9IHJlcXVpcmUoJy4vaXNMZW5ndGgnKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhcnJheS1saWtlLiBBIHZhbHVlIGlzIGNvbnNpZGVyZWQgYXJyYXktbGlrZSBpZiBpdCdzXG4gKiBub3QgYSBmdW5jdGlvbiBhbmQgaGFzIGEgYHZhbHVlLmxlbmd0aGAgdGhhdCdzIGFuIGludGVnZXIgZ3JlYXRlciB0aGFuIG9yXG4gKiBlcXVhbCB0byBgMGAgYW5kIGxlc3MgdGhhbiBvciBlcXVhbCB0byBgTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVJgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFycmF5LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FycmF5TGlrZShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoZG9jdW1lbnQuYm9keS5jaGlsZHJlbik7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5TGlrZSgnYWJjJyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUxpa2UodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgaXNMZW5ndGgodmFsdWUubGVuZ3RoKSAmJiAhaXNGdW5jdGlvbih2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNBcnJheUxpa2U7XG4iLCJ2YXIgYXJyYXlMaWtlS2V5cyA9IHJlcXVpcmUoJy4vX2FycmF5TGlrZUtleXMnKSxcbiAgICBiYXNlS2V5cyA9IHJlcXVpcmUoJy4vX2Jhc2VLZXlzJyksXG4gICAgaXNBcnJheUxpa2UgPSByZXF1aXJlKCcuL2lzQXJyYXlMaWtlJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgb3duIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgb2YgYG9iamVjdGAuXG4gKlxuICogKipOb3RlOioqIE5vbi1vYmplY3QgdmFsdWVzIGFyZSBjb2VyY2VkIHRvIG9iamVjdHMuIFNlZSB0aGVcbiAqIFtFUyBzcGVjXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3Qua2V5cylcbiAqIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogQHN0YXRpY1xuICogQHNpbmNlIDAuMS4wXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmEgPSAxO1xuICogICB0aGlzLmIgPSAyO1xuICogfVxuICpcbiAqIEZvby5wcm90b3R5cGUuYyA9IDM7XG4gKlxuICogXy5rZXlzKG5ldyBGb28pO1xuICogLy8gPT4gWydhJywgJ2InXSAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKVxuICpcbiAqIF8ua2V5cygnaGknKTtcbiAqIC8vID0+IFsnMCcsICcxJ11cbiAqL1xuZnVuY3Rpb24ga2V5cyhvYmplY3QpIHtcbiAgcmV0dXJuIGlzQXJyYXlMaWtlKG9iamVjdCkgPyBhcnJheUxpa2VLZXlzKG9iamVjdCkgOiBiYXNlS2V5cyhvYmplY3QpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGtleXM7XG4iLCJ2YXIgYmFzZUdldEFsbEtleXMgPSByZXF1aXJlKCcuL19iYXNlR2V0QWxsS2V5cycpLFxuICAgIGdldFN5bWJvbHMgPSByZXF1aXJlKCcuL19nZXRTeW1ib2xzJyksXG4gICAga2V5cyA9IHJlcXVpcmUoJy4va2V5cycpO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2Ygb3duIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgYW5kIHN5bWJvbHMgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMgYW5kIHN5bWJvbHMuXG4gKi9cbmZ1bmN0aW9uIGdldEFsbEtleXMob2JqZWN0KSB7XG4gIHJldHVybiBiYXNlR2V0QWxsS2V5cyhvYmplY3QsIGtleXMsIGdldFN5bWJvbHMpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldEFsbEtleXM7XG4iLCJ2YXIgZ2V0QWxsS2V5cyA9IHJlcXVpcmUoJy4vX2dldEFsbEtleXMnKTtcblxuLyoqIFVzZWQgdG8gY29tcG9zZSBiaXRtYXNrcyBmb3IgdmFsdWUgY29tcGFyaXNvbnMuICovXG52YXIgQ09NUEFSRV9QQVJUSUFMX0ZMQUcgPSAxO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgYmFzZUlzRXF1YWxEZWVwYCBmb3Igb2JqZWN0cyB3aXRoIHN1cHBvcnQgZm9yXG4gKiBwYXJ0aWFsIGRlZXAgY29tcGFyaXNvbnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBjb21wYXJlLlxuICogQHBhcmFtIHtPYmplY3R9IG90aGVyIFRoZSBvdGhlciBvYmplY3QgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBiaXRtYXNrIFRoZSBiaXRtYXNrIGZsYWdzLiBTZWUgYGJhc2VJc0VxdWFsYCBmb3IgbW9yZSBkZXRhaWxzLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY3VzdG9taXplciBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIGNvbXBhcmlzb25zLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZXF1YWxGdW5jIFRoZSBmdW5jdGlvbiB0byBkZXRlcm1pbmUgZXF1aXZhbGVudHMgb2YgdmFsdWVzLlxuICogQHBhcmFtIHtPYmplY3R9IHN0YWNrIFRyYWNrcyB0cmF2ZXJzZWQgYG9iamVjdGAgYW5kIGBvdGhlcmAgb2JqZWN0cy5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgb2JqZWN0cyBhcmUgZXF1aXZhbGVudCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBlcXVhbE9iamVjdHMob2JqZWN0LCBvdGhlciwgYml0bWFzaywgY3VzdG9taXplciwgZXF1YWxGdW5jLCBzdGFjaykge1xuICB2YXIgaXNQYXJ0aWFsID0gYml0bWFzayAmIENPTVBBUkVfUEFSVElBTF9GTEFHLFxuICAgICAgb2JqUHJvcHMgPSBnZXRBbGxLZXlzKG9iamVjdCksXG4gICAgICBvYmpMZW5ndGggPSBvYmpQcm9wcy5sZW5ndGgsXG4gICAgICBvdGhQcm9wcyA9IGdldEFsbEtleXMob3RoZXIpLFxuICAgICAgb3RoTGVuZ3RoID0gb3RoUHJvcHMubGVuZ3RoO1xuXG4gIGlmIChvYmpMZW5ndGggIT0gb3RoTGVuZ3RoICYmICFpc1BhcnRpYWwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIGluZGV4ID0gb2JqTGVuZ3RoO1xuICB3aGlsZSAoaW5kZXgtLSkge1xuICAgIHZhciBrZXkgPSBvYmpQcm9wc1tpbmRleF07XG4gICAgaWYgKCEoaXNQYXJ0aWFsID8ga2V5IGluIG90aGVyIDogaGFzT3duUHJvcGVydHkuY2FsbChvdGhlciwga2V5KSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgLy8gQ2hlY2sgdGhhdCBjeWNsaWMgdmFsdWVzIGFyZSBlcXVhbC5cbiAgdmFyIG9ialN0YWNrZWQgPSBzdGFjay5nZXQob2JqZWN0KTtcbiAgdmFyIG90aFN0YWNrZWQgPSBzdGFjay5nZXQob3RoZXIpO1xuICBpZiAob2JqU3RhY2tlZCAmJiBvdGhTdGFja2VkKSB7XG4gICAgcmV0dXJuIG9ialN0YWNrZWQgPT0gb3RoZXIgJiYgb3RoU3RhY2tlZCA9PSBvYmplY3Q7XG4gIH1cbiAgdmFyIHJlc3VsdCA9IHRydWU7XG4gIHN0YWNrLnNldChvYmplY3QsIG90aGVyKTtcbiAgc3RhY2suc2V0KG90aGVyLCBvYmplY3QpO1xuXG4gIHZhciBza2lwQ3RvciA9IGlzUGFydGlhbDtcbiAgd2hpbGUgKCsraW5kZXggPCBvYmpMZW5ndGgpIHtcbiAgICBrZXkgPSBvYmpQcm9wc1tpbmRleF07XG4gICAgdmFyIG9ialZhbHVlID0gb2JqZWN0W2tleV0sXG4gICAgICAgIG90aFZhbHVlID0gb3RoZXJba2V5XTtcblxuICAgIGlmIChjdXN0b21pemVyKSB7XG4gICAgICB2YXIgY29tcGFyZWQgPSBpc1BhcnRpYWxcbiAgICAgICAgPyBjdXN0b21pemVyKG90aFZhbHVlLCBvYmpWYWx1ZSwga2V5LCBvdGhlciwgb2JqZWN0LCBzdGFjaylcbiAgICAgICAgOiBjdXN0b21pemVyKG9ialZhbHVlLCBvdGhWYWx1ZSwga2V5LCBvYmplY3QsIG90aGVyLCBzdGFjayk7XG4gICAgfVxuICAgIC8vIFJlY3Vyc2l2ZWx5IGNvbXBhcmUgb2JqZWN0cyAoc3VzY2VwdGlibGUgdG8gY2FsbCBzdGFjayBsaW1pdHMpLlxuICAgIGlmICghKGNvbXBhcmVkID09PSB1bmRlZmluZWRcbiAgICAgICAgICA/IChvYmpWYWx1ZSA9PT0gb3RoVmFsdWUgfHwgZXF1YWxGdW5jKG9ialZhbHVlLCBvdGhWYWx1ZSwgYml0bWFzaywgY3VzdG9taXplciwgc3RhY2spKVxuICAgICAgICAgIDogY29tcGFyZWRcbiAgICAgICAgKSkge1xuICAgICAgcmVzdWx0ID0gZmFsc2U7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgc2tpcEN0b3IgfHwgKHNraXBDdG9yID0ga2V5ID09ICdjb25zdHJ1Y3RvcicpO1xuICB9XG4gIGlmIChyZXN1bHQgJiYgIXNraXBDdG9yKSB7XG4gICAgdmFyIG9iakN0b3IgPSBvYmplY3QuY29uc3RydWN0b3IsXG4gICAgICAgIG90aEN0b3IgPSBvdGhlci5jb25zdHJ1Y3RvcjtcblxuICAgIC8vIE5vbiBgT2JqZWN0YCBvYmplY3QgaW5zdGFuY2VzIHdpdGggZGlmZmVyZW50IGNvbnN0cnVjdG9ycyBhcmUgbm90IGVxdWFsLlxuICAgIGlmIChvYmpDdG9yICE9IG90aEN0b3IgJiZcbiAgICAgICAgKCdjb25zdHJ1Y3RvcicgaW4gb2JqZWN0ICYmICdjb25zdHJ1Y3RvcicgaW4gb3RoZXIpICYmXG4gICAgICAgICEodHlwZW9mIG9iakN0b3IgPT0gJ2Z1bmN0aW9uJyAmJiBvYmpDdG9yIGluc3RhbmNlb2Ygb2JqQ3RvciAmJlxuICAgICAgICAgIHR5cGVvZiBvdGhDdG9yID09ICdmdW5jdGlvbicgJiYgb3RoQ3RvciBpbnN0YW5jZW9mIG90aEN0b3IpKSB7XG4gICAgICByZXN1bHQgPSBmYWxzZTtcbiAgICB9XG4gIH1cbiAgc3RhY2tbJ2RlbGV0ZSddKG9iamVjdCk7XG4gIHN0YWNrWydkZWxldGUnXShvdGhlcik7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXF1YWxPYmplY3RzO1xuIiwidmFyIGdldE5hdGl2ZSA9IHJlcXVpcmUoJy4vX2dldE5hdGl2ZScpLFxuICAgIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHRoYXQgYXJlIHZlcmlmaWVkIHRvIGJlIG5hdGl2ZS4gKi9cbnZhciBEYXRhVmlldyA9IGdldE5hdGl2ZShyb290LCAnRGF0YVZpZXcnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBEYXRhVmlldztcbiIsInZhciBnZXROYXRpdmUgPSByZXF1aXJlKCcuL19nZXROYXRpdmUnKSxcbiAgICByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB0aGF0IGFyZSB2ZXJpZmllZCB0byBiZSBuYXRpdmUuICovXG52YXIgUHJvbWlzZSA9IGdldE5hdGl2ZShyb290LCAnUHJvbWlzZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFByb21pc2U7XG4iLCJ2YXIgZ2V0TmF0aXZlID0gcmVxdWlyZSgnLi9fZ2V0TmF0aXZlJyksXG4gICAgcm9vdCA9IHJlcXVpcmUoJy4vX3Jvb3QnKTtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgdGhhdCBhcmUgdmVyaWZpZWQgdG8gYmUgbmF0aXZlLiAqL1xudmFyIFNldCA9IGdldE5hdGl2ZShyb290LCAnU2V0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2V0O1xuIiwidmFyIGdldE5hdGl2ZSA9IHJlcXVpcmUoJy4vX2dldE5hdGl2ZScpLFxuICAgIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHRoYXQgYXJlIHZlcmlmaWVkIHRvIGJlIG5hdGl2ZS4gKi9cbnZhciBXZWFrTWFwID0gZ2V0TmF0aXZlKHJvb3QsICdXZWFrTWFwJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gV2Vha01hcDtcbiIsInZhciBEYXRhVmlldyA9IHJlcXVpcmUoJy4vX0RhdGFWaWV3JyksXG4gICAgTWFwID0gcmVxdWlyZSgnLi9fTWFwJyksXG4gICAgUHJvbWlzZSA9IHJlcXVpcmUoJy4vX1Byb21pc2UnKSxcbiAgICBTZXQgPSByZXF1aXJlKCcuL19TZXQnKSxcbiAgICBXZWFrTWFwID0gcmVxdWlyZSgnLi9fV2Vha01hcCcpLFxuICAgIGJhc2VHZXRUYWcgPSByZXF1aXJlKCcuL19iYXNlR2V0VGFnJyksXG4gICAgdG9Tb3VyY2UgPSByZXF1aXJlKCcuL190b1NvdXJjZScpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgbWFwVGFnID0gJ1tvYmplY3QgTWFwXScsXG4gICAgb2JqZWN0VGFnID0gJ1tvYmplY3QgT2JqZWN0XScsXG4gICAgcHJvbWlzZVRhZyA9ICdbb2JqZWN0IFByb21pc2VdJyxcbiAgICBzZXRUYWcgPSAnW29iamVjdCBTZXRdJyxcbiAgICB3ZWFrTWFwVGFnID0gJ1tvYmplY3QgV2Vha01hcF0nO1xuXG52YXIgZGF0YVZpZXdUYWcgPSAnW29iamVjdCBEYXRhVmlld10nO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgbWFwcywgc2V0cywgYW5kIHdlYWttYXBzLiAqL1xudmFyIGRhdGFWaWV3Q3RvclN0cmluZyA9IHRvU291cmNlKERhdGFWaWV3KSxcbiAgICBtYXBDdG9yU3RyaW5nID0gdG9Tb3VyY2UoTWFwKSxcbiAgICBwcm9taXNlQ3RvclN0cmluZyA9IHRvU291cmNlKFByb21pc2UpLFxuICAgIHNldEN0b3JTdHJpbmcgPSB0b1NvdXJjZShTZXQpLFxuICAgIHdlYWtNYXBDdG9yU3RyaW5nID0gdG9Tb3VyY2UoV2Vha01hcCk7XG5cbi8qKlxuICogR2V0cyB0aGUgYHRvU3RyaW5nVGFnYCBvZiBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGB0b1N0cmluZ1RhZ2AuXG4gKi9cbnZhciBnZXRUYWcgPSBiYXNlR2V0VGFnO1xuXG4vLyBGYWxsYmFjayBmb3IgZGF0YSB2aWV3cywgbWFwcywgc2V0cywgYW5kIHdlYWsgbWFwcyBpbiBJRSAxMSBhbmQgcHJvbWlzZXMgaW4gTm9kZS5qcyA8IDYuXG5pZiAoKERhdGFWaWV3ICYmIGdldFRhZyhuZXcgRGF0YVZpZXcobmV3IEFycmF5QnVmZmVyKDEpKSkgIT0gZGF0YVZpZXdUYWcpIHx8XG4gICAgKE1hcCAmJiBnZXRUYWcobmV3IE1hcCkgIT0gbWFwVGFnKSB8fFxuICAgIChQcm9taXNlICYmIGdldFRhZyhQcm9taXNlLnJlc29sdmUoKSkgIT0gcHJvbWlzZVRhZykgfHxcbiAgICAoU2V0ICYmIGdldFRhZyhuZXcgU2V0KSAhPSBzZXRUYWcpIHx8XG4gICAgKFdlYWtNYXAgJiYgZ2V0VGFnKG5ldyBXZWFrTWFwKSAhPSB3ZWFrTWFwVGFnKSkge1xuICBnZXRUYWcgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHZhciByZXN1bHQgPSBiYXNlR2V0VGFnKHZhbHVlKSxcbiAgICAgICAgQ3RvciA9IHJlc3VsdCA9PSBvYmplY3RUYWcgPyB2YWx1ZS5jb25zdHJ1Y3RvciA6IHVuZGVmaW5lZCxcbiAgICAgICAgY3RvclN0cmluZyA9IEN0b3IgPyB0b1NvdXJjZShDdG9yKSA6ICcnO1xuXG4gICAgaWYgKGN0b3JTdHJpbmcpIHtcbiAgICAgIHN3aXRjaCAoY3RvclN0cmluZykge1xuICAgICAgICBjYXNlIGRhdGFWaWV3Q3RvclN0cmluZzogcmV0dXJuIGRhdGFWaWV3VGFnO1xuICAgICAgICBjYXNlIG1hcEN0b3JTdHJpbmc6IHJldHVybiBtYXBUYWc7XG4gICAgICAgIGNhc2UgcHJvbWlzZUN0b3JTdHJpbmc6IHJldHVybiBwcm9taXNlVGFnO1xuICAgICAgICBjYXNlIHNldEN0b3JTdHJpbmc6IHJldHVybiBzZXRUYWc7XG4gICAgICAgIGNhc2Ugd2Vha01hcEN0b3JTdHJpbmc6IHJldHVybiB3ZWFrTWFwVGFnO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFRhZztcbiIsInZhciBTdGFjayA9IHJlcXVpcmUoJy4vX1N0YWNrJyksXG4gICAgZXF1YWxBcnJheXMgPSByZXF1aXJlKCcuL19lcXVhbEFycmF5cycpLFxuICAgIGVxdWFsQnlUYWcgPSByZXF1aXJlKCcuL19lcXVhbEJ5VGFnJyksXG4gICAgZXF1YWxPYmplY3RzID0gcmVxdWlyZSgnLi9fZXF1YWxPYmplY3RzJyksXG4gICAgZ2V0VGFnID0gcmVxdWlyZSgnLi9fZ2V0VGFnJyksXG4gICAgaXNBcnJheSA9IHJlcXVpcmUoJy4vaXNBcnJheScpLFxuICAgIGlzQnVmZmVyID0gcmVxdWlyZSgnLi9pc0J1ZmZlcicpLFxuICAgIGlzVHlwZWRBcnJheSA9IHJlcXVpcmUoJy4vaXNUeXBlZEFycmF5Jyk7XG5cbi8qKiBVc2VkIHRvIGNvbXBvc2UgYml0bWFza3MgZm9yIHZhbHVlIGNvbXBhcmlzb25zLiAqL1xudmFyIENPTVBBUkVfUEFSVElBTF9GTEFHID0gMTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGFyZ3NUYWcgPSAnW29iamVjdCBBcmd1bWVudHNdJyxcbiAgICBhcnJheVRhZyA9ICdbb2JqZWN0IEFycmF5XScsXG4gICAgb2JqZWN0VGFnID0gJ1tvYmplY3QgT2JqZWN0XSc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlSXNFcXVhbGAgZm9yIGFycmF5cyBhbmQgb2JqZWN0cyB3aGljaCBwZXJmb3Jtc1xuICogZGVlcCBjb21wYXJpc29ucyBhbmQgdHJhY2tzIHRyYXZlcnNlZCBvYmplY3RzIGVuYWJsaW5nIG9iamVjdHMgd2l0aCBjaXJjdWxhclxuICogcmVmZXJlbmNlcyB0byBiZSBjb21wYXJlZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0ge09iamVjdH0gb3RoZXIgVGhlIG90aGVyIG9iamVjdCB0byBjb21wYXJlLlxuICogQHBhcmFtIHtudW1iZXJ9IGJpdG1hc2sgVGhlIGJpdG1hc2sgZmxhZ3MuIFNlZSBgYmFzZUlzRXF1YWxgIGZvciBtb3JlIGRldGFpbHMuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjdXN0b21pemVyIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY29tcGFyaXNvbnMuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBlcXVhbEZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGRldGVybWluZSBlcXVpdmFsZW50cyBvZiB2YWx1ZXMuXG4gKiBAcGFyYW0ge09iamVjdH0gW3N0YWNrXSBUcmFja3MgdHJhdmVyc2VkIGBvYmplY3RgIGFuZCBgb3RoZXJgIG9iamVjdHMuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIG9iamVjdHMgYXJlIGVxdWl2YWxlbnQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUlzRXF1YWxEZWVwKG9iamVjdCwgb3RoZXIsIGJpdG1hc2ssIGN1c3RvbWl6ZXIsIGVxdWFsRnVuYywgc3RhY2spIHtcbiAgdmFyIG9iaklzQXJyID0gaXNBcnJheShvYmplY3QpLFxuICAgICAgb3RoSXNBcnIgPSBpc0FycmF5KG90aGVyKSxcbiAgICAgIG9ialRhZyA9IG9iaklzQXJyID8gYXJyYXlUYWcgOiBnZXRUYWcob2JqZWN0KSxcbiAgICAgIG90aFRhZyA9IG90aElzQXJyID8gYXJyYXlUYWcgOiBnZXRUYWcob3RoZXIpO1xuXG4gIG9ialRhZyA9IG9ialRhZyA9PSBhcmdzVGFnID8gb2JqZWN0VGFnIDogb2JqVGFnO1xuICBvdGhUYWcgPSBvdGhUYWcgPT0gYXJnc1RhZyA/IG9iamVjdFRhZyA6IG90aFRhZztcblxuICB2YXIgb2JqSXNPYmogPSBvYmpUYWcgPT0gb2JqZWN0VGFnLFxuICAgICAgb3RoSXNPYmogPSBvdGhUYWcgPT0gb2JqZWN0VGFnLFxuICAgICAgaXNTYW1lVGFnID0gb2JqVGFnID09IG90aFRhZztcblxuICBpZiAoaXNTYW1lVGFnICYmIGlzQnVmZmVyKG9iamVjdCkpIHtcbiAgICBpZiAoIWlzQnVmZmVyKG90aGVyKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBvYmpJc0FyciA9IHRydWU7XG4gICAgb2JqSXNPYmogPSBmYWxzZTtcbiAgfVxuICBpZiAoaXNTYW1lVGFnICYmICFvYmpJc09iaikge1xuICAgIHN0YWNrIHx8IChzdGFjayA9IG5ldyBTdGFjayk7XG4gICAgcmV0dXJuIChvYmpJc0FyciB8fCBpc1R5cGVkQXJyYXkob2JqZWN0KSlcbiAgICAgID8gZXF1YWxBcnJheXMob2JqZWN0LCBvdGhlciwgYml0bWFzaywgY3VzdG9taXplciwgZXF1YWxGdW5jLCBzdGFjaylcbiAgICAgIDogZXF1YWxCeVRhZyhvYmplY3QsIG90aGVyLCBvYmpUYWcsIGJpdG1hc2ssIGN1c3RvbWl6ZXIsIGVxdWFsRnVuYywgc3RhY2spO1xuICB9XG4gIGlmICghKGJpdG1hc2sgJiBDT01QQVJFX1BBUlRJQUxfRkxBRykpIHtcbiAgICB2YXIgb2JqSXNXcmFwcGVkID0gb2JqSXNPYmogJiYgaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsICdfX3dyYXBwZWRfXycpLFxuICAgICAgICBvdGhJc1dyYXBwZWQgPSBvdGhJc09iaiAmJiBoYXNPd25Qcm9wZXJ0eS5jYWxsKG90aGVyLCAnX193cmFwcGVkX18nKTtcblxuICAgIGlmIChvYmpJc1dyYXBwZWQgfHwgb3RoSXNXcmFwcGVkKSB7XG4gICAgICB2YXIgb2JqVW53cmFwcGVkID0gb2JqSXNXcmFwcGVkID8gb2JqZWN0LnZhbHVlKCkgOiBvYmplY3QsXG4gICAgICAgICAgb3RoVW53cmFwcGVkID0gb3RoSXNXcmFwcGVkID8gb3RoZXIudmFsdWUoKSA6IG90aGVyO1xuXG4gICAgICBzdGFjayB8fCAoc3RhY2sgPSBuZXcgU3RhY2spO1xuICAgICAgcmV0dXJuIGVxdWFsRnVuYyhvYmpVbndyYXBwZWQsIG90aFVud3JhcHBlZCwgYml0bWFzaywgY3VzdG9taXplciwgc3RhY2spO1xuICAgIH1cbiAgfVxuICBpZiAoIWlzU2FtZVRhZykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBzdGFjayB8fCAoc3RhY2sgPSBuZXcgU3RhY2spO1xuICByZXR1cm4gZXF1YWxPYmplY3RzKG9iamVjdCwgb3RoZXIsIGJpdG1hc2ssIGN1c3RvbWl6ZXIsIGVxdWFsRnVuYywgc3RhY2spO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VJc0VxdWFsRGVlcDtcbiIsInZhciBiYXNlSXNFcXVhbERlZXAgPSByZXF1aXJlKCcuL19iYXNlSXNFcXVhbERlZXAnKSxcbiAgICBpc09iamVjdExpa2UgPSByZXF1aXJlKCcuL2lzT2JqZWN0TGlrZScpO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzRXF1YWxgIHdoaWNoIHN1cHBvcnRzIHBhcnRpYWwgY29tcGFyaXNvbnNcbiAqIGFuZCB0cmFja3MgdHJhdmVyc2VkIG9iamVjdHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0geyp9IG90aGVyIFRoZSBvdGhlciB2YWx1ZSB0byBjb21wYXJlLlxuICogQHBhcmFtIHtib29sZWFufSBiaXRtYXNrIFRoZSBiaXRtYXNrIGZsYWdzLlxuICogIDEgLSBVbm9yZGVyZWQgY29tcGFyaXNvblxuICogIDIgLSBQYXJ0aWFsIGNvbXBhcmlzb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjdXN0b21pemVyXSBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIGNvbXBhcmlzb25zLlxuICogQHBhcmFtIHtPYmplY3R9IFtzdGFja10gVHJhY2tzIHRyYXZlcnNlZCBgdmFsdWVgIGFuZCBgb3RoZXJgIG9iamVjdHMuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBiYXNlSXNFcXVhbCh2YWx1ZSwgb3RoZXIsIGJpdG1hc2ssIGN1c3RvbWl6ZXIsIHN0YWNrKSB7XG4gIGlmICh2YWx1ZSA9PT0gb3RoZXIpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBpZiAodmFsdWUgPT0gbnVsbCB8fCBvdGhlciA9PSBudWxsIHx8ICghaXNPYmplY3RMaWtlKHZhbHVlKSAmJiAhaXNPYmplY3RMaWtlKG90aGVyKSkpIHtcbiAgICByZXR1cm4gdmFsdWUgIT09IHZhbHVlICYmIG90aGVyICE9PSBvdGhlcjtcbiAgfVxuICByZXR1cm4gYmFzZUlzRXF1YWxEZWVwKHZhbHVlLCBvdGhlciwgYml0bWFzaywgY3VzdG9taXplciwgYmFzZUlzRXF1YWwsIHN0YWNrKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlSXNFcXVhbDtcbiIsInZhciBTdGFjayA9IHJlcXVpcmUoJy4vX1N0YWNrJyksXG4gICAgYmFzZUlzRXF1YWwgPSByZXF1aXJlKCcuL19iYXNlSXNFcXVhbCcpO1xuXG4vKiogVXNlZCB0byBjb21wb3NlIGJpdG1hc2tzIGZvciB2YWx1ZSBjb21wYXJpc29ucy4gKi9cbnZhciBDT01QQVJFX1BBUlRJQUxfRkxBRyA9IDEsXG4gICAgQ09NUEFSRV9VTk9SREVSRURfRkxBRyA9IDI7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaXNNYXRjaGAgd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZSBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaW5zcGVjdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2UgVGhlIG9iamVjdCBvZiBwcm9wZXJ0eSB2YWx1ZXMgdG8gbWF0Y2guXG4gKiBAcGFyYW0ge0FycmF5fSBtYXRjaERhdGEgVGhlIHByb3BlcnR5IG5hbWVzLCB2YWx1ZXMsIGFuZCBjb21wYXJlIGZsYWdzIHRvIG1hdGNoLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2N1c3RvbWl6ZXJdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY29tcGFyaXNvbnMuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYG9iamVjdGAgaXMgYSBtYXRjaCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBiYXNlSXNNYXRjaChvYmplY3QsIHNvdXJjZSwgbWF0Y2hEYXRhLCBjdXN0b21pemVyKSB7XG4gIHZhciBpbmRleCA9IG1hdGNoRGF0YS5sZW5ndGgsXG4gICAgICBsZW5ndGggPSBpbmRleCxcbiAgICAgIG5vQ3VzdG9taXplciA9ICFjdXN0b21pemVyO1xuXG4gIGlmIChvYmplY3QgPT0gbnVsbCkge1xuICAgIHJldHVybiAhbGVuZ3RoO1xuICB9XG4gIG9iamVjdCA9IE9iamVjdChvYmplY3QpO1xuICB3aGlsZSAoaW5kZXgtLSkge1xuICAgIHZhciBkYXRhID0gbWF0Y2hEYXRhW2luZGV4XTtcbiAgICBpZiAoKG5vQ3VzdG9taXplciAmJiBkYXRhWzJdKVxuICAgICAgICAgID8gZGF0YVsxXSAhPT0gb2JqZWN0W2RhdGFbMF1dXG4gICAgICAgICAgOiAhKGRhdGFbMF0gaW4gb2JqZWN0KVxuICAgICAgICApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICBkYXRhID0gbWF0Y2hEYXRhW2luZGV4XTtcbiAgICB2YXIga2V5ID0gZGF0YVswXSxcbiAgICAgICAgb2JqVmFsdWUgPSBvYmplY3Rba2V5XSxcbiAgICAgICAgc3JjVmFsdWUgPSBkYXRhWzFdO1xuXG4gICAgaWYgKG5vQ3VzdG9taXplciAmJiBkYXRhWzJdKSB7XG4gICAgICBpZiAob2JqVmFsdWUgPT09IHVuZGVmaW5lZCAmJiAhKGtleSBpbiBvYmplY3QpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHN0YWNrID0gbmV3IFN0YWNrO1xuICAgICAgaWYgKGN1c3RvbWl6ZXIpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGN1c3RvbWl6ZXIob2JqVmFsdWUsIHNyY1ZhbHVlLCBrZXksIG9iamVjdCwgc291cmNlLCBzdGFjayk7XG4gICAgICB9XG4gICAgICBpZiAoIShyZXN1bHQgPT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgPyBiYXNlSXNFcXVhbChzcmNWYWx1ZSwgb2JqVmFsdWUsIENPTVBBUkVfUEFSVElBTF9GTEFHIHwgQ09NUEFSRV9VTk9SREVSRURfRkxBRywgY3VzdG9taXplciwgc3RhY2spXG4gICAgICAgICAgICA6IHJlc3VsdFxuICAgICAgICAgICkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlSXNNYXRjaDtcbiIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXNPYmplY3QnKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBzdWl0YWJsZSBmb3Igc3RyaWN0IGVxdWFsaXR5IGNvbXBhcmlzb25zLCBpLmUuIGA9PT1gLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlmIHN1aXRhYmxlIGZvciBzdHJpY3RcbiAqICBlcXVhbGl0eSBjb21wYXJpc29ucywgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc1N0cmljdENvbXBhcmFibGUodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID09PSB2YWx1ZSAmJiAhaXNPYmplY3QodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzU3RyaWN0Q29tcGFyYWJsZTtcbiIsInZhciBpc1N0cmljdENvbXBhcmFibGUgPSByZXF1aXJlKCcuL19pc1N0cmljdENvbXBhcmFibGUnKSxcbiAgICBrZXlzID0gcmVxdWlyZSgnLi9rZXlzJyk7XG5cbi8qKlxuICogR2V0cyB0aGUgcHJvcGVydHkgbmFtZXMsIHZhbHVlcywgYW5kIGNvbXBhcmUgZmxhZ3Mgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgbWF0Y2ggZGF0YSBvZiBgb2JqZWN0YC5cbiAqL1xuZnVuY3Rpb24gZ2V0TWF0Y2hEYXRhKG9iamVjdCkge1xuICB2YXIgcmVzdWx0ID0ga2V5cyhvYmplY3QpLFxuICAgICAgbGVuZ3RoID0gcmVzdWx0Lmxlbmd0aDtcblxuICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICB2YXIga2V5ID0gcmVzdWx0W2xlbmd0aF0sXG4gICAgICAgIHZhbHVlID0gb2JqZWN0W2tleV07XG5cbiAgICByZXN1bHRbbGVuZ3RoXSA9IFtrZXksIHZhbHVlLCBpc1N0cmljdENvbXBhcmFibGUodmFsdWUpXTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldE1hdGNoRGF0YTtcbiIsIi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBtYXRjaGVzUHJvcGVydHlgIGZvciBzb3VyY2UgdmFsdWVzIHN1aXRhYmxlXG4gKiBmb3Igc3RyaWN0IGVxdWFsaXR5IGNvbXBhcmlzb25zLCBpLmUuIGA9PT1gLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGdldC5cbiAqIEBwYXJhbSB7Kn0gc3JjVmFsdWUgVGhlIHZhbHVlIHRvIG1hdGNoLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgc3BlYyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gbWF0Y2hlc1N0cmljdENvbXBhcmFibGUoa2V5LCBzcmNWYWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgaWYgKG9iamVjdCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3Rba2V5XSA9PT0gc3JjVmFsdWUgJiZcbiAgICAgIChzcmNWYWx1ZSAhPT0gdW5kZWZpbmVkIHx8IChrZXkgaW4gT2JqZWN0KG9iamVjdCkpKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtYXRjaGVzU3RyaWN0Q29tcGFyYWJsZTtcbiIsInZhciBiYXNlSXNNYXRjaCA9IHJlcXVpcmUoJy4vX2Jhc2VJc01hdGNoJyksXG4gICAgZ2V0TWF0Y2hEYXRhID0gcmVxdWlyZSgnLi9fZ2V0TWF0Y2hEYXRhJyksXG4gICAgbWF0Y2hlc1N0cmljdENvbXBhcmFibGUgPSByZXF1aXJlKCcuL19tYXRjaGVzU3RyaWN0Q29tcGFyYWJsZScpO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLm1hdGNoZXNgIHdoaWNoIGRvZXNuJ3QgY2xvbmUgYHNvdXJjZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2UgVGhlIG9iamVjdCBvZiBwcm9wZXJ0eSB2YWx1ZXMgdG8gbWF0Y2guXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBzcGVjIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiYXNlTWF0Y2hlcyhzb3VyY2UpIHtcbiAgdmFyIG1hdGNoRGF0YSA9IGdldE1hdGNoRGF0YShzb3VyY2UpO1xuICBpZiAobWF0Y2hEYXRhLmxlbmd0aCA9PSAxICYmIG1hdGNoRGF0YVswXVsyXSkge1xuICAgIHJldHVybiBtYXRjaGVzU3RyaWN0Q29tcGFyYWJsZShtYXRjaERhdGFbMF1bMF0sIG1hdGNoRGF0YVswXVsxXSk7XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKG9iamVjdCkge1xuICAgIHJldHVybiBvYmplY3QgPT09IHNvdXJjZSB8fCBiYXNlSXNNYXRjaChvYmplY3QsIHNvdXJjZSwgbWF0Y2hEYXRhKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlTWF0Y2hlcztcbiIsInZhciBiYXNlR2V0VGFnID0gcmVxdWlyZSgnLi9fYmFzZUdldFRhZycpLFxuICAgIGlzT2JqZWN0TGlrZSA9IHJlcXVpcmUoJy4vaXNPYmplY3RMaWtlJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBzeW1ib2xUYWcgPSAnW29iamVjdCBTeW1ib2xdJztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgYFN5bWJvbGAgcHJpbWl0aXZlIG9yIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHN5bWJvbCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzU3ltYm9sKFN5bWJvbC5pdGVyYXRvcik7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc1N5bWJvbCgnYWJjJyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N5bWJvbCh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdzeW1ib2wnIHx8XG4gICAgKGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgYmFzZUdldFRhZyh2YWx1ZSkgPT0gc3ltYm9sVGFnKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc1N5bWJvbDtcbiIsInZhciBpc0FycmF5ID0gcmVxdWlyZSgnLi9pc0FycmF5JyksXG4gICAgaXNTeW1ib2wgPSByZXF1aXJlKCcuL2lzU3ltYm9sJyk7XG5cbi8qKiBVc2VkIHRvIG1hdGNoIHByb3BlcnR5IG5hbWVzIHdpdGhpbiBwcm9wZXJ0eSBwYXRocy4gKi9cbnZhciByZUlzRGVlcFByb3AgPSAvXFwufFxcWyg/OlteW1xcXV0qfChbXCInXSkoPzooPyFcXDEpW15cXFxcXXxcXFxcLikqP1xcMSlcXF0vLFxuICAgIHJlSXNQbGFpblByb3AgPSAvXlxcdyokLztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHByb3BlcnR5IG5hbWUgYW5kIG5vdCBhIHByb3BlcnR5IHBhdGguXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHBhcmFtIHtPYmplY3R9IFtvYmplY3RdIFRoZSBvYmplY3QgdG8gcXVlcnkga2V5cyBvbi5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgcHJvcGVydHkgbmFtZSwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0tleSh2YWx1ZSwgb2JqZWN0KSB7XG4gIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgaWYgKHR5cGUgPT0gJ251bWJlcicgfHwgdHlwZSA9PSAnc3ltYm9sJyB8fCB0eXBlID09ICdib29sZWFuJyB8fFxuICAgICAgdmFsdWUgPT0gbnVsbCB8fCBpc1N5bWJvbCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gcmVJc1BsYWluUHJvcC50ZXN0KHZhbHVlKSB8fCAhcmVJc0RlZXBQcm9wLnRlc3QodmFsdWUpIHx8XG4gICAgKG9iamVjdCAhPSBudWxsICYmIHZhbHVlIGluIE9iamVjdChvYmplY3QpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0tleTtcbiIsInZhciBNYXBDYWNoZSA9IHJlcXVpcmUoJy4vX01hcENhY2hlJyk7XG5cbi8qKiBFcnJvciBtZXNzYWdlIGNvbnN0YW50cy4gKi9cbnZhciBGVU5DX0VSUk9SX1RFWFQgPSAnRXhwZWN0ZWQgYSBmdW5jdGlvbic7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQgbWVtb2l6ZXMgdGhlIHJlc3VsdCBvZiBgZnVuY2AuIElmIGByZXNvbHZlcmAgaXNcbiAqIHByb3ZpZGVkLCBpdCBkZXRlcm1pbmVzIHRoZSBjYWNoZSBrZXkgZm9yIHN0b3JpbmcgdGhlIHJlc3VsdCBiYXNlZCBvbiB0aGVcbiAqIGFyZ3VtZW50cyBwcm92aWRlZCB0byB0aGUgbWVtb2l6ZWQgZnVuY3Rpb24uIEJ5IGRlZmF1bHQsIHRoZSBmaXJzdCBhcmd1bWVudFxuICogcHJvdmlkZWQgdG8gdGhlIG1lbW9pemVkIGZ1bmN0aW9uIGlzIHVzZWQgYXMgdGhlIG1hcCBjYWNoZSBrZXkuIFRoZSBgZnVuY2BcbiAqIGlzIGludm9rZWQgd2l0aCB0aGUgYHRoaXNgIGJpbmRpbmcgb2YgdGhlIG1lbW9pemVkIGZ1bmN0aW9uLlxuICpcbiAqICoqTm90ZToqKiBUaGUgY2FjaGUgaXMgZXhwb3NlZCBhcyB0aGUgYGNhY2hlYCBwcm9wZXJ0eSBvbiB0aGUgbWVtb2l6ZWRcbiAqIGZ1bmN0aW9uLiBJdHMgY3JlYXRpb24gbWF5IGJlIGN1c3RvbWl6ZWQgYnkgcmVwbGFjaW5nIHRoZSBgXy5tZW1vaXplLkNhY2hlYFxuICogY29uc3RydWN0b3Igd2l0aCBvbmUgd2hvc2UgaW5zdGFuY2VzIGltcGxlbWVudCB0aGVcbiAqIFtgTWFwYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtcHJvcGVydGllcy1vZi10aGUtbWFwLXByb3RvdHlwZS1vYmplY3QpXG4gKiBtZXRob2QgaW50ZXJmYWNlIG9mIGBjbGVhcmAsIGBkZWxldGVgLCBgZ2V0YCwgYGhhc2AsIGFuZCBgc2V0YC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGhhdmUgaXRzIG91dHB1dCBtZW1vaXplZC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtyZXNvbHZlcl0gVGhlIGZ1bmN0aW9uIHRvIHJlc29sdmUgdGhlIGNhY2hlIGtleS5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IG1lbW9pemVkIGZ1bmN0aW9uLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAnYSc6IDEsICdiJzogMiB9O1xuICogdmFyIG90aGVyID0geyAnYyc6IDMsICdkJzogNCB9O1xuICpcbiAqIHZhciB2YWx1ZXMgPSBfLm1lbW9pemUoXy52YWx1ZXMpO1xuICogdmFsdWVzKG9iamVjdCk7XG4gKiAvLyA9PiBbMSwgMl1cbiAqXG4gKiB2YWx1ZXMob3RoZXIpO1xuICogLy8gPT4gWzMsIDRdXG4gKlxuICogb2JqZWN0LmEgPSAyO1xuICogdmFsdWVzKG9iamVjdCk7XG4gKiAvLyA9PiBbMSwgMl1cbiAqXG4gKiAvLyBNb2RpZnkgdGhlIHJlc3VsdCBjYWNoZS5cbiAqIHZhbHVlcy5jYWNoZS5zZXQob2JqZWN0LCBbJ2EnLCAnYiddKTtcbiAqIHZhbHVlcyhvYmplY3QpO1xuICogLy8gPT4gWydhJywgJ2InXVxuICpcbiAqIC8vIFJlcGxhY2UgYF8ubWVtb2l6ZS5DYWNoZWAuXG4gKiBfLm1lbW9pemUuQ2FjaGUgPSBXZWFrTWFwO1xuICovXG5mdW5jdGlvbiBtZW1vaXplKGZ1bmMsIHJlc29sdmVyKSB7XG4gIGlmICh0eXBlb2YgZnVuYyAhPSAnZnVuY3Rpb24nIHx8IChyZXNvbHZlciAhPSBudWxsICYmIHR5cGVvZiByZXNvbHZlciAhPSAnZnVuY3Rpb24nKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoRlVOQ19FUlJPUl9URVhUKTtcbiAgfVxuICB2YXIgbWVtb2l6ZWQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncyA9IGFyZ3VtZW50cyxcbiAgICAgICAga2V5ID0gcmVzb2x2ZXIgPyByZXNvbHZlci5hcHBseSh0aGlzLCBhcmdzKSA6IGFyZ3NbMF0sXG4gICAgICAgIGNhY2hlID0gbWVtb2l6ZWQuY2FjaGU7XG5cbiAgICBpZiAoY2FjaGUuaGFzKGtleSkpIHtcbiAgICAgIHJldHVybiBjYWNoZS5nZXQoa2V5KTtcbiAgICB9XG4gICAgdmFyIHJlc3VsdCA9IGZ1bmMuYXBwbHkodGhpcywgYXJncyk7XG4gICAgbWVtb2l6ZWQuY2FjaGUgPSBjYWNoZS5zZXQoa2V5LCByZXN1bHQpIHx8IGNhY2hlO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG4gIG1lbW9pemVkLmNhY2hlID0gbmV3IChtZW1vaXplLkNhY2hlIHx8IE1hcENhY2hlKTtcbiAgcmV0dXJuIG1lbW9pemVkO1xufVxuXG4vLyBFeHBvc2UgYE1hcENhY2hlYC5cbm1lbW9pemUuQ2FjaGUgPSBNYXBDYWNoZTtcblxubW9kdWxlLmV4cG9ydHMgPSBtZW1vaXplO1xuIiwidmFyIG1lbW9pemUgPSByZXF1aXJlKCcuL21lbW9pemUnKTtcblxuLyoqIFVzZWQgYXMgdGhlIG1heGltdW0gbWVtb2l6ZSBjYWNoZSBzaXplLiAqL1xudmFyIE1BWF9NRU1PSVpFX1NJWkUgPSA1MDA7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBfLm1lbW9pemVgIHdoaWNoIGNsZWFycyB0aGUgbWVtb2l6ZWQgZnVuY3Rpb24nc1xuICogY2FjaGUgd2hlbiBpdCBleGNlZWRzIGBNQVhfTUVNT0laRV9TSVpFYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gaGF2ZSBpdHMgb3V0cHV0IG1lbW9pemVkLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgbWVtb2l6ZWQgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIG1lbW9pemVDYXBwZWQoZnVuYykge1xuICB2YXIgcmVzdWx0ID0gbWVtb2l6ZShmdW5jLCBmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAoY2FjaGUuc2l6ZSA9PT0gTUFYX01FTU9JWkVfU0laRSkge1xuICAgICAgY2FjaGUuY2xlYXIoKTtcbiAgICB9XG4gICAgcmV0dXJuIGtleTtcbiAgfSk7XG5cbiAgdmFyIGNhY2hlID0gcmVzdWx0LmNhY2hlO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1lbW9pemVDYXBwZWQ7XG4iLCJ2YXIgbWVtb2l6ZUNhcHBlZCA9IHJlcXVpcmUoJy4vX21lbW9pemVDYXBwZWQnKTtcblxuLyoqIFVzZWQgdG8gbWF0Y2ggcHJvcGVydHkgbmFtZXMgd2l0aGluIHByb3BlcnR5IHBhdGhzLiAqL1xudmFyIHJlUHJvcE5hbWUgPSAvW14uW1xcXV0rfFxcWyg/OigtP1xcZCsoPzpcXC5cXGQrKT8pfChbXCInXSkoKD86KD8hXFwyKVteXFxcXF18XFxcXC4pKj8pXFwyKVxcXXwoPz0oPzpcXC58XFxbXFxdKSg/OlxcLnxcXFtcXF18JCkpL2c7XG5cbi8qKiBVc2VkIHRvIG1hdGNoIGJhY2tzbGFzaGVzIGluIHByb3BlcnR5IHBhdGhzLiAqL1xudmFyIHJlRXNjYXBlQ2hhciA9IC9cXFxcKFxcXFwpPy9nO1xuXG4vKipcbiAqIENvbnZlcnRzIGBzdHJpbmdgIHRvIGEgcHJvcGVydHkgcGF0aCBhcnJheS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZyBUaGUgc3RyaW5nIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIHByb3BlcnR5IHBhdGggYXJyYXkuXG4gKi9cbnZhciBzdHJpbmdUb1BhdGggPSBtZW1vaXplQ2FwcGVkKGZ1bmN0aW9uKHN0cmluZykge1xuICB2YXIgcmVzdWx0ID0gW107XG4gIGlmIChzdHJpbmcuY2hhckNvZGVBdCgwKSA9PT0gNDYgLyogLiAqLykge1xuICAgIHJlc3VsdC5wdXNoKCcnKTtcbiAgfVxuICBzdHJpbmcucmVwbGFjZShyZVByb3BOYW1lLCBmdW5jdGlvbihtYXRjaCwgbnVtYmVyLCBxdW90ZSwgc3ViU3RyaW5nKSB7XG4gICAgcmVzdWx0LnB1c2gocXVvdGUgPyBzdWJTdHJpbmcucmVwbGFjZShyZUVzY2FwZUNoYXIsICckMScpIDogKG51bWJlciB8fCBtYXRjaCkpO1xuICB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHN0cmluZ1RvUGF0aDtcbiIsInZhciBTeW1ib2wgPSByZXF1aXJlKCcuL19TeW1ib2wnKSxcbiAgICBhcnJheU1hcCA9IHJlcXVpcmUoJy4vX2FycmF5TWFwJyksXG4gICAgaXNBcnJheSA9IHJlcXVpcmUoJy4vaXNBcnJheScpLFxuICAgIGlzU3ltYm9sID0gcmVxdWlyZSgnLi9pc1N5bWJvbCcpO1xuXG4vKiogVXNlZCBhcyByZWZlcmVuY2VzIGZvciB2YXJpb3VzIGBOdW1iZXJgIGNvbnN0YW50cy4gKi9cbnZhciBJTkZJTklUWSA9IDEgLyAwO1xuXG4vKiogVXNlZCB0byBjb252ZXJ0IHN5bWJvbHMgdG8gcHJpbWl0aXZlcyBhbmQgc3RyaW5ncy4gKi9cbnZhciBzeW1ib2xQcm90byA9IFN5bWJvbCA/IFN5bWJvbC5wcm90b3R5cGUgOiB1bmRlZmluZWQsXG4gICAgc3ltYm9sVG9TdHJpbmcgPSBzeW1ib2xQcm90byA/IHN5bWJvbFByb3RvLnRvU3RyaW5nIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnRvU3RyaW5nYCB3aGljaCBkb2Vzbid0IGNvbnZlcnQgbnVsbGlzaFxuICogdmFsdWVzIHRvIGVtcHR5IHN0cmluZ3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHByb2Nlc3MuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIGJhc2VUb1N0cmluZyh2YWx1ZSkge1xuICAvLyBFeGl0IGVhcmx5IGZvciBzdHJpbmdzIHRvIGF2b2lkIGEgcGVyZm9ybWFuY2UgaGl0IGluIHNvbWUgZW52aXJvbm1lbnRzLlxuICBpZiAodHlwZW9mIHZhbHVlID09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgIC8vIFJlY3Vyc2l2ZWx5IGNvbnZlcnQgdmFsdWVzIChzdXNjZXB0aWJsZSB0byBjYWxsIHN0YWNrIGxpbWl0cykuXG4gICAgcmV0dXJuIGFycmF5TWFwKHZhbHVlLCBiYXNlVG9TdHJpbmcpICsgJyc7XG4gIH1cbiAgaWYgKGlzU3ltYm9sKHZhbHVlKSkge1xuICAgIHJldHVybiBzeW1ib2xUb1N0cmluZyA/IHN5bWJvbFRvU3RyaW5nLmNhbGwodmFsdWUpIDogJyc7XG4gIH1cbiAgdmFyIHJlc3VsdCA9ICh2YWx1ZSArICcnKTtcbiAgcmV0dXJuIChyZXN1bHQgPT0gJzAnICYmICgxIC8gdmFsdWUpID09IC1JTkZJTklUWSkgPyAnLTAnIDogcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VUb1N0cmluZztcbiIsInZhciBiYXNlVG9TdHJpbmcgPSByZXF1aXJlKCcuL19iYXNlVG9TdHJpbmcnKTtcblxuLyoqXG4gKiBDb252ZXJ0cyBgdmFsdWVgIHRvIGEgc3RyaW5nLiBBbiBlbXB0eSBzdHJpbmcgaXMgcmV0dXJuZWQgZm9yIGBudWxsYFxuICogYW5kIGB1bmRlZmluZWRgIHZhbHVlcy4gVGhlIHNpZ24gb2YgYC0wYCBpcyBwcmVzZXJ2ZWQuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBjb252ZXJ0ZWQgc3RyaW5nLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnRvU3RyaW5nKG51bGwpO1xuICogLy8gPT4gJydcbiAqXG4gKiBfLnRvU3RyaW5nKC0wKTtcbiAqIC8vID0+ICctMCdcbiAqXG4gKiBfLnRvU3RyaW5nKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiAnMSwyLDMnXG4gKi9cbmZ1bmN0aW9uIHRvU3RyaW5nKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9PSBudWxsID8gJycgOiBiYXNlVG9TdHJpbmcodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRvU3RyaW5nO1xuIiwidmFyIGlzQXJyYXkgPSByZXF1aXJlKCcuL2lzQXJyYXknKSxcbiAgICBpc0tleSA9IHJlcXVpcmUoJy4vX2lzS2V5JyksXG4gICAgc3RyaW5nVG9QYXRoID0gcmVxdWlyZSgnLi9fc3RyaW5nVG9QYXRoJyksXG4gICAgdG9TdHJpbmcgPSByZXF1aXJlKCcuL3RvU3RyaW5nJyk7XG5cbi8qKlxuICogQ2FzdHMgYHZhbHVlYCB0byBhIHBhdGggYXJyYXkgaWYgaXQncyBub3Qgb25lLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBpbnNwZWN0LlxuICogQHBhcmFtIHtPYmplY3R9IFtvYmplY3RdIFRoZSBvYmplY3QgdG8gcXVlcnkga2V5cyBvbi5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgY2FzdCBwcm9wZXJ0eSBwYXRoIGFycmF5LlxuICovXG5mdW5jdGlvbiBjYXN0UGF0aCh2YWx1ZSwgb2JqZWN0KSB7XG4gIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICByZXR1cm4gaXNLZXkodmFsdWUsIG9iamVjdCkgPyBbdmFsdWVdIDogc3RyaW5nVG9QYXRoKHRvU3RyaW5nKHZhbHVlKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2FzdFBhdGg7XG4iLCJ2YXIgaXNTeW1ib2wgPSByZXF1aXJlKCcuL2lzU3ltYm9sJyk7XG5cbi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIElORklOSVRZID0gMSAvIDA7XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIHN0cmluZyBrZXkgaWYgaXQncyBub3QgYSBzdHJpbmcgb3Igc3ltYm9sLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBpbnNwZWN0LlxuICogQHJldHVybnMge3N0cmluZ3xzeW1ib2x9IFJldHVybnMgdGhlIGtleS5cbiAqL1xuZnVuY3Rpb24gdG9LZXkodmFsdWUpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnc3RyaW5nJyB8fCBpc1N5bWJvbCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgdmFyIHJlc3VsdCA9ICh2YWx1ZSArICcnKTtcbiAgcmV0dXJuIChyZXN1bHQgPT0gJzAnICYmICgxIC8gdmFsdWUpID09IC1JTkZJTklUWSkgPyAnLTAnIDogcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRvS2V5O1xuIiwidmFyIGNhc3RQYXRoID0gcmVxdWlyZSgnLi9fY2FzdFBhdGgnKSxcbiAgICB0b0tleSA9IHJlcXVpcmUoJy4vX3RvS2V5Jyk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uZ2V0YCB3aXRob3V0IHN1cHBvcnQgZm9yIGRlZmF1bHQgdmFsdWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge0FycmF5fHN0cmluZ30gcGF0aCBUaGUgcGF0aCBvZiB0aGUgcHJvcGVydHkgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHJlc29sdmVkIHZhbHVlLlxuICovXG5mdW5jdGlvbiBiYXNlR2V0KG9iamVjdCwgcGF0aCkge1xuICBwYXRoID0gY2FzdFBhdGgocGF0aCwgb2JqZWN0KTtcblxuICB2YXIgaW5kZXggPSAwLFxuICAgICAgbGVuZ3RoID0gcGF0aC5sZW5ndGg7XG5cbiAgd2hpbGUgKG9iamVjdCAhPSBudWxsICYmIGluZGV4IDwgbGVuZ3RoKSB7XG4gICAgb2JqZWN0ID0gb2JqZWN0W3RvS2V5KHBhdGhbaW5kZXgrK10pXTtcbiAgfVxuICByZXR1cm4gKGluZGV4ICYmIGluZGV4ID09IGxlbmd0aCkgPyBvYmplY3QgOiB1bmRlZmluZWQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUdldDtcbiIsInZhciBiYXNlR2V0ID0gcmVxdWlyZSgnLi9fYmFzZUdldCcpO1xuXG4vKipcbiAqIEdldHMgdGhlIHZhbHVlIGF0IGBwYXRoYCBvZiBgb2JqZWN0YC4gSWYgdGhlIHJlc29sdmVkIHZhbHVlIGlzXG4gKiBgdW5kZWZpbmVkYCwgdGhlIGBkZWZhdWx0VmFsdWVgIGlzIHJldHVybmVkIGluIGl0cyBwbGFjZS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDMuNy4wXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge0FycmF5fHN0cmluZ30gcGF0aCBUaGUgcGF0aCBvZiB0aGUgcHJvcGVydHkgdG8gZ2V0LlxuICogQHBhcmFtIHsqfSBbZGVmYXVsdFZhbHVlXSBUaGUgdmFsdWUgcmV0dXJuZWQgZm9yIGB1bmRlZmluZWRgIHJlc29sdmVkIHZhbHVlcy5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSByZXNvbHZlZCB2YWx1ZS5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdCA9IHsgJ2EnOiBbeyAnYic6IHsgJ2MnOiAzIH0gfV0gfTtcbiAqXG4gKiBfLmdldChvYmplY3QsICdhWzBdLmIuYycpO1xuICogLy8gPT4gM1xuICpcbiAqIF8uZ2V0KG9iamVjdCwgWydhJywgJzAnLCAnYicsICdjJ10pO1xuICogLy8gPT4gM1xuICpcbiAqIF8uZ2V0KG9iamVjdCwgJ2EuYi5jJywgJ2RlZmF1bHQnKTtcbiAqIC8vID0+ICdkZWZhdWx0J1xuICovXG5mdW5jdGlvbiBnZXQob2JqZWN0LCBwYXRoLCBkZWZhdWx0VmFsdWUpIHtcbiAgdmFyIHJlc3VsdCA9IG9iamVjdCA9PSBudWxsID8gdW5kZWZpbmVkIDogYmFzZUdldChvYmplY3QsIHBhdGgpO1xuICByZXR1cm4gcmVzdWx0ID09PSB1bmRlZmluZWQgPyBkZWZhdWx0VmFsdWUgOiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0O1xuIiwiLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5oYXNJbmAgd2l0aG91dCBzdXBwb3J0IGZvciBkZWVwIHBhdGhzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gW29iamVjdF0gVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7QXJyYXl8c3RyaW5nfSBrZXkgVGhlIGtleSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBga2V5YCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUhhc0luKG9iamVjdCwga2V5KSB7XG4gIHJldHVybiBvYmplY3QgIT0gbnVsbCAmJiBrZXkgaW4gT2JqZWN0KG9iamVjdCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUhhc0luO1xuIiwidmFyIGNhc3RQYXRoID0gcmVxdWlyZSgnLi9fY2FzdFBhdGgnKSxcbiAgICBpc0FyZ3VtZW50cyA9IHJlcXVpcmUoJy4vaXNBcmd1bWVudHMnKSxcbiAgICBpc0FycmF5ID0gcmVxdWlyZSgnLi9pc0FycmF5JyksXG4gICAgaXNJbmRleCA9IHJlcXVpcmUoJy4vX2lzSW5kZXgnKSxcbiAgICBpc0xlbmd0aCA9IHJlcXVpcmUoJy4vaXNMZW5ndGgnKSxcbiAgICB0b0tleSA9IHJlcXVpcmUoJy4vX3RvS2V5Jyk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGBwYXRoYCBleGlzdHMgb24gYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7QXJyYXl8c3RyaW5nfSBwYXRoIFRoZSBwYXRoIHRvIGNoZWNrLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaGFzRnVuYyBUaGUgZnVuY3Rpb24gdG8gY2hlY2sgcHJvcGVydGllcy5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgcGF0aGAgZXhpc3RzLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGhhc1BhdGgob2JqZWN0LCBwYXRoLCBoYXNGdW5jKSB7XG4gIHBhdGggPSBjYXN0UGF0aChwYXRoLCBvYmplY3QpO1xuXG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gcGF0aC5sZW5ndGgsXG4gICAgICByZXN1bHQgPSBmYWxzZTtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBrZXkgPSB0b0tleShwYXRoW2luZGV4XSk7XG4gICAgaWYgKCEocmVzdWx0ID0gb2JqZWN0ICE9IG51bGwgJiYgaGFzRnVuYyhvYmplY3QsIGtleSkpKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgb2JqZWN0ID0gb2JqZWN0W2tleV07XG4gIH1cbiAgaWYgKHJlc3VsdCB8fCArK2luZGV4ICE9IGxlbmd0aCkge1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgbGVuZ3RoID0gb2JqZWN0ID09IG51bGwgPyAwIDogb2JqZWN0Lmxlbmd0aDtcbiAgcmV0dXJuICEhbGVuZ3RoICYmIGlzTGVuZ3RoKGxlbmd0aCkgJiYgaXNJbmRleChrZXksIGxlbmd0aCkgJiZcbiAgICAoaXNBcnJheShvYmplY3QpIHx8IGlzQXJndW1lbnRzKG9iamVjdCkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGhhc1BhdGg7XG4iLCJ2YXIgYmFzZUhhc0luID0gcmVxdWlyZSgnLi9fYmFzZUhhc0luJyksXG4gICAgaGFzUGF0aCA9IHJlcXVpcmUoJy4vX2hhc1BhdGgnKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHBhdGhgIGlzIGEgZGlyZWN0IG9yIGluaGVyaXRlZCBwcm9wZXJ0eSBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge0FycmF5fHN0cmluZ30gcGF0aCBUaGUgcGF0aCB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgcGF0aGAgZXhpc3RzLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3QgPSBfLmNyZWF0ZSh7ICdhJzogXy5jcmVhdGUoeyAnYic6IDIgfSkgfSk7XG4gKlxuICogXy5oYXNJbihvYmplY3QsICdhJyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5oYXNJbihvYmplY3QsICdhLmInKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmhhc0luKG9iamVjdCwgWydhJywgJ2InXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5oYXNJbihvYmplY3QsICdiJyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBoYXNJbihvYmplY3QsIHBhdGgpIHtcbiAgcmV0dXJuIG9iamVjdCAhPSBudWxsICYmIGhhc1BhdGgob2JqZWN0LCBwYXRoLCBiYXNlSGFzSW4pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGhhc0luO1xuIiwidmFyIGJhc2VJc0VxdWFsID0gcmVxdWlyZSgnLi9fYmFzZUlzRXF1YWwnKSxcbiAgICBnZXQgPSByZXF1aXJlKCcuL2dldCcpLFxuICAgIGhhc0luID0gcmVxdWlyZSgnLi9oYXNJbicpLFxuICAgIGlzS2V5ID0gcmVxdWlyZSgnLi9faXNLZXknKSxcbiAgICBpc1N0cmljdENvbXBhcmFibGUgPSByZXF1aXJlKCcuL19pc1N0cmljdENvbXBhcmFibGUnKSxcbiAgICBtYXRjaGVzU3RyaWN0Q29tcGFyYWJsZSA9IHJlcXVpcmUoJy4vX21hdGNoZXNTdHJpY3RDb21wYXJhYmxlJyksXG4gICAgdG9LZXkgPSByZXF1aXJlKCcuL190b0tleScpO1xuXG4vKiogVXNlZCB0byBjb21wb3NlIGJpdG1hc2tzIGZvciB2YWx1ZSBjb21wYXJpc29ucy4gKi9cbnZhciBDT01QQVJFX1BBUlRJQUxfRkxBRyA9IDEsXG4gICAgQ09NUEFSRV9VTk9SREVSRURfRkxBRyA9IDI7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ubWF0Y2hlc1Byb3BlcnR5YCB3aGljaCBkb2Vzbid0IGNsb25lIGBzcmNWYWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIFRoZSBwYXRoIG9mIHRoZSBwcm9wZXJ0eSB0byBnZXQuXG4gKiBAcGFyYW0geyp9IHNyY1ZhbHVlIFRoZSB2YWx1ZSB0byBtYXRjaC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IHNwZWMgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VNYXRjaGVzUHJvcGVydHkocGF0aCwgc3JjVmFsdWUpIHtcbiAgaWYgKGlzS2V5KHBhdGgpICYmIGlzU3RyaWN0Q29tcGFyYWJsZShzcmNWYWx1ZSkpIHtcbiAgICByZXR1cm4gbWF0Y2hlc1N0cmljdENvbXBhcmFibGUodG9LZXkocGF0aCksIHNyY1ZhbHVlKTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgdmFyIG9ialZhbHVlID0gZ2V0KG9iamVjdCwgcGF0aCk7XG4gICAgcmV0dXJuIChvYmpWYWx1ZSA9PT0gdW5kZWZpbmVkICYmIG9ialZhbHVlID09PSBzcmNWYWx1ZSlcbiAgICAgID8gaGFzSW4ob2JqZWN0LCBwYXRoKVxuICAgICAgOiBiYXNlSXNFcXVhbChzcmNWYWx1ZSwgb2JqVmFsdWUsIENPTVBBUkVfUEFSVElBTF9GTEFHIHwgQ09NUEFSRV9VTk9SREVSRURfRkxBRyk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZU1hdGNoZXNQcm9wZXJ0eTtcbiIsIi8qKlxuICogVGhpcyBtZXRob2QgcmV0dXJucyB0aGUgZmlyc3QgYXJndW1lbnQgaXQgcmVjZWl2ZXMuXG4gKlxuICogQHN0YXRpY1xuICogQHNpbmNlIDAuMS4wXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IFV0aWxcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgQW55IHZhbHVlLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgYHZhbHVlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdCA9IHsgJ2EnOiAxIH07XG4gKlxuICogY29uc29sZS5sb2coXy5pZGVudGl0eShvYmplY3QpID09PSBvYmplY3QpO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBpZGVudGl0eSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaWRlbnRpdHk7XG4iLCIvKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnByb3BlcnR5YCB3aXRob3V0IHN1cHBvcnQgZm9yIGRlZXAgcGF0aHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gZ2V0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYWNjZXNzb3IgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VQcm9wZXJ0eShrZXkpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKG9iamVjdCkge1xuICAgIHJldHVybiBvYmplY3QgPT0gbnVsbCA/IHVuZGVmaW5lZCA6IG9iamVjdFtrZXldO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VQcm9wZXJ0eTtcbiIsInZhciBiYXNlR2V0ID0gcmVxdWlyZSgnLi9fYmFzZUdldCcpO1xuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgYmFzZVByb3BlcnR5YCB3aGljaCBzdXBwb3J0cyBkZWVwIHBhdGhzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fHN0cmluZ30gcGF0aCBUaGUgcGF0aCBvZiB0aGUgcHJvcGVydHkgdG8gZ2V0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYWNjZXNzb3IgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VQcm9wZXJ0eURlZXAocGF0aCkge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgcmV0dXJuIGJhc2VHZXQob2JqZWN0LCBwYXRoKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlUHJvcGVydHlEZWVwO1xuIiwidmFyIGJhc2VQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vX2Jhc2VQcm9wZXJ0eScpLFxuICAgIGJhc2VQcm9wZXJ0eURlZXAgPSByZXF1aXJlKCcuL19iYXNlUHJvcGVydHlEZWVwJyksXG4gICAgaXNLZXkgPSByZXF1aXJlKCcuL19pc0tleScpLFxuICAgIHRvS2V5ID0gcmVxdWlyZSgnLi9fdG9LZXknKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSB2YWx1ZSBhdCBgcGF0aGAgb2YgYSBnaXZlbiBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAyLjQuMFxuICogQGNhdGVnb3J5IFV0aWxcbiAqIEBwYXJhbSB7QXJyYXl8c3RyaW5nfSBwYXRoIFRoZSBwYXRoIG9mIHRoZSBwcm9wZXJ0eSB0byBnZXQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBhY2Nlc3NvciBmdW5jdGlvbi5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdHMgPSBbXG4gKiAgIHsgJ2EnOiB7ICdiJzogMiB9IH0sXG4gKiAgIHsgJ2EnOiB7ICdiJzogMSB9IH1cbiAqIF07XG4gKlxuICogXy5tYXAob2JqZWN0cywgXy5wcm9wZXJ0eSgnYS5iJykpO1xuICogLy8gPT4gWzIsIDFdXG4gKlxuICogXy5tYXAoXy5zb3J0Qnkob2JqZWN0cywgXy5wcm9wZXJ0eShbJ2EnLCAnYiddKSksICdhLmInKTtcbiAqIC8vID0+IFsxLCAyXVxuICovXG5mdW5jdGlvbiBwcm9wZXJ0eShwYXRoKSB7XG4gIHJldHVybiBpc0tleShwYXRoKSA/IGJhc2VQcm9wZXJ0eSh0b0tleShwYXRoKSkgOiBiYXNlUHJvcGVydHlEZWVwKHBhdGgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHByb3BlcnR5O1xuIiwidmFyIGJhc2VNYXRjaGVzID0gcmVxdWlyZSgnLi9fYmFzZU1hdGNoZXMnKSxcbiAgICBiYXNlTWF0Y2hlc1Byb3BlcnR5ID0gcmVxdWlyZSgnLi9fYmFzZU1hdGNoZXNQcm9wZXJ0eScpLFxuICAgIGlkZW50aXR5ID0gcmVxdWlyZSgnLi9pZGVudGl0eScpLFxuICAgIGlzQXJyYXkgPSByZXF1aXJlKCcuL2lzQXJyYXknKSxcbiAgICBwcm9wZXJ0eSA9IHJlcXVpcmUoJy4vcHJvcGVydHknKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pdGVyYXRlZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gW3ZhbHVlPV8uaWRlbnRpdHldIFRoZSB2YWx1ZSB0byBjb252ZXJ0IHRvIGFuIGl0ZXJhdGVlLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBpdGVyYXRlZS5cbiAqL1xuZnVuY3Rpb24gYmFzZUl0ZXJhdGVlKHZhbHVlKSB7XG4gIC8vIERvbid0IHN0b3JlIHRoZSBgdHlwZW9mYCByZXN1bHQgaW4gYSB2YXJpYWJsZSB0byBhdm9pZCBhIEpJVCBidWcgaW4gU2FmYXJpIDkuXG4gIC8vIFNlZSBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTU2MDM0IGZvciBtb3JlIGRldGFpbHMuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgIHJldHVybiBpZGVudGl0eTtcbiAgfVxuICBpZiAodHlwZW9mIHZhbHVlID09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIGlzQXJyYXkodmFsdWUpXG4gICAgICA/IGJhc2VNYXRjaGVzUHJvcGVydHkodmFsdWVbMF0sIHZhbHVlWzFdKVxuICAgICAgOiBiYXNlTWF0Y2hlcyh2YWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHByb3BlcnR5KHZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlSXRlcmF0ZWU7XG4iLCJ2YXIgZ2V0TmF0aXZlID0gcmVxdWlyZSgnLi9fZ2V0TmF0aXZlJyk7XG5cbnZhciBkZWZpbmVQcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcbiAgdHJ5IHtcbiAgICB2YXIgZnVuYyA9IGdldE5hdGl2ZShPYmplY3QsICdkZWZpbmVQcm9wZXJ0eScpO1xuICAgIGZ1bmMoe30sICcnLCB7fSk7XG4gICAgcmV0dXJuIGZ1bmM7XG4gIH0gY2F0Y2ggKGUpIHt9XG59KCkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmluZVByb3BlcnR5O1xuIiwidmFyIGRlZmluZVByb3BlcnR5ID0gcmVxdWlyZSgnLi9fZGVmaW5lUHJvcGVydHknKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgYXNzaWduVmFsdWVgIGFuZCBgYXNzaWduTWVyZ2VWYWx1ZWAgd2l0aG91dFxuICogdmFsdWUgY2hlY2tzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBhc3NpZ24uXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBhc3NpZ24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VBc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgaWYgKGtleSA9PSAnX19wcm90b19fJyAmJiBkZWZpbmVQcm9wZXJ0eSkge1xuICAgIGRlZmluZVByb3BlcnR5KG9iamVjdCwga2V5LCB7XG4gICAgICAnY29uZmlndXJhYmxlJzogdHJ1ZSxcbiAgICAgICdlbnVtZXJhYmxlJzogdHJ1ZSxcbiAgICAgICd2YWx1ZSc6IHZhbHVlLFxuICAgICAgJ3dyaXRhYmxlJzogdHJ1ZVxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIG9iamVjdFtrZXldID0gdmFsdWU7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlQXNzaWduVmFsdWU7XG4iLCJ2YXIgYmFzZUFzc2lnblZhbHVlID0gcmVxdWlyZSgnLi9fYmFzZUFzc2lnblZhbHVlJyksXG4gICAgZXEgPSByZXF1aXJlKCcuL2VxJyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQXNzaWducyBgdmFsdWVgIHRvIGBrZXlgIG9mIGBvYmplY3RgIGlmIHRoZSBleGlzdGluZyB2YWx1ZSBpcyBub3QgZXF1aXZhbGVudFxuICogdXNpbmcgW2BTYW1lVmFsdWVaZXJvYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtc2FtZXZhbHVlemVybylcbiAqIGZvciBlcXVhbGl0eSBjb21wYXJpc29ucy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gYXNzaWduLlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gYXNzaWduLlxuICovXG5mdW5jdGlvbiBhc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgdmFyIG9ialZhbHVlID0gb2JqZWN0W2tleV07XG4gIGlmICghKGhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpICYmIGVxKG9ialZhbHVlLCB2YWx1ZSkpIHx8XG4gICAgICAodmFsdWUgPT09IHVuZGVmaW5lZCAmJiAhKGtleSBpbiBvYmplY3QpKSkge1xuICAgIGJhc2VBc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgdmFsdWUpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXNzaWduVmFsdWU7XG4iLCJ2YXIgYXNzaWduVmFsdWUgPSByZXF1aXJlKCcuL19hc3NpZ25WYWx1ZScpLFxuICAgIGNhc3RQYXRoID0gcmVxdWlyZSgnLi9fY2FzdFBhdGgnKSxcbiAgICBpc0luZGV4ID0gcmVxdWlyZSgnLi9faXNJbmRleCcpLFxuICAgIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9pc09iamVjdCcpLFxuICAgIHRvS2V5ID0gcmVxdWlyZSgnLi9fdG9LZXknKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5zZXRgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtBcnJheXxzdHJpbmd9IHBhdGggVGhlIHBhdGggb2YgdGhlIHByb3BlcnR5IHRvIHNldC5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHNldC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjdXN0b21pemVyXSBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIHBhdGggY3JlYXRpb24uXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICovXG5mdW5jdGlvbiBiYXNlU2V0KG9iamVjdCwgcGF0aCwgdmFsdWUsIGN1c3RvbWl6ZXIpIHtcbiAgaWYgKCFpc09iamVjdChvYmplY3QpKSB7XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfVxuICBwYXRoID0gY2FzdFBhdGgocGF0aCwgb2JqZWN0KTtcblxuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IHBhdGgubGVuZ3RoLFxuICAgICAgbGFzdEluZGV4ID0gbGVuZ3RoIC0gMSxcbiAgICAgIG5lc3RlZCA9IG9iamVjdDtcblxuICB3aGlsZSAobmVzdGVkICE9IG51bGwgJiYgKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBrZXkgPSB0b0tleShwYXRoW2luZGV4XSksXG4gICAgICAgIG5ld1ZhbHVlID0gdmFsdWU7XG5cbiAgICBpZiAoa2V5ID09PSAnX19wcm90b19fJyB8fCBrZXkgPT09ICdjb25zdHJ1Y3RvcicgfHwga2V5ID09PSAncHJvdG90eXBlJykge1xuICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICB9XG5cbiAgICBpZiAoaW5kZXggIT0gbGFzdEluZGV4KSB7XG4gICAgICB2YXIgb2JqVmFsdWUgPSBuZXN0ZWRba2V5XTtcbiAgICAgIG5ld1ZhbHVlID0gY3VzdG9taXplciA/IGN1c3RvbWl6ZXIob2JqVmFsdWUsIGtleSwgbmVzdGVkKSA6IHVuZGVmaW5lZDtcbiAgICAgIGlmIChuZXdWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIG5ld1ZhbHVlID0gaXNPYmplY3Qob2JqVmFsdWUpXG4gICAgICAgICAgPyBvYmpWYWx1ZVxuICAgICAgICAgIDogKGlzSW5kZXgocGF0aFtpbmRleCArIDFdKSA/IFtdIDoge30pO1xuICAgICAgfVxuICAgIH1cbiAgICBhc3NpZ25WYWx1ZShuZXN0ZWQsIGtleSwgbmV3VmFsdWUpO1xuICAgIG5lc3RlZCA9IG5lc3RlZFtrZXldO1xuICB9XG4gIHJldHVybiBvYmplY3Q7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZVNldDtcbiIsInZhciBiYXNlR2V0ID0gcmVxdWlyZSgnLi9fYmFzZUdldCcpLFxuICAgIGJhc2VTZXQgPSByZXF1aXJlKCcuL19iYXNlU2V0JyksXG4gICAgY2FzdFBhdGggPSByZXF1aXJlKCcuL19jYXN0UGF0aCcpO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mICBgXy5waWNrQnlgIHdpdGhvdXQgc3VwcG9ydCBmb3IgaXRlcmF0ZWUgc2hvcnRoYW5kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgc291cmNlIG9iamVjdC5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHBhdGhzIFRoZSBwcm9wZXJ0eSBwYXRocyB0byBwaWNrLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcHJlZGljYXRlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBwcm9wZXJ0eS5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIG5ldyBvYmplY3QuXG4gKi9cbmZ1bmN0aW9uIGJhc2VQaWNrQnkob2JqZWN0LCBwYXRocywgcHJlZGljYXRlKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gcGF0aHMubGVuZ3RoLFxuICAgICAgcmVzdWx0ID0ge307XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIgcGF0aCA9IHBhdGhzW2luZGV4XSxcbiAgICAgICAgdmFsdWUgPSBiYXNlR2V0KG9iamVjdCwgcGF0aCk7XG5cbiAgICBpZiAocHJlZGljYXRlKHZhbHVlLCBwYXRoKSkge1xuICAgICAgYmFzZVNldChyZXN1bHQsIGNhc3RQYXRoKHBhdGgsIG9iamVjdCksIHZhbHVlKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlUGlja0J5O1xuIiwidmFyIG92ZXJBcmcgPSByZXF1aXJlKCcuL19vdmVyQXJnJyk7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIGdldFByb3RvdHlwZSA9IG92ZXJBcmcoT2JqZWN0LmdldFByb3RvdHlwZU9mLCBPYmplY3QpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFByb3RvdHlwZTtcbiIsInZhciBhcnJheVB1c2ggPSByZXF1aXJlKCcuL19hcnJheVB1c2gnKSxcbiAgICBnZXRQcm90b3R5cGUgPSByZXF1aXJlKCcuL19nZXRQcm90b3R5cGUnKSxcbiAgICBnZXRTeW1ib2xzID0gcmVxdWlyZSgnLi9fZ2V0U3ltYm9scycpLFxuICAgIHN0dWJBcnJheSA9IHJlcXVpcmUoJy4vc3R1YkFycmF5Jyk7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVHZXRTeW1ib2xzID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scztcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIHRoZSBvd24gYW5kIGluaGVyaXRlZCBlbnVtZXJhYmxlIHN5bWJvbHMgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2Ygc3ltYm9scy5cbiAqL1xudmFyIGdldFN5bWJvbHNJbiA9ICFuYXRpdmVHZXRTeW1ib2xzID8gc3R1YkFycmF5IDogZnVuY3Rpb24ob2JqZWN0KSB7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgd2hpbGUgKG9iamVjdCkge1xuICAgIGFycmF5UHVzaChyZXN1bHQsIGdldFN5bWJvbHMob2JqZWN0KSk7XG4gICAgb2JqZWN0ID0gZ2V0UHJvdG90eXBlKG9iamVjdCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0U3ltYm9sc0luO1xuIiwiLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIGlzIGxpa2VcbiAqIFtgT2JqZWN0LmtleXNgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3Qua2V5cylcbiAqIGV4Y2VwdCB0aGF0IGl0IGluY2x1ZGVzIGluaGVyaXRlZCBlbnVtZXJhYmxlIHByb3BlcnRpZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIG5hdGl2ZUtleXNJbihvYmplY3QpIHtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICBpZiAob2JqZWN0ICE9IG51bGwpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gT2JqZWN0KG9iamVjdCkpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbmF0aXZlS2V5c0luO1xuIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9pc09iamVjdCcpLFxuICAgIGlzUHJvdG90eXBlID0gcmVxdWlyZSgnLi9faXNQcm90b3R5cGUnKSxcbiAgICBuYXRpdmVLZXlzSW4gPSByZXF1aXJlKCcuL19uYXRpdmVLZXlzSW4nKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5rZXlzSW5gIHdoaWNoIGRvZXNuJ3QgdHJlYXQgc3BhcnNlIGFycmF5cyBhcyBkZW5zZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqL1xuZnVuY3Rpb24gYmFzZUtleXNJbihvYmplY3QpIHtcbiAgaWYgKCFpc09iamVjdChvYmplY3QpKSB7XG4gICAgcmV0dXJuIG5hdGl2ZUtleXNJbihvYmplY3QpO1xuICB9XG4gIHZhciBpc1Byb3RvID0gaXNQcm90b3R5cGUob2JqZWN0KSxcbiAgICAgIHJlc3VsdCA9IFtdO1xuXG4gIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICBpZiAoIShrZXkgPT0gJ2NvbnN0cnVjdG9yJyAmJiAoaXNQcm90byB8fCAhaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGtleSkpKSkge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlS2V5c0luO1xuIiwidmFyIGFycmF5TGlrZUtleXMgPSByZXF1aXJlKCcuL19hcnJheUxpa2VLZXlzJyksXG4gICAgYmFzZUtleXNJbiA9IHJlcXVpcmUoJy4vX2Jhc2VLZXlzSW4nKSxcbiAgICBpc0FycmF5TGlrZSA9IHJlcXVpcmUoJy4vaXNBcnJheUxpa2UnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIHRoZSBvd24gYW5kIGluaGVyaXRlZCBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIG9mIGBvYmplY3RgLlxuICpcbiAqICoqTm90ZToqKiBOb24tb2JqZWN0IHZhbHVlcyBhcmUgY29lcmNlZCB0byBvYmplY3RzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMy4wLjBcbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKiBAZXhhbXBsZVxuICpcbiAqIGZ1bmN0aW9uIEZvbygpIHtcbiAqICAgdGhpcy5hID0gMTtcbiAqICAgdGhpcy5iID0gMjtcbiAqIH1cbiAqXG4gKiBGb28ucHJvdG90eXBlLmMgPSAzO1xuICpcbiAqIF8ua2V5c0luKG5ldyBGb28pO1xuICogLy8gPT4gWydhJywgJ2InLCAnYyddIChpdGVyYXRpb24gb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQpXG4gKi9cbmZ1bmN0aW9uIGtleXNJbihvYmplY3QpIHtcbiAgcmV0dXJuIGlzQXJyYXlMaWtlKG9iamVjdCkgPyBhcnJheUxpa2VLZXlzKG9iamVjdCwgdHJ1ZSkgOiBiYXNlS2V5c0luKG9iamVjdCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ga2V5c0luO1xuIiwidmFyIGJhc2VHZXRBbGxLZXlzID0gcmVxdWlyZSgnLi9fYmFzZUdldEFsbEtleXMnKSxcbiAgICBnZXRTeW1ib2xzSW4gPSByZXF1aXJlKCcuL19nZXRTeW1ib2xzSW4nKSxcbiAgICBrZXlzSW4gPSByZXF1aXJlKCcuL2tleXNJbicpO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2Ygb3duIGFuZCBpbmhlcml0ZWQgZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBhbmRcbiAqIHN5bWJvbHMgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMgYW5kIHN5bWJvbHMuXG4gKi9cbmZ1bmN0aW9uIGdldEFsbEtleXNJbihvYmplY3QpIHtcbiAgcmV0dXJuIGJhc2VHZXRBbGxLZXlzKG9iamVjdCwga2V5c0luLCBnZXRTeW1ib2xzSW4pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldEFsbEtleXNJbjtcbiIsInZhciBhcnJheU1hcCA9IHJlcXVpcmUoJy4vX2FycmF5TWFwJyksXG4gICAgYmFzZUl0ZXJhdGVlID0gcmVxdWlyZSgnLi9fYmFzZUl0ZXJhdGVlJyksXG4gICAgYmFzZVBpY2tCeSA9IHJlcXVpcmUoJy4vX2Jhc2VQaWNrQnknKSxcbiAgICBnZXRBbGxLZXlzSW4gPSByZXF1aXJlKCcuL19nZXRBbGxLZXlzSW4nKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIG9iamVjdCBjb21wb3NlZCBvZiB0aGUgYG9iamVjdGAgcHJvcGVydGllcyBgcHJlZGljYXRlYCByZXR1cm5zXG4gKiB0cnV0aHkgZm9yLiBUaGUgcHJlZGljYXRlIGlzIGludm9rZWQgd2l0aCB0d28gYXJndW1lbnRzOiAodmFsdWUsIGtleSkuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgc291cmNlIG9iamVjdC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtwcmVkaWNhdGU9Xy5pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIHByb3BlcnR5LlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgbmV3IG9iamVjdC5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdCA9IHsgJ2EnOiAxLCAnYic6ICcyJywgJ2MnOiAzIH07XG4gKlxuICogXy5waWNrQnkob2JqZWN0LCBfLmlzTnVtYmVyKTtcbiAqIC8vID0+IHsgJ2EnOiAxLCAnYyc6IDMgfVxuICovXG5mdW5jdGlvbiBwaWNrQnkob2JqZWN0LCBwcmVkaWNhdGUpIHtcbiAgaWYgKG9iamVjdCA9PSBudWxsKSB7XG4gICAgcmV0dXJuIHt9O1xuICB9XG4gIHZhciBwcm9wcyA9IGFycmF5TWFwKGdldEFsbEtleXNJbihvYmplY3QpLCBmdW5jdGlvbihwcm9wKSB7XG4gICAgcmV0dXJuIFtwcm9wXTtcbiAgfSk7XG4gIHByZWRpY2F0ZSA9IGJhc2VJdGVyYXRlZShwcmVkaWNhdGUpO1xuICByZXR1cm4gYmFzZVBpY2tCeShvYmplY3QsIHByb3BzLCBmdW5jdGlvbih2YWx1ZSwgcGF0aCkge1xuICAgIHJldHVybiBwcmVkaWNhdGUodmFsdWUsIHBhdGhbMF0pO1xuICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBwaWNrQnk7XG4iLCJpbXBvcnQgeyBCb3gsIEJ1dHRvbiwgRHJhd2VyLCBEcmF3ZXJDb250ZW50LCBEcmF3ZXJGb290ZXIsIEgzLCBJY29uIH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSc7XG5pbXBvcnQgaXNOaWwgZnJvbSAnbG9kYXNoL2lzTmlsLmpzJztcbmltcG9ydCBwaWNrQnkgZnJvbSAnbG9kYXNoL3BpY2tCeS5qcyc7XG5pbXBvcnQgeyB0eXBlIEZvcm1FdmVudEhhbmRsZXIsIHVzZUVmZmVjdCwgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEJhc2VQcm9wZXJ0eUNvbXBvbmVudCwgdXNlRmlsdGVyRHJhd2VyLCB1c2VRdWVyeVBhcmFtcywgdXNlVHJhbnNsYXRpb24gfSBmcm9tICdhZG1pbmpzJztcblxuZXhwb3J0IHR5cGUgRmlsdGVyUHJvcHMgPSB7XG5cdHJlc291cmNlOiB7IGlkOiBzdHJpbmc7IGZpbHRlclByb3BlcnRpZXM6IEFycmF5PHsgcHJvcGVydHlQYXRoOiBzdHJpbmcgfT4gfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEZpbHRlckRyYXdlcihwcm9wczogRmlsdGVyUHJvcHMpIHtcblx0Y29uc3QgeyByZXNvdXJjZSB9ID0gcHJvcHM7XG5cdGNvbnN0IHByb3BlcnRpZXMgPSByZXNvdXJjZS5maWx0ZXJQcm9wZXJ0aWVzO1xuXG5cdGNvbnN0IFtmaWx0ZXIsIHNldEZpbHRlcl0gPSB1c2VTdGF0ZTxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4oe30pO1xuXHRjb25zdCB7IHRyYW5zbGF0ZUJ1dHRvbiwgdHJhbnNsYXRlTGFiZWwgfSA9IHVzZVRyYW5zbGF0aW9uKCk7XG5cdGNvbnN0IGluaXRpYWxMb2FkID0gdXNlUmVmKHRydWUpO1xuXHRjb25zdCB7IGlzVmlzaWJsZSwgdG9nZ2xlRmlsdGVyIH0gPSB1c2VGaWx0ZXJEcmF3ZXIoKTtcblx0Y29uc3QgeyBzdG9yZVBhcmFtcywgY2xlYXJQYXJhbXMsIGZpbHRlcnMgfSA9IHVzZVF1ZXJ5UGFyYW1zKCk7XG5cblx0dXNlRWZmZWN0KCgpID0+IHtcblx0XHRpZiAoaW5pdGlhbExvYWQuY3VycmVudCkge1xuXHRcdFx0aW5pdGlhbExvYWQuY3VycmVudCA9IGZhbHNlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzZXRGaWx0ZXIoe30pO1xuXHRcdH1cblx0fSwgW3Jlc291cmNlLmlkXSk7XG5cblx0Y29uc3QgaGFuZGxlU3VibWl0OiBGb3JtRXZlbnRIYW5kbGVyPEhUTUxFbGVtZW50PiA9IChldmVudCkgPT4ge1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0c3RvcmVQYXJhbXMoeyBmaWx0ZXJzOiBwaWNrQnkoZmlsdGVyLCAodikgPT4gIWlzTmlsKHYpKSwgcGFnZTogJzEnIH0pO1xuXHR9O1xuXG5cdGNvbnN0IGhhbmRsZVJlc2V0OiBGb3JtRXZlbnRIYW5kbGVyPEhUTUxFbGVtZW50PiA9IChldmVudCkgPT4ge1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0Y2xlYXJQYXJhbXMoJ2ZpbHRlcnMnKTtcblx0XHRzZXRGaWx0ZXIoe30pO1xuXHR9O1xuXG5cdHVzZUVmZmVjdCgoKSA9PiB7XG5cdFx0aWYgKGZpbHRlcnMpIHtcblx0XHRcdHNldEZpbHRlcihmaWx0ZXJzKTtcblx0XHR9XG5cdH0sIFtmaWx0ZXJzXSk7XG5cblx0Y29uc3QgaGFuZGxlQ2hhbmdlID0gKHByb3BlcnR5T3JSZWNvcmQ6IHN0cmluZyB8IHsgcGFyYW1zPzogdW5rbm93biB9LCB2YWx1ZTogYW55KTogdm9pZCA9PiB7XG5cdFx0aWYgKHR5cGVvZiBwcm9wZXJ0eU9yUmVjb3JkICE9PSAnc3RyaW5nJykge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCd5b3UgY2FuIG5vdCBwYXNzIFJlY29yZEpTT04gdG8gZmlsdGVycycpO1xuXHRcdH1cblx0XHRzZXRGaWx0ZXIoe1xuXHRcdFx0Li4uZmlsdGVyLFxuXHRcdFx0W3Byb3BlcnR5T3JSZWNvcmRdOiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmICF2YWx1ZS5sZW5ndGggPyB1bmRlZmluZWQgOiB2YWx1ZSxcblx0XHR9KTtcblx0fTtcblxuXHRjb25zdCBnZXRSZXNvdXJjZUVsZW1lbnRDc3MgPSAocmVzb3VyY2VJZDogc3RyaW5nLCBzdWZmaXg6IHN0cmluZykgPT4gYCR7cmVzb3VyY2VJZH0tJHtzdWZmaXh9YDtcblx0Y29uc3QgY29udGVudFRhZyA9IGdldFJlc291cmNlRWxlbWVudENzcyhyZXNvdXJjZS5pZCwgJ2ZpbHRlci1kcmF3ZXInKTtcblx0Y29uc3QgY3NzQ29udGVudCA9IGdldFJlc291cmNlRWxlbWVudENzcyhyZXNvdXJjZS5pZCwgJ2ZpbHRlci1kcmF3ZXItY29udGVudCcpO1xuXHRjb25zdCBjc3NGb290ZXIgPSBnZXRSZXNvdXJjZUVsZW1lbnRDc3MocmVzb3VyY2UuaWQsICdmaWx0ZXItZHJhd2VyLWZvb3RlcicpO1xuXHRjb25zdCBjc3NCdXR0b25BcHBseSA9IGdldFJlc291cmNlRWxlbWVudENzcyhyZXNvdXJjZS5pZCwgJ2ZpbHRlci1kcmF3ZXItYnV0dG9uLWFwcGx5Jyk7XG5cdGNvbnN0IGNzc0J1dHRvblJlc2V0ID0gZ2V0UmVzb3VyY2VFbGVtZW50Q3NzKHJlc291cmNlLmlkLCAnZmlsdGVyLWRyYXdlci1idXR0b24tcmVzZXQnKTtcblxuXHRyZXR1cm4gKFxuXHRcdDw+XG5cdFx0XHR7aXNWaXNpYmxlID8gKFxuXHRcdFx0XHQ8ZGl2XG5cdFx0XHRcdFx0Y2xhc3NOYW1lPSdhZG1pbi1maWx0ZXItb3ZlcmxheSdcblx0XHRcdFx0XHRvbkNsaWNrPXt0b2dnbGVGaWx0ZXJ9XG5cdFx0XHRcdFx0cm9sZT0nYnV0dG9uJ1xuXHRcdFx0XHRcdHRhYkluZGV4PXstMX1cblx0XHRcdFx0XHRhcmlhLWxhYmVsPSdDbG9zZSBmaWx0ZXJzJ1xuXHRcdFx0XHQvPlxuXHRcdFx0KSA6IG51bGx9XG5cdFx0XHQ8RHJhd2VyXG5cdFx0XHRcdHZhcmlhbnQ9J2ZpbHRlcidcblx0XHRcdFx0aXNIaWRkZW49eyFpc1Zpc2libGV9XG5cdFx0XHRcdGFzPSdmb3JtJ1xuXHRcdFx0XHRvblN1Ym1pdD17aGFuZGxlU3VibWl0fVxuXHRcdFx0XHRvblJlc2V0PXtoYW5kbGVSZXNldH1cblx0XHRcdFx0ZGF0YS1jc3M9e2NvbnRlbnRUYWd9XG5cdFx0XHQ+XG5cdFx0XHRcdDxEcmF3ZXJDb250ZW50IGRhdGEtY3NzPXtjc3NDb250ZW50fT5cblx0XHRcdFx0XHQ8Qm94IGZsZXgganVzdGlmeUNvbnRlbnQ9J3NwYWNlLWJldHdlZW4nPlxuXHRcdFx0XHRcdFx0PEgzPnt0cmFuc2xhdGVMYWJlbCgnZmlsdGVycycsIHJlc291cmNlLmlkKX08L0gzPlxuXHRcdFx0XHRcdFx0PEJ1dHRvblxuXHRcdFx0XHRcdFx0XHR0eXBlPSdidXR0b24nXG5cdFx0XHRcdFx0XHRcdHZhcmlhbnQ9J2xpZ2h0J1xuXHRcdFx0XHRcdFx0XHRzaXplPSdpY29uJ1xuXHRcdFx0XHRcdFx0XHRyb3VuZGVkXG5cdFx0XHRcdFx0XHRcdGNvbG9yPSd0ZXh0J1xuXHRcdFx0XHRcdFx0XHRvbkNsaWNrPXt0b2dnbGVGaWx0ZXJ9XG5cdFx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHRcdDxJY29uIGljb249J1gnIC8+XG5cdFx0XHRcdFx0XHQ8L0J1dHRvbj5cblx0XHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0XHQ8Qm94IG15PSd4Myc+XG5cdFx0XHRcdFx0XHR7cHJvcGVydGllcy5tYXAoKHByb3BlcnR5KSA9PiAoXG5cdFx0XHRcdFx0XHRcdDxCYXNlUHJvcGVydHlDb21wb25lbnRcblx0XHRcdFx0XHRcdFx0XHRrZXk9e3Byb3BlcnR5LnByb3BlcnR5UGF0aH1cblx0XHRcdFx0XHRcdFx0XHR3aGVyZT0nZmlsdGVyJ1xuXHRcdFx0XHRcdFx0XHRcdG9uQ2hhbmdlPXtoYW5kbGVDaGFuZ2V9XG5cdFx0XHRcdFx0XHRcdFx0cHJvcGVydHk9e3Byb3BlcnR5IGFzIGFueX1cblx0XHRcdFx0XHRcdFx0XHRmaWx0ZXI9e2ZpbHRlcn1cblx0XHRcdFx0XHRcdFx0XHRyZXNvdXJjZT17cmVzb3VyY2UgYXMgYW55fVxuXHRcdFx0XHRcdFx0XHQvPlxuXHRcdFx0XHRcdFx0KSl9XG5cdFx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdDwvRHJhd2VyQ29udGVudD5cblx0XHRcdFx0PERyYXdlckZvb3RlciBkYXRhLWNzcz17Y3NzRm9vdGVyfT5cblx0XHRcdFx0XHQ8QnV0dG9uIHR5cGU9J2J1dHRvbicgdmFyaWFudD0nbGlnaHQnIG9uQ2xpY2s9e2hhbmRsZVJlc2V0fSBkYXRhLWNzcz17Y3NzQnV0dG9uUmVzZXR9PlxuXHRcdFx0XHRcdFx0e3RyYW5zbGF0ZUJ1dHRvbigncmVzZXRGaWx0ZXInLCByZXNvdXJjZS5pZCl9XG5cdFx0XHRcdFx0PC9CdXR0b24+XG5cdFx0XHRcdFx0PEJ1dHRvbiB0eXBlPSdzdWJtaXQnIHZhcmlhbnQ9J2NvbnRhaW5lZCcgZGF0YS1jc3M9e2Nzc0J1dHRvbkFwcGx5fT5cblx0XHRcdFx0XHRcdHt0cmFuc2xhdGVCdXR0b24oJ2FwcGx5Q2hhbmdlcycsIHJlc291cmNlLmlkKX1cblx0XHRcdFx0XHQ8L0J1dHRvbj5cblx0XHRcdFx0PC9EcmF3ZXJGb290ZXI+XG5cdFx0XHQ8L0RyYXdlcj5cblx0XHQ8Lz5cblx0KTtcbn1cbiIsIkFkbWluSlMuVXNlckNvbXBvbmVudHMgPSB7fVxuaW1wb3J0IE9yZGVyU3RhdHVzQWN0aW9uIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL09yZGVyU3RhdHVzQWN0aW9uJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5PcmRlclN0YXR1c0FjdGlvbiA9IE9yZGVyU3RhdHVzQWN0aW9uXG5pbXBvcnQgQ2FuY2VsT3JkZXJBY3Rpb24gZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvQ2FuY2VsT3JkZXJBY3Rpb24nXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkNhbmNlbE9yZGVyQWN0aW9uID0gQ2FuY2VsT3JkZXJBY3Rpb25cbmltcG9ydCBPcmRlckF1ZGl0VGltZWxpbmVBY3Rpb24gZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvT3JkZXJBdWRpdFRpbWVsaW5lQWN0aW9uJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5PcmRlckF1ZGl0VGltZWxpbmVBY3Rpb24gPSBPcmRlckF1ZGl0VGltZWxpbmVBY3Rpb25cbmltcG9ydCBPcmRlclNob3cgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvT3JkZXJTaG93J1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5PcmRlclNob3cgPSBPcmRlclNob3dcbmltcG9ydCBPcmRlckZ1bGZpbGxtZW50QWN0aW9uIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL09yZGVyRnVsZmlsbG1lbnRBY3Rpb24nXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLk9yZGVyRnVsZmlsbG1lbnRBY3Rpb24gPSBPcmRlckZ1bGZpbGxtZW50QWN0aW9uXG5pbXBvcnQgT3JkZXJQYWNraW5nU2xpcEFjdGlvbiBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9PcmRlclBhY2tpbmdTbGlwQWN0aW9uJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5PcmRlclBhY2tpbmdTbGlwQWN0aW9uID0gT3JkZXJQYWNraW5nU2xpcEFjdGlvblxuaW1wb3J0IE9yZGVyVG90YWxMaXN0IGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL09yZGVyVG90YWxMaXN0J1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5PcmRlclRvdGFsTGlzdCA9IE9yZGVyVG90YWxMaXN0XG5pbXBvcnQgT3JkZXJUb3RhbFJhbmdlRmlsdGVyIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL09yZGVyVG90YWxSYW5nZUZpbHRlcidcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuT3JkZXJUb3RhbFJhbmdlRmlsdGVyID0gT3JkZXJUb3RhbFJhbmdlRmlsdGVyXG5pbXBvcnQgU2VsZWN0RmlsdGVyV2l0aFBsYWNlaG9sZGVyIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL1NlbGVjdEZpbHRlcldpdGhQbGFjZWhvbGRlcidcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuU2VsZWN0RmlsdGVyV2l0aFBsYWNlaG9sZGVyID0gU2VsZWN0RmlsdGVyV2l0aFBsYWNlaG9sZGVyXG5pbXBvcnQgVXNlclNob3cgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvVXNlclNob3cnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlVzZXJTaG93ID0gVXNlclNob3dcbmltcG9ydCBVc2VyU2VnbWVudHMgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvVXNlclNlZ21lbnRzJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5Vc2VyU2VnbWVudHMgPSBVc2VyU2VnbWVudHNcbmltcG9ydCBQcm9kdWN0U2NoZWR1bGVEaXNjb3VudEFjdGlvbiBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9Qcm9kdWN0U2NoZWR1bGVEaXNjb3VudEFjdGlvbidcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuUHJvZHVjdFNjaGVkdWxlRGlzY291bnRBY3Rpb24gPSBQcm9kdWN0U2NoZWR1bGVEaXNjb3VudEFjdGlvblxuaW1wb3J0IFByb2R1Y3ROYW1lTGlzdCBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9Qcm9kdWN0TmFtZUxpc3QnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlByb2R1Y3ROYW1lTGlzdCA9IFByb2R1Y3ROYW1lTGlzdFxuaW1wb3J0IFByb2R1Y3RMaXN0IGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL1Byb2R1Y3RMaXN0J1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5Qcm9kdWN0TGlzdCA9IFByb2R1Y3RMaXN0XG5pbXBvcnQgUHJvZHVjdFNob3cgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvUHJvZHVjdFNob3cnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlByb2R1Y3RTaG93ID0gUHJvZHVjdFNob3dcbmltcG9ydCBQcm9kdWN0QnVsa1NldENhdGVnb3J5QWN0aW9uIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL1Byb2R1Y3RCdWxrU2V0Q2F0ZWdvcnlBY3Rpb24nXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlByb2R1Y3RCdWxrU2V0Q2F0ZWdvcnlBY3Rpb24gPSBQcm9kdWN0QnVsa1NldENhdGVnb3J5QWN0aW9uXG5pbXBvcnQgUHJvZHVjdEJ1bGtTZXRCcmFuZEFjdGlvbiBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9Qcm9kdWN0QnVsa1NldEJyYW5kQWN0aW9uJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5Qcm9kdWN0QnVsa1NldEJyYW5kQWN0aW9uID0gUHJvZHVjdEJ1bGtTZXRCcmFuZEFjdGlvblxuaW1wb3J0IFByb2R1Y3RCdWxrRWRpdFRhZ3NBY3Rpb24gZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvUHJvZHVjdEJ1bGtFZGl0VGFnc0FjdGlvbidcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuUHJvZHVjdEJ1bGtFZGl0VGFnc0FjdGlvbiA9IFByb2R1Y3RCdWxrRWRpdFRhZ3NBY3Rpb25cbmltcG9ydCBQcm9kdWN0QnVsa0FkanVzdFByaWNlQWN0aW9uIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL1Byb2R1Y3RCdWxrQWRqdXN0UHJpY2VBY3Rpb24nXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlByb2R1Y3RCdWxrQWRqdXN0UHJpY2VBY3Rpb24gPSBQcm9kdWN0QnVsa0FkanVzdFByaWNlQWN0aW9uXG5pbXBvcnQgUHJvZHVjdEJ1bGtUb2dnbGVJblN0b2NrQWN0aW9uIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL1Byb2R1Y3RCdWxrVG9nZ2xlSW5TdG9ja0FjdGlvbidcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuUHJvZHVjdEJ1bGtUb2dnbGVJblN0b2NrQWN0aW9uID0gUHJvZHVjdEJ1bGtUb2dnbGVJblN0b2NrQWN0aW9uXG5pbXBvcnQgRGFzaGJvYXJkIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL0Rhc2hib2FyZCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuRGFzaGJvYXJkID0gRGFzaGJvYXJkXG5pbXBvcnQgTG9naW4gZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvTG9naW4nXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkxvZ2luID0gTG9naW5cbmltcG9ydCBMb2dnZWRJbiBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9Mb2dnZWRJbidcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuTG9nZ2VkSW4gPSBMb2dnZWRJblxuaW1wb3J0IFRvcEJhciBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9Ub3BCYXInXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlRvcEJhciA9IFRvcEJhclxuaW1wb3J0IEZpbHRlckRyYXdlciBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9GaWx0ZXJEcmF3ZXInXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkZpbHRlckRyYXdlciA9IEZpbHRlckRyYXdlciJdLCJuYW1lcyI6WyJhcGkiLCJBcGlDbGllbnQiLCJzdGF0dXNlcyIsIk9yZGVyU3RhdHVzQWN0aW9uIiwiYWN0aW9uIiwicmVjb3JkIiwicmVzb3VyY2UiLCJsb2NhbFJlY29yZCIsInNldExvY2FsUmVjb3JkIiwidXNlU3RhdGUiLCJzZWxlY3RlZFN0YXR1cyIsInNldFNlbGVjdGVkU3RhdHVzIiwicGFyYW1zIiwic3RhdHVzIiwibG9hZGluZyIsInNldExvYWRpbmciLCJhZGROb3RpY2UiLCJ1c2VOb3RpY2UiLCJ0cmFuc2xhdGVBY3Rpb24iLCJ0cmFuc2xhdGVMYWJlbCIsInRyYW5zbGF0ZU1lc3NhZ2UiLCJ1c2VUcmFuc2xhdGlvbiIsIlJlYWN0IiwiY3JlYXRlRWxlbWVudCIsIkJveCIsInZhcmlhbnQiLCJwIiwiVGV4dCIsImN1cnJlbnRTdGF0dXMiLCJzdGF0dXNPcHRpb25zIiwidXNlTWVtbyIsIm1hcCIsInZhbHVlIiwibGFiZWwiLCJpZCIsImN1cnJlbnRMYWJlbCIsInNlbGVjdGVkT3B0aW9uIiwiZmluZCIsIm9wdGlvbiIsIm5leHRMYWJlbCIsImhhbmRsZUNsaWNrIiwiZm9ybURhdGEiLCJGb3JtRGF0YSIsImFwcGVuZCIsInJlc3BvbnNlIiwicmVjb3JkQWN0aW9uIiwicmVzb3VyY2VJZCIsInJlY29yZElkIiwiYWN0aW9uTmFtZSIsIm5hbWUiLCJtZXRob2QiLCJkYXRhIiwibm90aWNlIiwidHlwZSIsIm1lc3NhZ2UiLCJvcHRpb25zIiwiYnV0dG9uTGFiZWwiLCJ0aXRsZSIsImJvcmRlclJhZGl1cyIsImJveFNoYWRvdyIsIm1heFdpZHRoIiwic3R5bGUiLCJib3JkZXIiLCJkaXNwbGF5IiwiYWxpZ25JdGVtcyIsImp1c3RpZnlDb250ZW50IiwibWIiLCJmb250U2l6ZSIsImZvbnRXZWlnaHQiLCJmbGV4RGlyZWN0aW9uIiwiZ2FwIiwibXIiLCJCYWRnZSIsIm91dGxpbmUiLCJiYWNrZ3JvdW5kIiwiYm9yZGVyQ29sb3IiLCJjb2xvciIsIkZvcm1Hcm91cCIsIlNlbGVjdCIsImlzQ2xlYXJhYmxlIiwib25DaGFuZ2UiLCJCdXR0b24iLCJvbkNsaWNrIiwiZGlzYWJsZWQiLCJDYW5jZWxPcmRlckFjdGlvbiIsInJlZnVuZFBheW1lbnQiLCJzZXRSZWZ1bmRQYXltZW50Iiwic3RyaXBlU2Vzc2lvbklkIiwiY2FuUmVmdW5kIiwiQm9vbGVhbiIsImhhbmRsZUNhbmNlbCIsImFzIiwiY3Vyc29yIiwiY2hlY2tlZCIsImV2ZW50IiwidGFyZ2V0Iiwid2lkdGgiLCJoZWlnaHQiLCJleHRyYWN0RW50cmllcyIsInBheWxvYWQiLCJlbnRyaWVzIiwiQXJyYXkiLCJpc0FycmF5IiwiT3JkZXJBdWRpdFRpbWVsaW5lQWN0aW9uIiwic2V0RW50cmllcyIsIm5vdGUiLCJzZXROb3RlIiwic2F2aW5nIiwic2V0U2F2aW5nIiwiYWRkTm90aWNlUmVmIiwidXNlUmVmIiwidXNlRWZmZWN0IiwiY3VycmVudCIsImlzQWN0aXZlIiwidGhlbiIsInBheWxvYWRFbnRyaWVzIiwiY2F0Y2giLCJmaW5hbGx5IiwiZm9ybWF0VGltZXN0YW1wIiwicGFyc2VkIiwiRGF0ZSIsInBhcnNlIiwiTnVtYmVyIiwiaXNOYU4iLCJ0b0xvY2FsZVN0cmluZyIsImhhbmRsZVN1Ym1pdCIsInRyaW1tZWQiLCJ0cmltIiwiTGFiZWwiLCJodG1sRm9yIiwicGxhY2Vob2xkZXIiLCJyb3dzIiwicmVzaXplIiwicGFkZGluZyIsIm1hcmdpblRvcCIsImxlbmd0aCIsImVudHJ5IiwiYWRtaW5MYWJlbCIsImFkbWluRW1haWwiLCJ0aW1lc3RhbXAiLCJjcmVhdGVkQXQiLCJmcm9tTGFiZWwiLCJmcm9tU3RhdHVzIiwidG9MYWJlbCIsInRvU3RhdHVzIiwia2V5IiwiZnJvbSIsInRvIiwiSWNvbiIsImljb24iLCJzaXplIiwibXQiLCJmb3JtYXRNb25leSIsImN1cnJlbmN5IiwiSW50bCIsIk51bWJlckZvcm1hdCIsInVuZGVmaW5lZCIsIm1pbmltdW1GcmFjdGlvbkRpZ2l0cyIsIm1heGltdW1GcmFjdGlvbkRpZ2l0cyIsImZvcm1hdCIsInRvRml4ZWQiLCJPcmRlclNob3ciLCJwcm9wcyIsInNldFBheWxvYWQiLCJzdGF0dXNWYXJpYW50IiwicGF5bWVudFN0YXR1cyIsInBheW1lbnRTdGF0dXNMYWJlbCIsImNsYXNzTmFtZSIsImdyaWRUZW1wbGF0ZUNvbHVtbnMiLCJzdWJ0b3RhbCIsImRpc2NvdW50cyIsInNoaXBwaW5nIiwidG90YWwiLCJPcmlnaW5hbFNob3ciLCJleHRyYWN0UGF5bG9hZCIsImNhcnJpZXIiLCJ0cmFja2luZ051bWJlciIsIm1heWJlIiwiT3JkZXJGdWxmaWxsbWVudEFjdGlvbiIsInNldENhcnJpZXIiLCJzZXRUcmFja2luZ051bWJlciIsImxvYWQiLCJ1c2VDYWxsYmFjayIsImhhbmRsZVNhdmUiLCJJbnB1dCIsImUiLCJub3JtYWxpemVGdWxsTmFtZSIsImZpcnN0IiwibGFzdCIsImZpcnN0VHJpbW1lZCIsImxhc3RUcmltbWVkIiwiZmlyc3RMb3dlciIsInRvTG9jYWxlTG93ZXJDYXNlIiwibGFzdExvd2VyIiwiaW5jbHVkZXMiLCJPcmRlclBhY2tpbmdTbGlwQWN0aW9uIiwiY3VzdG9tZXIiLCJjb250YWN0TmFtZSIsImNvbnRhY3RMYXN0TmFtZSIsIndpbmRvdyIsInByaW50Iiwib3JkZXJJZCIsImNvbnRhY3RQaG9uZSIsImNvbnRhY3RFbWFpbCIsIlRhYmxlIiwiVGFibGVIZWFkIiwiVGFibGVSb3ciLCJUYWJsZUNlbGwiLCJUYWJsZUJvZHkiLCJpdGVtcyIsIml0ZW0iLCJpbmRleCIsInF1YW50aXR5IiwidW5pdFByaWNlIiwicHJpY2UiLCJtaW5XaWR0aCIsIk9yZGVyVG90YWxMaXN0IiwicHJvcGVydHkiLCJyYXciLCJwYXRoIiwibnVtZXJpYyIsImlzRmluaXRlIiwiU3RyaW5nIiwicGFyc2VOdW1iZXIiLCJub3JtYWxpemVkIiwiYnVpbGRGaWx0ZXJKc29uIiwibWluIiwibWF4IiwibWluVmFsdWUiLCJtYXhWYWx1ZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJndGUiLCJsdGUiLCJPcmRlclRvdGFsUmFuZ2VGaWx0ZXIiLCJmaWx0ZXIiLCJ0cmFuc2xhdGVQcm9wZXJ0eSIsImZpbHRlclZhbHVlIiwic2V0TWluIiwic2V0TWF4Iiwib2JqIiwiaW5wdXRNb2RlIiwibmV4dCIsIlNlbGVjdEZpbHRlcldpdGhQbGFjZWhvbGRlciIsInRsIiwiYXZhaWxhYmxlVmFsdWVzIiwiZGVmYXVsdFZhbHVlIiwiY3VycmVudFZhbHVlIiwic2VsZWN0ZWQiLCJmb3JtYXREYXRlIiwiZ2V0Um9vdFBhdGgiLCJsb2NhdGlvbiIsInBhdGhuYW1lIiwicGFydHMiLCJzcGxpdCIsImJ1aWxkUmVjb3JkU2hvd0hyZWYiLCJVc2VyU2hvdyIsInJlbGF0ZWQiLCJzZXRSZWxhdGVkIiwicmVsYXRlZExvYWRpbmciLCJzZXRSZWxhdGVkTG9hZGluZyIsImFkbWluU3RhdHVzIiwic2V0QWRtaW5TdGF0dXMiLCJhZG1pbk5vdGVzIiwic2V0QWRtaW5Ob3RlcyIsInNhdmluZ01ldGEiLCJzZXRTYXZpbmdNZXRhIiwibmV4dFN0YXR1cyIsIm5leHROb3RlcyIsInNlbGVjdGVkU3RhdHVzT3B0aW9uIiwibGFzdE9yZGVyVGV4dCIsImxhc3RPcmRlckRhdGUiLCJzdGF0dXNCYWRnZVN0eWxlIiwiaXNEaXJ0eSIsImJhc2VTdGF0dXMiLCJiYXNlTm90ZXMiLCJoYW5kbGVTYXZlTWV0YSIsImZsZXhXcmFwIiwidG90YWxPcmRlcnMiLCJsaWZldGltZVZhbHVlIiwiYXZlcmFnZU9yZGVyVmFsdWUiLCJvcmRlcnMiLCJvcmRlciIsImhyZWYiLCJyZXZpZXdzIiwicmV2aWV3IiwicHJvZHVjdElkIiwicHJvZHVjdE5hbWUiLCJyYXRpbmciLCJ3aGl0ZVNwYWNlIiwib3ZlcmZsb3ciLCJ0ZXh0T3ZlcmZsb3ciLCJjb21tZW50Iiwid2lzaGxpc3QiLCJyZWNlbnRseVZpZXdlZCIsImJ1aWxkVXNlclNob3dIcmVmIiwidXNlcklkIiwiYnVpbGRVc2VyTGlzdEhyZWYiLCJmaWx0ZXJzIiwicm9vdCIsIlVSTFNlYXJjaFBhcmFtcyIsIk9iamVjdCIsInNldCIsInRvU3RyaW5nIiwiVXNlcnNUYWJsZSIsInVzZXJzIiwic2hvd0xhc3RPcmRlciIsInNob3dMdHYiLCJ1c2VyIiwiZW1haWwiLCJsYXN0T3JkZXJBdCIsIlVzZXJTZWdtZW50cyIsInJlc291cmNlQWN0aW9uIiwicHJldmlld0xpbWl0VGV4dCIsImxpbWl0IiwiY29uZmlnIiwicHJldmlld0xpbWl0IiwiY291bnRzIiwic3Vic2NyaWJlZCIsImxpc3RzIiwidmVyaWZpZWQiLCJlbWFpbFZlcmlmaWVkIiwidW52ZXJpZmllZCIsImhpZ2hTcGVuZGVyTWluTHR2IiwiaGlnaFNwZW5kZXJzIiwiZGF5cyIsImluYWN0aXZlRGF5cyIsImluYWN0aXZlIiwidG9Mb2NhbElucHV0VmFsdWUiLCJkIiwicGFkIiwibiIsInBhZFN0YXJ0IiwiZ2V0RnVsbFllYXIiLCJnZXRNb250aCIsImdldERhdGUiLCJnZXRIb3VycyIsImdldE1pbnV0ZXMiLCJQcm9kdWN0U2NoZWR1bGVEaXNjb3VudEFjdGlvbiIsInByb2R1Y3RTbHVnIiwic2x1ZyIsInByb2R1Y3RTdGF0dXMiLCJiYXNlUHJpY2UiLCJpbml0aWFsRGlzY291bnRQcmljZSIsImRpc2NvdW50UHJpY2UiLCJpbml0aWFsU3RhcnQiLCJkaXNjb3VudFN0YXJ0QXQiLCJpbml0aWFsRW5kIiwiZGlzY291bnRFbmRBdCIsInNldERpc2NvdW50UHJpY2UiLCJzZXREaXNjb3VudFN0YXJ0QXQiLCJzZXREaXNjb3VudEVuZEF0IiwiY2xpZW50VmFsaWRhdGlvbkVycm9yIiwiaGFzV2luZG93Iiwic3RhcnQiLCJlbmQiLCJnZXRUaW1lIiwiY3VycmVudFN1bW1hcnkiLCJkcCIsInRvSVNPU3RyaW5nIiwic3RlcCIsIlByb2R1Y3ROYW1lTGlzdCIsImltYWdlVXJsIiwiZmxleFNocmluayIsInNyYyIsImFsdCIsIm9iamVjdEZpdCIsImFjdGlvbkJ1dHRvblN0eWxlIiwiYnVpbGRMaXN0SHJlZiIsInF1ZXJ5IiwiZGF5c0Fnb0lzbyIsIm5vdyIsIlByb2R1Y3RMaXN0Iiwidmlld3MiLCJpblN0b2NrIiwic3RvY2siLCJub3QiLCJlcXVhbHMiLCJ1cGRhdGVkQXQiLCJ2aWV3IiwiT3JpZ2luYWxMaXN0IiwiUHJvZHVjdFNob3ciLCJpc09wZW4iLCJzZXRJc09wZW4iLCJvcGVuSW1hZ2UiLCJzdG9wUHJvcGFnYXRpb24iLCJNb2RhbCIsIm9uQ2xvc2UiLCJvbk92ZXJsYXlDbGljayIsInBhZGRpbmdUb3AiLCJtYXhIZWlnaHQiLCJhbGwiLCJyZXNvbHZlUmVjb3JkSWRzIiwicmVjb3JkcyIsImZyb21Qcm9wcyIsInIiLCJzZWFyY2giLCJnZXQiLCJQcm9kdWN0QnVsa1NldENhdGVnb3J5QWN0aW9uIiwicmVjb3JkSWRzIiwic2V0T3B0aW9ucyIsImNhdGVnb3J5SWQiLCJzZXRDYXRlZ29yeUlkIiwiYnVsa0FjdGlvbiIsInJlcyIsImhhc09wdGlvbnMiLCJjYW5TYXZlIiwiY291bnQiLCJvIiwiUHJvZHVjdEJ1bGtTZXRCcmFuZEFjdGlvbiIsImJyYW5kSWQiLCJzZXRCcmFuZElkIiwiUHJvZHVjdEJ1bGtFZGl0VGFnc0FjdGlvbiIsIm1vZGUiLCJzZXRNb2RlIiwidGFncyIsInNldFRhZ3MiLCJQcm9kdWN0QnVsa0FkanVzdFByaWNlQWN0aW9uIiwiZGlyZWN0aW9uIiwic2V0RGlyZWN0aW9uIiwia2luZCIsInNldEtpbmQiLCJzZXRWYWx1ZSIsImFwcGx5VG9EaXNjb3VudCIsInNldEFwcGx5VG9EaXNjb3VudCIsInBhcnNlZFZhbHVlIiwiUHJvZHVjdEJ1bGtUb2dnbGVJblN0b2NrQWN0aW9uIiwicXVpY2tBY3Rpb25zIiwicmVzb2x2ZVBhdGgiLCJnbG9iYWxBbnkiLCJyb290UGF0aCIsIlJFRFVYX1NUQVRFIiwicGF0aHMiLCJub3JtYWxpemVkUm9vdCIsInJlcGxhY2UiLCJub3JtYWxpemVkUGF0aCIsImdvVG8iLCJhc3NpZ24iLCJEYXNoYm9hcmQiLCJIMiIsIklsbHVzdHJhdGlvbiIsIkg0IiwiSDUiLCJsYWJlbFN0eWxlIiwiZ2V0TWVzc2FnZVRleHQiLCJMb2dpbiIsIndpbmRvd1N0YXRlIiwiX19BUFBfU1RBVEVfXyIsImVycm9yTWVzc2FnZSIsImJyYW5kaW5nIiwidHJhbnNsYXRlQ29tcG9uZW50Iiwic2V0RW1haWwiLCJwYXNzd29yZCIsInNldFBhc3N3b3JkIiwiaGFuZGxlRW1haWxDaGFuZ2UiLCJoYW5kbGVQYXNzd29yZENoYW5nZSIsImZsZXgiLCJtaW5IZWlnaHQiLCJtYXJnaW5Cb3R0b20iLCJsb2dvIiwiY29tcGFueU5hbWUiLCJNZXNzYWdlQm94IiwibXkiLCJyZXF1aXJlZCIsImF1dG9Db21wbGV0ZSIsIkxvZ2dlZEluIiwic2Vzc2lvbiIsInRyYW5zbGF0ZUJ1dHRvbiIsImRyb3BBY3Rpb25zIiwicHJldmVudERlZmF1bHQiLCJsb2dvdXRQYXRoIiwiQ3VycmVudFVzZXJOYXYiLCJhdmF0YXJVcmwiLCJWZXJzaW9uIiwidmVyc2lvbnMiLCJhZG1pbiIsImFwcCIsImZsZXhHcm93IiwicHkiLCJweCIsInZlcnNpb24iLCJMYW5ndWFnZVNlbGVjdCIsImkxOG4iLCJzdXBwb3J0ZWRMbmdzUmF3Iiwic3VwcG9ydGVkTG5ncyIsImF2YWlsYWJsZUxhbmd1YWdlcyIsImxhbmciLCJEcm9wRG93biIsIkRyb3BEb3duVHJpZ2dlciIsImxhbmd1YWdlIiwiRHJvcERvd25NZW51IiwiRHJvcERvd25JdGVtIiwiY2hhbmdlTGFuZ3VhZ2UiLCJUb3BCYXIiLCJ0b2dnbGVTaWRlYmFyIiwicmVkdXhTdGF0ZSIsImhvbWVMYWJlbCIsImJvcmRlckJvdHRvbSIsImFycmF5TWFwIiwibGlzdENhY2hlQ2xlYXIiLCJlcSIsInJlcXVpcmUkJDAiLCJhc3NvY0luZGV4T2YiLCJsaXN0Q2FjaGVEZWxldGUiLCJsaXN0Q2FjaGVHZXQiLCJsaXN0Q2FjaGVIYXMiLCJsaXN0Q2FjaGVTZXQiLCJyZXF1aXJlJCQxIiwicmVxdWlyZSQkMiIsInJlcXVpcmUkJDMiLCJyZXF1aXJlJCQ0IiwiTGlzdENhY2hlIiwic3RhY2tDbGVhciIsInN0YWNrRGVsZXRlIiwic3RhY2tHZXQiLCJzdGFja0hhcyIsImZyZWVHbG9iYWwiLCJnbG9iYWwiLCJTeW1ib2wiLCJvYmplY3RQcm90byIsImhhc093blByb3BlcnR5IiwibmF0aXZlT2JqZWN0VG9TdHJpbmciLCJzeW1Ub1N0cmluZ1RhZyIsImdldFJhd1RhZyIsIm9iamVjdFRvU3RyaW5nIiwiYmFzZUdldFRhZyIsImlzT2JqZWN0IiwiZnVuY1RhZyIsImlzRnVuY3Rpb24iLCJjb3JlSnNEYXRhIiwiaXNNYXNrZWQiLCJmdW5jUHJvdG8iLCJmdW5jVG9TdHJpbmciLCJ0b1NvdXJjZSIsImJhc2VJc05hdGl2ZSIsImdldFZhbHVlIiwiZ2V0TmF0aXZlIiwiTWFwIiwibmF0aXZlQ3JlYXRlIiwiaGFzaENsZWFyIiwiaGFzaERlbGV0ZSIsIkhBU0hfVU5ERUZJTkVEIiwiaGFzaEdldCIsImhhc2hIYXMiLCJoYXNoU2V0IiwiSGFzaCIsIm1hcENhY2hlQ2xlYXIiLCJpc0tleWFibGUiLCJnZXRNYXBEYXRhIiwibWFwQ2FjaGVEZWxldGUiLCJtYXBDYWNoZUdldCIsIm1hcENhY2hlSGFzIiwibWFwQ2FjaGVTZXQiLCJNYXBDYWNoZSIsInN0YWNrU2V0IiwicmVxdWlyZSQkNSIsIlN0YWNrIiwic2V0Q2FjaGVBZGQiLCJzZXRDYWNoZUhhcyIsIlNldENhY2hlIiwiYXJyYXlTb21lIiwiY2FjaGVIYXMiLCJDT01QQVJFX1BBUlRJQUxfRkxBRyIsIkNPTVBBUkVfVU5PUkRFUkVEX0ZMQUciLCJlcXVhbEFycmF5cyIsIlVpbnQ4QXJyYXkiLCJtYXBUb0FycmF5Iiwic2V0VG9BcnJheSIsImJvb2xUYWciLCJkYXRlVGFnIiwiZXJyb3JUYWciLCJtYXBUYWciLCJudW1iZXJUYWciLCJyZWdleHBUYWciLCJzZXRUYWciLCJzdHJpbmdUYWciLCJzeW1ib2xUYWciLCJhcnJheUJ1ZmZlclRhZyIsImRhdGFWaWV3VGFnIiwic3ltYm9sUHJvdG8iLCJlcXVhbEJ5VGFnIiwiYXJyYXlQdXNoIiwiYmFzZUdldEFsbEtleXMiLCJhcnJheUZpbHRlciIsInN0dWJBcnJheSIsInByb3BlcnR5SXNFbnVtZXJhYmxlIiwibmF0aXZlR2V0U3ltYm9scyIsImdldFN5bWJvbHMiLCJiYXNlVGltZXMiLCJpc09iamVjdExpa2UiLCJhcmdzVGFnIiwiYmFzZUlzQXJndW1lbnRzIiwiaXNBcmd1bWVudHMiLCJleHBvcnRzIiwiTUFYX1NBRkVfSU5URUdFUiIsImlzSW5kZXgiLCJpc0xlbmd0aCIsImFycmF5VGFnIiwib2JqZWN0VGFnIiwid2Vha01hcFRhZyIsImJhc2VJc1R5cGVkQXJyYXkiLCJiYXNlVW5hcnkiLCJpc1R5cGVkQXJyYXkiLCJpc0J1ZmZlciIsImFycmF5TGlrZUtleXMiLCJpc1Byb3RvdHlwZSIsIm92ZXJBcmciLCJuYXRpdmVLZXlzIiwiYmFzZUtleXMiLCJpc0FycmF5TGlrZSIsImtleXMiLCJnZXRBbGxLZXlzIiwiZXF1YWxPYmplY3RzIiwiRGF0YVZpZXciLCJQcm9taXNlIiwiU2V0IiwiV2Vha01hcCIsInJlcXVpcmUkJDYiLCJnZXRUYWciLCJyZXF1aXJlJCQ3IiwiYmFzZUlzRXF1YWxEZWVwIiwiYmFzZUlzRXF1YWwiLCJiYXNlSXNNYXRjaCIsImlzU3RyaWN0Q29tcGFyYWJsZSIsImdldE1hdGNoRGF0YSIsIm1hdGNoZXNTdHJpY3RDb21wYXJhYmxlIiwiYmFzZU1hdGNoZXMiLCJpc1N5bWJvbCIsImlzS2V5IiwibWVtb2l6ZSIsIm1lbW9pemVDYXBwZWQiLCJzdHJpbmdUb1BhdGgiLCJiYXNlVG9TdHJpbmciLCJjYXN0UGF0aCIsInRvS2V5IiwiYmFzZUdldCIsImJhc2VIYXNJbiIsImhhc1BhdGgiLCJoYXNJbiIsImJhc2VNYXRjaGVzUHJvcGVydHkiLCJpZGVudGl0eSIsImJhc2VQcm9wZXJ0eSIsImJhc2VQcm9wZXJ0eURlZXAiLCJiYXNlSXRlcmF0ZWUiLCJkZWZpbmVQcm9wZXJ0eSIsImJhc2VBc3NpZ25WYWx1ZSIsImFzc2lnblZhbHVlIiwiYmFzZVNldCIsImJhc2VQaWNrQnkiLCJnZXRQcm90b3R5cGUiLCJnZXRTeW1ib2xzSW4iLCJuYXRpdmVLZXlzSW4iLCJiYXNlS2V5c0luIiwia2V5c0luIiwiZ2V0QWxsS2V5c0luIiwiRmlsdGVyRHJhd2VyIiwicHJvcGVydGllcyIsImZpbHRlclByb3BlcnRpZXMiLCJzZXRGaWx0ZXIiLCJpbml0aWFsTG9hZCIsImlzVmlzaWJsZSIsInRvZ2dsZUZpbHRlciIsInVzZUZpbHRlckRyYXdlciIsInN0b3JlUGFyYW1zIiwiY2xlYXJQYXJhbXMiLCJ1c2VRdWVyeVBhcmFtcyIsInBpY2tCeSIsInYiLCJpc05pbCIsInBhZ2UiLCJoYW5kbGVSZXNldCIsImhhbmRsZUNoYW5nZSIsInByb3BlcnR5T3JSZWNvcmQiLCJFcnJvciIsImdldFJlc291cmNlRWxlbWVudENzcyIsInN1ZmZpeCIsImNvbnRlbnRUYWciLCJjc3NDb250ZW50IiwiY3NzRm9vdGVyIiwiY3NzQnV0dG9uQXBwbHkiLCJjc3NCdXR0b25SZXNldCIsIkZyYWdtZW50Iiwicm9sZSIsInRhYkluZGV4IiwiRHJhd2VyIiwiaXNIaWRkZW4iLCJvblN1Ym1pdCIsIm9uUmVzZXQiLCJEcmF3ZXJDb250ZW50IiwiSDMiLCJyb3VuZGVkIiwiQmFzZVByb3BlcnR5Q29tcG9uZW50IiwicHJvcGVydHlQYXRoIiwid2hlcmUiLCJEcmF3ZXJGb290ZXIiLCJBZG1pbkpTIiwiVXNlckNvbXBvbmVudHMiXSwibWFwcGluZ3MiOiI7OztDQU9BLE1BQU1BLEtBQUcsR0FBRyxJQUFJQyxpQkFBUyxFQUFFO0NBRTNCLE1BQU1DLFFBQXVCLEdBQUcsQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDO0NBRXpFLFNBQVNDLGlCQUFpQkEsQ0FBQztHQUFFQyxNQUFNO0dBQUVDLE1BQU07Q0FBRUMsRUFBQUE7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R0EsMkJBQTJCO0NBRWhGb2MsT0FBTyxDQUFDQyxjQUFjLENBQUN4YixRQUFRLEdBQUdBLFFBQVE7Q0FFMUN1YixPQUFPLENBQUNDLGNBQWMsQ0FBQ2pZLFlBQVksR0FBR0EsWUFBWTtDQUVsRGdZLE9BQU8sQ0FBQ0MsY0FBYyxDQUFDdFcsNkJBQTZCLEdBQUdBLDZCQUE2QjtDQUVwRnFXLE9BQU8sQ0FBQ0MsY0FBYyxDQUFDL1UsZUFBZSxHQUFHQSxlQUFlO0NBRXhEOFUsT0FBTyxDQUFDQyxjQUFjLENBQUNwVSxXQUFXLEdBQUdBLFdBQVc7Q0FFaERtVSxPQUFPLENBQUNDLGNBQWMsQ0FBQzNULFdBQVcsR0FBR0EsV0FBVztDQUVoRDBULE9BQU8sQ0FBQ0MsY0FBYyxDQUFDMVMsNEJBQTRCLEdBQUdBLDRCQUE0QjtDQUVsRnlTLE9BQU8sQ0FBQ0MsY0FBYyxDQUFDL1IseUJBQXlCLEdBQUdBLHlCQUF5QjtDQUU1RThSLE9BQU8sQ0FBQ0MsY0FBYyxDQUFDNVIseUJBQXlCLEdBQUdBLHlCQUF5QjtDQUU1RTJSLE9BQU8sQ0FBQ0MsY0FBYyxDQUFDdlIsNEJBQTRCLEdBQUdBLDRCQUE0QjtDQUVsRnNSLE9BQU8sQ0FBQ0MsY0FBYyxDQUFDOVEsOEJBQThCLEdBQUdBLDhCQUE4QjtDQUV0RjZRLE9BQU8sQ0FBQ0MsY0FBYyxDQUFDbFEsU0FBUyxHQUFHQSxTQUFTO0NBRTVDaVEsT0FBTyxDQUFDQyxjQUFjLENBQUMzUCxLQUFLLEdBQUdBLEtBQUs7Q0FFcEMwUCxPQUFPLENBQUNDLGNBQWMsQ0FBQ3ZPLFFBQVEsR0FBR0EsUUFBUTtDQUUxQ3NPLE9BQU8sQ0FBQ0MsY0FBYyxDQUFDM00sTUFBTSxHQUFHQSxNQUFNO0NBRXRDME0sT0FBTyxDQUFDQyxjQUFjLENBQUN6QyxZQUFZLEdBQUdBLFlBQVk7Ozs7OzsiLCJ4X2dvb2dsZV9pZ25vcmVMaXN0IjpbMjQsMjUsMjYsMjcsMjgsMjksMzAsMzEsMzIsMzMsMzQsMzUsMzYsMzcsMzgsMzksNDAsNDEsNDIsNDMsNDQsNDUsNDYsNDcsNDgsNDksNTAsNTEsNTIsNTMsNTQsNTUsNTYsNTcsNTgsNTksNjAsNjEsNjIsNjMsNjQsNjUsNjYsNjcsNjgsNjksNzAsNzEsNzIsNzMsNzQsNzUsNzYsNzcsNzgsNzksODAsODEsODIsODMsODQsODUsODYsODcsODgsODksOTAsOTEsOTIsOTMsOTQsOTUsOTYsOTcsOTgsOTksMTAwLDEwMSwxMDIsMTAzLDEwNCwxMDUsMTA2LDEwNywxMDgsMTA5LDExMCwxMTEsMTEyLDExMywxMTQsMTE1LDExNiwxMTcsMTE4LDExOSwxMjAsMTIxLDEyMiwxMjMsMTI0LDEyNSwxMjYsMTI3LDEyOCwxMjksMTMwLDEzMSwxMzIsMTMzLDEzNCwxMzUsMTM2LDEzNywxMzgsMTM5LDE0MCwxNDEsMTQyLDE0MywxNDQsMTQ1LDE0NiwxNDcsMTQ4LDE0OSwxNTBdfQ==
