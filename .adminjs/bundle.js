(function (react, adminjs, designSystem) {
	'use strict';

	const api$h = new adminjs.ApiClient();
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
	      const response = await api$h.recordAction({
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

	const api$g = new adminjs.ApiClient();
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
	      const response = await api$g.recordAction({
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

	const api$f = new adminjs.ApiClient();
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
	    api$f.recordAction({
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
	      const response = await api$f.recordAction({
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

	const api$e = new adminjs.ApiClient();
	const formatMoney$6 = (value, currency = 'UAH') => {
	  const safeValue = Number.isFinite(value) ? value : 0;
	  try {
	    return new Intl.NumberFormat(undefined, {
	      style: 'currency',
	      currency,
	      minimumFractionDigits: 2,
	      maximumFractionDigits: 2
	    }).format(safeValue);
	  } catch {
	    return safeValue.toFixed(2);
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
	    api$e.recordAction({
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
	  }, formatMoney$6(payload.subtotal))), /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      padding: 14,
	      borderRadius: 12,
	      border: '1px solid #E2E8F0'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('discounts')), /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold"
	  }, formatMoney$6(payload.discounts))), /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      padding: 14,
	      borderRadius: 12,
	      border: '1px solid #E2E8F0'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('shipping')), /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold"
	  }, formatMoney$6(payload.shipping))), /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      padding: 14,
	      borderRadius: 12,
	      border: '1px solid #E2E8F0'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('total')), /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold"
	  }, formatMoney$6(payload.total))))), /*#__PURE__*/React.createElement(adminjs.OriginalShow, props));
	}

	const api$d = new adminjs.ApiClient();
	const extractPayload$1 = payload => {
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
	    api$d.recordAction({
	      resourceId: resource.id,
	      recordId,
	      actionName: action.name,
	      method: 'get'
	    }).then(response => {
	      if (!isActive) return;
	      const payload = extractPayload$1(response.data.payload);
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
	      const response = await api$d.recordAction({
	        resourceId: resource.id,
	        recordId,
	        actionName: action.name,
	        method: 'post',
	        data: formData
	      });
	      if (response.data.notice) {
	        addNotice(response.data.notice);
	      }
	      const payload = extractPayload$1(response.data.payload);
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

	const api$c = new adminjs.ApiClient();
	const formatMoney$5 = (value, currency = 'UAH') => {
	  const safeValue = Number.isFinite(value) ? value : 0;
	  try {
	    return new Intl.NumberFormat(undefined, {
	      style: 'currency',
	      currency,
	      minimumFractionDigits: 2,
	      maximumFractionDigits: 2
	    }).format(safeValue);
	  } catch {
	    return safeValue.toFixed(2);
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
	    api$c.recordAction({
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
	  }, /*#__PURE__*/React.createElement(designSystem.TableCell, null, item.name), /*#__PURE__*/React.createElement(designSystem.TableCell, null, item.quantity), /*#__PURE__*/React.createElement(designSystem.TableCell, null, formatMoney$5(item.unitPrice)), /*#__PURE__*/React.createElement(designSystem.TableCell, null, formatMoney$5(item.price)))))), /*#__PURE__*/React.createElement(designSystem.Box, {
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
	  }, formatMoney$5(payload.total))))));
	}

	const formatMoney$4 = (value, currency = 'UAH') => {
	  const safeValue = Number.isFinite(value) ? value : 0;
	  try {
	    return new Intl.NumberFormat(undefined, {
	      style: 'currency',
	      currency,
	      minimumFractionDigits: 2,
	      maximumFractionDigits: 2
	    }).format(safeValue);
	  } catch {
	    return safeValue.toFixed(2);
	  }
	};
	function OrderTotalList(props) {
	  const {
	    record,
	    property
	  } = props;
	  const raw = record.params[property.path];
	  const numeric = Number(raw ?? 0);
	  return formatMoney$4(numeric);
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

	const api$b = new adminjs.ApiClient();
	const formatMoney$3 = (value, currency = 'UAH') => {
	  const safeValue = Number.isFinite(value) ? value : 0;
	  try {
	    return new Intl.NumberFormat(undefined, {
	      style: 'currency',
	      currency,
	      minimumFractionDigits: 2,
	      maximumFractionDigits: 2
	    }).format(safeValue);
	  } catch {
	    return safeValue.toFixed(2);
	  }
	};
	const formatDate$2 = value => {
	  if (!value) return '-';
	  const parsed = Date.parse(value);
	  return Number.isNaN(parsed) ? value : new Date(parsed).toLocaleString();
	};
	const getRootPath$3 = () => {
	  if (typeof window === 'undefined') return '';
	  const path = window.location.pathname ?? '';
	  const parts = path.split('/resources');
	  return parts[0] ?? '';
	};
	const buildRecordShowHref$1 = (resourceId, recordId) => `${getRootPath$3()}/resources/${resourceId}/records/${recordId}/show`;
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
	    api$b.recordAction({
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
	    api$b.recordAction({
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
	      const response = await api$b.recordAction({
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
	  }, formatMoney$3(payload.lifetimeValue))), /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      padding: 14,
	      borderRadius: 12,
	      border: '1px solid #E2E8F0'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('customer-kpis-aov')), /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold"
	  }, formatMoney$3(payload.averageOrderValue))), /*#__PURE__*/React.createElement(designSystem.Box, {
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
	    href: buildRecordShowHref$1('Order', order.id),
	    style: {
	      fontWeight: 600
	    }
	  }, order.id)), /*#__PURE__*/React.createElement(designSystem.TableCell, null, order.status), /*#__PURE__*/React.createElement(designSystem.TableCell, null, formatMoney$3(order.total)), /*#__PURE__*/React.createElement(designSystem.TableCell, null, formatDate$2(order.createdAt)))))) : /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('customer-related-empty'))), /*#__PURE__*/React.createElement(designSystem.Box, null, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold",
	    mb: "sm"
	  }, translateMessage('customer-related-reviews')), related.reviews.length ? /*#__PURE__*/React.createElement(designSystem.Table, null, /*#__PURE__*/React.createElement(designSystem.TableHead, null, /*#__PURE__*/React.createElement(designSystem.TableRow, null, /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('customer-related-review-product')), /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('customer-related-review-rating')), /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('customer-related-review-comment')), /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('customer-related-review-created')))), /*#__PURE__*/React.createElement(designSystem.TableBody, null, related.reviews.map(review => /*#__PURE__*/React.createElement(designSystem.TableRow, {
	    key: review.id
	  }, /*#__PURE__*/React.createElement(designSystem.TableCell, null, /*#__PURE__*/React.createElement("a", {
	    href: buildRecordShowHref$1('Product', review.productId),
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
	  }, review.comment)), /*#__PURE__*/React.createElement(designSystem.TableCell, null, formatDate$2(review.createdAt)))))) : /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('customer-related-empty'))), /*#__PURE__*/React.createElement(designSystem.Box, null, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold",
	    mb: "sm"
	  }, translateMessage('customer-related-wishlist')), related.wishlist.length ? /*#__PURE__*/React.createElement(designSystem.Table, null, /*#__PURE__*/React.createElement(designSystem.TableHead, null, /*#__PURE__*/React.createElement(designSystem.TableRow, null, /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('customer-related-product')), /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('customer-related-added')))), /*#__PURE__*/React.createElement(designSystem.TableBody, null, related.wishlist.map(item => /*#__PURE__*/React.createElement(designSystem.TableRow, {
	    key: `${item.productId}:${item.createdAt}`
	  }, /*#__PURE__*/React.createElement(designSystem.TableCell, null, /*#__PURE__*/React.createElement("a", {
	    href: buildRecordShowHref$1('Product', item.productId),
	    style: {
	      fontWeight: 600
	    }
	  }, item.productName)), /*#__PURE__*/React.createElement(designSystem.TableCell, null, formatDate$2(item.createdAt)))))) : /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('customer-related-empty'))), /*#__PURE__*/React.createElement(designSystem.Box, null, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold",
	    mb: "sm"
	  }, translateMessage('customer-related-recently-viewed')), related.recentlyViewed.length ? /*#__PURE__*/React.createElement(designSystem.Table, null, /*#__PURE__*/React.createElement(designSystem.TableHead, null, /*#__PURE__*/React.createElement(designSystem.TableRow, null, /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('customer-related-product')), /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('customer-related-updated')))), /*#__PURE__*/React.createElement(designSystem.TableBody, null, related.recentlyViewed.map(item => /*#__PURE__*/React.createElement(designSystem.TableRow, {
	    key: `${item.productId}:${item.createdAt}`
	  }, /*#__PURE__*/React.createElement(designSystem.TableCell, null, /*#__PURE__*/React.createElement("a", {
	    href: buildRecordShowHref$1('Product', item.productId),
	    style: {
	      fontWeight: 600
	    }
	  }, item.productName)), /*#__PURE__*/React.createElement(designSystem.TableCell, null, formatDate$2(item.createdAt)))))) : /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('customer-related-empty'))))), /*#__PURE__*/React.createElement(adminjs.OriginalShow, props));
	}

	const api$a = new adminjs.ApiClient();
	const formatDate$1 = value => {
	  if (!value) return '-';
	  const parsed = Date.parse(value);
	  return Number.isNaN(parsed) ? value : new Date(parsed).toLocaleString();
	};
	const formatMoney$2 = value => {
	  const safeValue = value == null || !Number.isFinite(value) ? 0 : value;
	  try {
	    return new Intl.NumberFormat(undefined, {
	      style: 'currency',
	      currency: 'UAH',
	      minimumFractionDigits: 2,
	      maximumFractionDigits: 2
	    }).format(safeValue);
	  } catch {
	    return safeValue.toFixed(2);
	  }
	};
	const getRootPath$2 = () => {
	  if (typeof window === 'undefined') return '';
	  const path = window.location.pathname ?? '';
	  const parts = path.split('/resources');
	  return parts[0] ?? '';
	};
	const buildUserShowHref = (resourceId, userId) => `${getRootPath$2()}/resources/${resourceId}/records/${userId}/show`;
	const buildUserListHref = (resourceId, filters) => {
	  const root = getRootPath$2();
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
	  }, user.name)), /*#__PURE__*/React.createElement(designSystem.TableCell, null, user.email ?? '-'), showLtv ? /*#__PURE__*/React.createElement(designSystem.TableCell, null, formatMoney$2(user.lifetimeValue)) : null, showLastOrder ? /*#__PURE__*/React.createElement(designSystem.TableCell, null, formatDate$1(user.lastOrderAt)) : null, /*#__PURE__*/React.createElement(designSystem.TableCell, null, formatDate$1(user.createdAt))))));
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
	    api$a.resourceAction({
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

	const api$9 = new adminjs.ApiClient();
	const toLocalInputValue = value => {
	  if (!value) return '';
	  const parsed = Date.parse(value);
	  if (Number.isNaN(parsed)) return '';
	  const d = new Date(parsed);
	  const pad = n => String(n).padStart(2, '0');
	  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
	};
	const formatMoney$1 = (value, currency = 'UAH') => {
	  const safeValue = Number.isFinite(value) ? value : 0;
	  try {
	    return new Intl.NumberFormat(undefined, {
	      style: 'currency',
	      currency,
	      minimumFractionDigits: 2,
	      maximumFractionDigits: 2
	    }).format(safeValue);
	  } catch {
	    return safeValue.toFixed(2);
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
	      price: formatMoney$1(dp)
	    });
	    return translateMessage('discount-window', {
	      price: formatMoney$1(dp),
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
	      const response = await api$9.recordAction({
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
	  }, translateMessage('discount-base-price'), ": ", formatMoney$1(basePrice)), /*#__PURE__*/React.createElement(designSystem.Text, {
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

	const actionButtonStyle$9 = {
	  borderColor: 'white',
	  background: '#facc15',
	  color: 'black'
	};
	const getRootPath$1 = () => {
	  if (typeof window === 'undefined') return '';
	  const path = window.location.pathname ?? '';
	  const parts = path.split('/resources');
	  return parts[0] ?? '';
	};
	const buildListHref = (resourceId, filters) => {
	  const root = getRootPath$1();
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
	    style: actionButtonStyle$9
	  }, translateMessage(`product-views-${view.key}`)))), /*#__PURE__*/React.createElement("a", {
	    href: buildListHref(resource.id, {})
	  }, /*#__PURE__*/React.createElement(designSystem.Button, {
	    variant: "outlined"
	  }, translateMessage('product-views-clear'))))), /*#__PURE__*/React.createElement(adminjs.OriginalList, props));
	}

	function _extends() {
	  return _extends = Object.assign ? Object.assign.bind() : function (n) {
	    for (var e = 1; e < arguments.length; e++) {
	      var t = arguments[e];
	      for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
	    }
	    return n;
	  }, _extends.apply(null, arguments);
	}

	const DEFAULT_LOCALE = 'uk';

	const api$8 = new adminjs.ApiClient();
	const extractPayload = payload => {
	  if (!payload || typeof payload !== 'object') return {
	    entries: [],
	    unavailable: false
	  };
	  const entries = payload.entries;
	  const unavailable = Boolean(payload.unavailable);
	  return {
	    entries: Array.isArray(entries) ? entries : [],
	    unavailable
	  };
	};
	function ProductActivityTimeline(props) {
	  const {
	    action,
	    record,
	    resource,
	    actionNameOverride,
	    titleOverride
	  } = props;
	  const recordId = record?.id;
	  const actionName = actionNameOverride ?? action?.name ?? 'activityTimeline';
	  const [entries, setEntries] = react.useState([]);
	  const [unavailable, setUnavailable] = react.useState(false);
	  const [note, setNote] = react.useState('');
	  const [loading, setLoading] = react.useState(false);
	  const [saving, setSaving] = react.useState(false);
	  const addNotice = adminjs.useNotice();
	  const {
	    translateAction,
	    translateMessage,
	    translateProperty
	  } = adminjs.useTranslation();
	  const addNoticeRef = react.useRef(addNotice);
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
	      actionName,
	      method: 'get'
	    }).then(response => {
	      if (!isActive) return;
	      const extracted = extractPayload(response.data.payload);
	      setEntries(extracted.entries);
	      setUnavailable(extracted.unavailable);
	    }).catch(() => {
	      if (!isActive) return;
	      addNoticeRef.current({
	        message: 'product-activity-load-failed',
	        type: 'error'
	      });
	    }).finally(() => {
	      if (!isActive) return;
	      setLoading(false);
	    });
	    return () => {
	      isActive = false;
	    };
	  }, [actionName, recordId, resource.id]);
	  const formatTimestamp = value => {
	    const parsed = Date.parse(value);
	    if (Number.isNaN(parsed)) return value;
	    return new Date(parsed).toLocaleString();
	  };
	  const title = titleOverride ?? (action ? translateAction(action.name, resource.id) : translateMessage('product-activity-title'));
	  const handleSubmit = async () => {
	    if (!recordId) return;
	    const trimmed = note.trim();
	    if (!trimmed) {
	      addNotice({
	        message: 'product-activity-note-empty',
	        type: 'error'
	      });
	      return;
	    }
	    setSaving(true);
	    try {
	      const formData = new FormData();
	      formData.append('note', trimmed);
	      const response = await api$8.recordAction({
	        resourceId: resource.id,
	        recordId,
	        actionName,
	        method: 'post',
	        data: formData
	      });
	      if (response.data.notice) addNotice(response.data.notice);
	      setNote('');
	      const extracted = extractPayload(response.data.payload);
	      setEntries(extracted.entries);
	      setUnavailable(extracted.unavailable);
	    } catch {
	      addNotice({
	        message: 'product-activity-note-save-failed',
	        type: 'error'
	      });
	    } finally {
	      setSaving(false);
	    }
	  };
	  if (!recordId) return null;
	  const renderEntryTitle = entry => {
	    if (entry.type === 'NOTE') return translateMessage('product-activity-note-entry');
	    const fieldLabel = entry.field ? translateProperty(entry.field, resource.id) : translateMessage('product-activity-field-unknown');
	    return translateMessage('product-activity-field-change', {
	      field: fieldLabel
	    });
	  };
	  const renderEntryBody = entry => {
	    if (entry.type === 'NOTE') return entry.note ? /*#__PURE__*/React.createElement(designSystem.Text, null, entry.note) : null;
	    const fromValue = entry.fromValue ?? '-';
	    const toValue = entry.toValue ?? '-';
	    return /*#__PURE__*/React.createElement(designSystem.Box, {
	      display: "flex",
	      alignItems: "center",
	      style: {
	        gap: 8,
	        flexWrap: 'wrap'
	      }
	    }, /*#__PURE__*/React.createElement(designSystem.Badge, {
	      outline: true
	    }, fromValue), /*#__PURE__*/React.createElement(designSystem.Box, {
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
	    }, toValue));
	  };
	  return /*#__PURE__*/React.createElement(designSystem.Box, {
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
	  }, unavailable ? /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      border: '1px solid #FECACA',
	      background: '#FEF2F2',
	      padding: 12,
	      borderRadius: 12
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Text, null, translateMessage('product-activity-unavailable'))) : null, /*#__PURE__*/React.createElement(designSystem.Box, null, /*#__PURE__*/React.createElement(designSystem.Label, {
	    htmlFor: "product-activity-note"
	  }, translateMessage('product-activity-note-label')), /*#__PURE__*/React.createElement("textarea", {
	    id: "product-activity-note",
	    name: "productActivityNote",
	    value: note,
	    onChange: event => setNote(event.target.value),
	    placeholder: translateMessage('product-activity-note-placeholder'),
	    rows: 3,
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
	  }, saving ? translateMessage('product-activity-note-saving') : translateMessage('product-activity-note-submit'))), /*#__PURE__*/React.createElement(designSystem.Box, null, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontSize: "lg",
	    fontWeight: "bold",
	    mb: "md"
	  }, translateMessage('product-activity-timeline')), loading ? /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('product-activity-load-progress')) : entries.length === 0 ? /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('product-activity-timeline-empty')) : /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      display: 'flex',
	      flexDirection: 'column',
	      gap: 16
	    }
	  }, entries.map(entry => {
	    const adminLabel = entry.adminEmail ?? translateMessage('product-activity-unknown-admin');
	    const timestamp = formatTimestamp(entry.createdAt);
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
	    }, renderEntryTitle(entry)), /*#__PURE__*/React.createElement(designSystem.Text, {
	      color: "grey60",
	      fontSize: "sm"
	    }, timestamp)), renderEntryBody(entry), /*#__PURE__*/React.createElement(designSystem.Text, {
	      color: "grey60",
	      fontSize: "sm",
	      mt: "sm"
	    }, translateMessage('product-activity-admin-label'), ": ", adminLabel));
	  })))));
	}

	const api$7 = new adminjs.ApiClient();
	const formatMoney = (value, currency = 'UAH') => {
	  const safeValue = Number.isFinite(value) ? value : 0;
	  try {
	    return new Intl.NumberFormat(undefined, {
	      style: 'currency',
	      currency,
	      minimumFractionDigits: 2,
	      maximumFractionDigits: 2
	    }).format(safeValue);
	  } catch {
	    return safeValue.toFixed(2);
	  }
	};
	const formatDate = value => {
	  if (!value) return '-';
	  const parsed = Date.parse(value);
	  return Number.isNaN(parsed) ? value : new Date(parsed).toLocaleString();
	};
	const normalizeNumberParam = value => {
	  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
	  if (typeof value === 'bigint') return Number(value);
	  if (value && typeof value === 'object' && 'toNumber' in value && typeof value.toNumber === 'function') {
	    const numeric = value.toNumber();
	    return Number.isFinite(numeric) ? numeric : 0;
	  }
	  const numeric = Number(value);
	  return Number.isFinite(numeric) ? numeric : 0;
	};
	const getRootPath = () => {
	  if (typeof window === 'undefined') return '';
	  const path = window.location.pathname ?? '';
	  const parts = path.split('/resources');
	  return parts[0] ?? '';
	};
	const buildRecordShowHref = (resourceId, recordId) => `${getRootPath()}/resources/${resourceId}/records/${recordId}/show`;
	const resolveStorefrontLocale = adminLocale => {
	  const normalized = adminLocale?.split('-')[0];
	  if (normalized === 'ua') return 'uk';
	  if (normalized === 'en') return 'en';
	  return DEFAULT_LOCALE;
	};
	const buildPreviewPath = (locale, fullSlug) => {
	  const basePath = `/products/${fullSlug}`;
	  return locale === DEFAULT_LOCALE ? basePath : `/${locale}${basePath}`;
	};
	function ProductShow(props) {
	  const {
	    record,
	    resource,
	    action
	  } = props;
	  const {
	    translateAction,
	    translateMessage,
	    i18n
	  } = adminjs.useTranslation();
	  const addNotice = adminjs.useNotice();
	  const recordId = record?.id;
	  const name = String(record?.params?.name ?? '');
	  const imageUrl = record?.params?.imageUrl ?? null;
	  const status = String(record?.params?.status ?? '');
	  const fullSlug = String(record?.params?.fullSlug ?? '').trim();
	  const storefrontLocale = resolveStorefrontLocale(i18n?.language);
	  const previewPath = fullSlug ? buildPreviewPath(storefrontLocale, fullSlug) : '';
	  const previewBaseUrl = typeof action?.custom?.previewBaseUrl === 'string' ? action.custom.previewBaseUrl.trim() : '';
	  const fallbackBaseUrl = typeof window === 'undefined' ? '' : window.location.origin;
	  const resolvedBaseUrl = previewBaseUrl || fallbackBaseUrl;
	  const previewUrl = !previewPath || !resolvedBaseUrl ? '' : new URL(previewPath, resolvedBaseUrl).toString();
	  const [isOpen, setIsOpen] = react.useState(false);
	  const [payload, setPayload] = react.useState(null);
	  const [loading, setLoading] = react.useState(false);
	  const [related, setRelated] = react.useState(null);
	  const [relatedLoading, setRelatedLoading] = react.useState(false);
	  const sanitizedRecord = react.useMemo(() => {
	    if (!record) return record;
	    const params = {
	      ...record.params
	    };
	    const basePrice = normalizeNumberParam(params.basePrice);
	    const discountRaw = params.discountPrice;
	    const normalizedDiscount = normalizeNumberParam(discountRaw);
	    const numericKeys = ['stock', 'averageRating', 'reviewCount'];
	    params.basePrice = basePrice;
	    params.discountPrice = discountRaw == null ? basePrice : normalizedDiscount;
	    numericKeys.forEach(key => {
	      params[key] = normalizeNumberParam(params[key]);
	    });
	    return {
	      ...record,
	      params
	    };
	  }, [record]);
	  const openImage = e => {
	    if (e) e.stopPropagation();
	    if (!imageUrl) return;
	    setIsOpen(true);
	  };
	  const openPreview = () => {
	    if (!previewUrl) {
	      addNotice({
	        message: 'product-preview-missing-slug',
	        type: 'error'
	      });
	      return;
	    }
	    window.open(previewUrl, '_blank', 'noopener,noreferrer');
	  };
	  react.useEffect(() => {
	    if (!recordId) return;
	    let isActive = true;
	    setLoading(true);
	    api$7.recordAction({
	      resourceId: resource.id,
	      recordId,
	      actionName: 'productKpis',
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
	      actionName: 'productRelatedData',
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
	  const conversionText = react.useMemo(() => {
	    if (!payload || payload.recentlyViewedCount <= 0 || !Number.isFinite(payload.conversionProxy)) {
	      return '0.00%';
	    }
	    return `${(payload.conversionProxy * 100).toFixed(2)}%`;
	  }, [payload]);
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
	      minWidth: 0,
	      flex: 1,
	      display: 'flex',
	      alignItems: 'center',
	      gap: 16
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      minWidth: 0,
	      flex: 1
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
	  }, status) : null), /*#__PURE__*/React.createElement(designSystem.Button, {
	    variant: "outlined",
	    color: "primary",
	    onClick: openPreview,
	    disabled: !previewUrl,
	    style: {
	      whiteSpace: 'nowrap'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Icon, {
	    icon: "ExternalLink"
	  }), translateAction('previewProduct', resource.id)))), /*#__PURE__*/React.createElement(designSystem.Box, {
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
	  }, translateMessage('product-kpis')), loading || !payload ? /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('product-kpis-loading')) : /*#__PURE__*/React.createElement(designSystem.Box, {
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
	  }, translateMessage('product-kpis-wishlist')), /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold"
	  }, payload.wishlistCount)), /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      padding: 14,
	      borderRadius: 12,
	      border: '1px solid #E2E8F0'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('product-kpis-recently-viewed')), /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold"
	  }, payload.recentlyViewedCount)), /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      padding: 14,
	      borderRadius: 12,
	      border: '1px solid #E2E8F0'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('product-kpis-items-sold')), /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold"
	  }, payload.itemsSold)), /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      padding: 14,
	      borderRadius: 12,
	      border: '1px solid #E2E8F0'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('product-kpis-revenue')), /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold"
	  }, formatMoney(payload.revenue))), /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      padding: 14,
	      borderRadius: 12,
	      border: '1px solid #E2E8F0'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('product-kpis-conversion-proxy')), /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold"
	  }, conversionText), /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60",
	    style: {
	      fontSize: 13
	    }
	  }, payload.paidOrderCount, " / ", payload.recentlyViewedCount || 0)))), /*#__PURE__*/React.createElement(designSystem.Box, {
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
	  }, translateMessage('product-related')), relatedLoading || !related ? /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('product-related-loading')) : /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      display: 'grid',
	      gridTemplateColumns: '1fr',
	      gap: 18
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Box, null, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold",
	    mb: "sm"
	  }, translateMessage('product-related-order-items')), related.orderItems.length ? /*#__PURE__*/React.createElement(designSystem.Table, null, /*#__PURE__*/React.createElement(designSystem.TableHead, null, /*#__PURE__*/React.createElement(designSystem.TableRow, null, /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('product-related-order-id')), /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('product-related-order-status')), /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('product-related-order-quantity')), /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('product-related-order-unit-price')), /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('product-related-order-total')), /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('product-related-order-created')))), /*#__PURE__*/React.createElement(designSystem.TableBody, null, related.orderItems.map(item => /*#__PURE__*/React.createElement(designSystem.TableRow, {
	    key: item.id
	  }, /*#__PURE__*/React.createElement(designSystem.TableCell, null, item.orderId && item.orderId !== '-' ? /*#__PURE__*/React.createElement("a", {
	    href: buildRecordShowHref('Order', item.orderId),
	    style: {
	      fontWeight: 600
	    }
	  }, item.orderId) : '-'), /*#__PURE__*/React.createElement(designSystem.TableCell, null, item.orderStatus), /*#__PURE__*/React.createElement(designSystem.TableCell, null, item.quantity), /*#__PURE__*/React.createElement(designSystem.TableCell, null, formatMoney(item.unitPrice)), /*#__PURE__*/React.createElement(designSystem.TableCell, null, formatMoney(item.lineTotal)), /*#__PURE__*/React.createElement(designSystem.TableCell, null, formatDate(item.createdAt)))))) : /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('product-related-empty'))), /*#__PURE__*/React.createElement(designSystem.Box, null, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold",
	    mb: "sm"
	  }, translateMessage('product-related-reviews')), related.reviews.length ? /*#__PURE__*/React.createElement(designSystem.Table, null, /*#__PURE__*/React.createElement(designSystem.TableHead, null, /*#__PURE__*/React.createElement(designSystem.TableRow, null, /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('product-related-review-user')), /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('product-related-review-rating')), /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('product-related-review-comment')), /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('product-related-review-created')))), /*#__PURE__*/React.createElement(designSystem.TableBody, null, related.reviews.map(review => /*#__PURE__*/React.createElement(designSystem.TableRow, {
	    key: review.id
	  }, /*#__PURE__*/React.createElement(designSystem.TableCell, null, /*#__PURE__*/React.createElement("a", {
	    href: buildRecordShowHref('User', review.userId),
	    style: {
	      fontWeight: 600
	    }
	  }, review.userName)), /*#__PURE__*/React.createElement(designSystem.TableCell, null, review.rating), /*#__PURE__*/React.createElement(designSystem.TableCell, null, /*#__PURE__*/React.createElement(designSystem.Text, {
	    style: {
	      maxWidth: 420,
	      whiteSpace: 'nowrap',
	      overflow: 'hidden',
	      textOverflow: 'ellipsis'
	    }
	  }, review.comment)), /*#__PURE__*/React.createElement(designSystem.TableCell, null, formatDate(review.createdAt)))))) : /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('product-related-empty'))))), /*#__PURE__*/React.createElement(ProductActivityTimeline, _extends({}, props, {
	    actionNameOverride: "activityTimeline",
	    titleOverride: translateMessage('product-activity-title')
	  })), /*#__PURE__*/React.createElement(adminjs.OriginalShow, _extends({}, props, {
	    record: sanitizedRecord ?? record
	  })));
	}

	const api$6 = new adminjs.ApiClient();
	const actionButtonStyle$8 = {
	  borderColor: 'white',
	  background: '#facc15',
	  color: 'black'
	};
	const parseValues = valueText => Array.from(new Set(valueText.split(',').map(entry => entry.trim()).filter(Boolean)));
	const buildSignature = options => options.slice().sort((a, b) => a.attributeId.localeCompare(b.attributeId)).map(option => `${option.attributeId}:${option.value}`).join('|');
	const sanitizeSkuPart = value => value.trim().replace(/\s+/g, '-').replace(/[^A-Za-z0-9_-]/g, '').toUpperCase();
	const buildSku = (baseSku, options) => {
	  const base = sanitizeSkuPart(baseSku || 'SKU') || 'SKU';
	  const suffix = options.map(option => sanitizeSkuPart(option.value)).filter(Boolean).join('-');
	  return suffix ? `${base}-${suffix}` : base;
	};
	const buildCombinations = attributes => {
	  const selected = attributes.filter(attr => attr.enabled);
	  if (selected.length === 0) return [];
	  let combos = [[]];
	  for (const attr of selected) {
	    const values = parseValues(attr.valueText);
	    if (values.length === 0) return [];
	    combos = combos.flatMap(combo => values.map(value => [...combo, {
	      attributeId: attr.id,
	      value
	    }]));
	  }
	  return combos;
	};
	function ProductVariantMatrix(props) {
	  const {
	    action,
	    record,
	    resource
	  } = props;
	  const {
	    translateAction,
	    translateMessage
	  } = adminjs.useTranslation();
	  const addNotice = adminjs.useNotice();
	  const addNoticeRef = react.useRef(addNotice);
	  const recordId = record?.id ?? (record?.params?.id != null ? String(record.params.id) : undefined);
	  const [loading, setLoading] = react.useState(true);
	  const [saving, setSaving] = react.useState(false);
	  const [loadError, setLoadError] = react.useState(null);
	  const [attributes, setAttributes] = react.useState([]);
	  const [variants, setVariants] = react.useState([]);
	  const [product, setProduct] = react.useState(null);
	  react.useEffect(() => {
	    addNoticeRef.current = addNotice;
	  }, [addNotice]);
	  react.useEffect(() => {
	    if (!recordId) {
	      setLoadError('product-variant-missing-record');
	      setLoading(false);
	      return;
	    }
	    let isActive = true;
	    setLoading(true);
	    setLoadError(null);
	    api$6.recordAction({
	      resourceId: resource.id,
	      recordId,
	      actionName: action.name,
	      method: 'get'
	    }).then(response => {
	      if (!isActive) return;
	      const payload = response.data.payload ?? null;
	      if (!payload) return;
	      const valuesByAttribute = payload.attributeValues.reduce((acc, entry) => {
	        if (!acc.has(entry.attributeId)) acc.set(entry.attributeId, []);
	        acc.get(entry.attributeId).push(entry.value);
	        return acc;
	      }, new Map());
	      const nextAttributes = payload.attributes.map(attr => {
	        const values = valuesByAttribute.get(attr.id) ?? [];
	        return {
	          ...attr,
	          enabled: values.length > 0,
	          valueText: values.join(', ')
	        };
	      });
	      const order = new Map(nextAttributes.map((attr, idx) => [attr.id, idx]));
	      const sortOptions = options => options.slice().sort((a, b) => (order.get(a.attributeId) ?? 0) - (order.get(b.attributeId) ?? 0));
	      const nextVariants = payload.variants.map(variant => ({
	        signature: buildSignature(variant.options),
	        options: sortOptions(variant.options),
	        sku: variant.sku,
	        price: String(variant.price ?? ''),
	        stock: String(variant.stock ?? '')
	      }));
	      setProduct(payload.product);
	      setAttributes(nextAttributes);
	      setVariants(nextVariants);
	    }).catch(() => {
	      if (!isActive) return;
	      setLoadError('product-variant-load-failed');
	      addNoticeRef.current({
	        message: 'product-variant-load-failed',
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
	  const attributeOrder = react.useMemo(() => new Map(attributes.map((attr, idx) => [attr.id, idx])), [attributes]);
	  const orderedAttributes = react.useMemo(() => attributes.slice().sort((a, b) => (attributeOrder.get(a.id) ?? 0) - (attributeOrder.get(b.id) ?? 0)), [attributeOrder, attributes]);
	  const variantsBySignature = react.useMemo(() => {
	    const map = new Map();
	    variants.forEach(variant => map.set(variant.signature, variant));
	    return map;
	  }, [variants]);
	  const handleToggleAttribute = attributeId => {
	    setAttributes(prev => prev.map(attr => attr.id === attributeId ? {
	      ...attr,
	      enabled: !attr.enabled
	    } : attr));
	  };
	  const handleAttributeValuesChange = (attributeId, valueText) => {
	    setAttributes(prev => prev.map(attr => attr.id === attributeId ? {
	      ...attr,
	      valueText
	    } : attr));
	  };
	  const handleGenerate = () => {
	    const combos = buildCombinations(attributes);
	    if (combos.length === 0) {
	      addNoticeRef.current({
	        message: 'product-variant-no-attributes',
	        type: 'error'
	      });
	      return;
	    }
	    const baseSku = product?.productCode ?? '';
	    const basePrice = product?.basePrice != null ? String(product.basePrice) : '';
	    const nextVariants = combos.map(options => {
	      const signature = buildSignature(options);
	      const existing = variantsBySignature.get(signature);
	      return {
	        signature,
	        options: options.slice().sort((a, b) => (attributeOrder.get(a.attributeId) ?? 0) - (attributeOrder.get(b.attributeId) ?? 0)),
	        sku: existing?.sku ?? buildSku(baseSku, options),
	        price: existing?.price ?? basePrice,
	        stock: existing?.stock ?? '0'
	      };
	    });
	    setVariants(nextVariants);
	  };
	  const handleVariantChange = (index, field, value) => {
	    setVariants(prev => prev.map((variant, idx) => idx === index ? {
	      ...variant,
	      [field]: value
	    } : variant));
	  };
	  const handleSave = async () => {
	    if (!recordId || saving) return;
	    setSaving(true);
	    try {
	      const payloadAttributes = attributes.filter(attr => attr.enabled).map(attr => ({
	        id: attr.id,
	        values: parseValues(attr.valueText)
	      }));
	      const payloadVariants = variants.map(variant => ({
	        sku: variant.sku,
	        price: variant.price,
	        stock: variant.stock,
	        options: variant.options
	      }));
	      const formData = new FormData();
	      formData.append('attributes', JSON.stringify(payloadAttributes));
	      formData.append('variants', JSON.stringify(payloadVariants));
	      const response = await api$6.recordAction({
	        resourceId: resource.id,
	        recordId,
	        actionName: action.name,
	        method: 'post',
	        data: formData
	      });
	      if (response.data.notice) addNoticeRef.current(response.data.notice);
	    } catch {
	      addNoticeRef.current({
	        message: 'product-variant-save-failed',
	        type: 'error'
	      });
	    } finally {
	      setSaving(false);
	    }
	  };
	  const title = translateAction(action.name, resource.id);
	  const hasVariants = variants.length > 0;
	  return /*#__PURE__*/React.createElement(designSystem.Box, {
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
	    mb: "xl"
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontSize: "xl",
	    fontWeight: "bold"
	  }, title)), loading ? /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('product-variant-loading')) : loadError ? /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage(loadError)) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(designSystem.Text, {
	    mb: "lg",
	    color: "grey60"
	  }, translateMessage('product-variant-description')), /*#__PURE__*/React.createElement(designSystem.Box, {
	    variant: "white",
	    p: "xl",
	    borderRadius: "lg",
	    mb: "xl",
	    style: {
	      border: '1px solid #E2E8F0',
	      background: '#F8FAFC'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold",
	    mb: "md"
	  }, translateMessage('product-variant-attributes-title')), /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      display: 'grid',
	      gap: 16
	    }
	  }, orderedAttributes.map(attr => /*#__PURE__*/React.createElement(designSystem.Box, {
	    key: attr.id,
	    style: {
	      display: 'grid',
	      gridTemplateColumns: 'minmax(180px, 220px) 1fr',
	      gap: 16,
	      alignItems: 'center'
	    }
	  }, /*#__PURE__*/React.createElement("label", {
	    style: {
	      display: 'flex',
	      alignItems: 'center',
	      gap: 8
	    }
	  }, /*#__PURE__*/React.createElement("input", {
	    type: "checkbox",
	    checked: attr.enabled,
	    onChange: () => handleToggleAttribute(attr.id)
	  }), /*#__PURE__*/React.createElement("span", null, attr.name, attr.unit ? ` (${attr.unit})` : '')), /*#__PURE__*/React.createElement(designSystem.FormGroup, null, /*#__PURE__*/React.createElement(designSystem.Label, null, translateMessage('product-variant-values-label')), /*#__PURE__*/React.createElement(designSystem.Input, {
	    placeholder: translateMessage('product-variant-values-placeholder'),
	    value: attr.valueText,
	    disabled: !attr.enabled,
	    onChange: event => handleAttributeValuesChange(attr.id, event.target.value)
	  }))))), /*#__PURE__*/React.createElement(designSystem.Box, {
	    mt: "lg",
	    style: {
	      display: 'flex',
	      gap: 20
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Button, {
	    variant: "outlined",
	    onClick: handleGenerate
	  }, translateMessage('product-variant-generate')), /*#__PURE__*/React.createElement(designSystem.Button, {
	    variant: "contained",
	    color: "primary",
	    onClick: handleSave,
	    disabled: saving,
	    style: actionButtonStyle$8
	  }, saving ? translateMessage('product-variant-saving') : translateMessage('product-variant-save')))), /*#__PURE__*/React.createElement(designSystem.Box, null, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold",
	    mb: "md"
	  }, translateMessage('product-variant-matrix-title')), hasVariants ? /*#__PURE__*/React.createElement(designSystem.Table, null, /*#__PURE__*/React.createElement(designSystem.TableHead, null, /*#__PURE__*/React.createElement(designSystem.TableRow, null, orderedAttributes.filter(attr => attr.enabled).map(attr => /*#__PURE__*/React.createElement(designSystem.TableCell, {
	    key: attr.id
	  }, attr.name)), /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('product-variant-sku-label')), /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('product-variant-price-label')), /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('product-variant-stock-label')))), /*#__PURE__*/React.createElement(designSystem.TableBody, null, variants.map((variant, index) => /*#__PURE__*/React.createElement(designSystem.TableRow, {
	    key: variant.signature
	  }, orderedAttributes.filter(attr => attr.enabled).map(attr => {
	    const value = variant.options.find(opt => opt.attributeId === attr.id)?.value ?? '-';
	    return /*#__PURE__*/React.createElement(designSystem.TableCell, {
	      key: attr.id
	    }, value);
	  }), /*#__PURE__*/React.createElement(designSystem.TableCell, null, /*#__PURE__*/React.createElement(designSystem.Input, {
	    value: variant.sku,
	    onChange: event => handleVariantChange(index, 'sku', event.target.value)
	  })), /*#__PURE__*/React.createElement(designSystem.TableCell, null, /*#__PURE__*/React.createElement(designSystem.Input, {
	    type: "number",
	    value: variant.price,
	    onChange: event => handleVariantChange(index, 'price', event.target.value)
	  })), /*#__PURE__*/React.createElement(designSystem.TableCell, null, /*#__PURE__*/React.createElement(designSystem.Input, {
	    type: "number",
	    value: variant.stock,
	    onChange: event => handleVariantChange(index, 'stock', event.target.value)
	  })))))) : /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60"
	  }, translateMessage('product-variant-no-variants')))));
	}

	const api$5 = new adminjs.ApiClient();
	const actionButtonStyle$7 = {
	  borderColor: 'white',
	  background: '#facc15',
	  color: 'black'
	};
	const downloadText = (content, filename) => {
	  const blob = new Blob([content], {
	    type: 'text/csv;charset=utf-8'
	  });
	  const url = window.URL.createObjectURL(blob);
	  const link = document.createElement('a');
	  link.href = url;
	  link.download = filename;
	  document.body.appendChild(link);
	  link.click();
	  link.remove();
	  window.URL.revokeObjectURL(url);
	};
	function ProductCsvImportExportAction(props) {
	  const {
	    action,
	    resource
	  } = props;
	  const {
	    translateAction,
	    translateMessage
	  } = adminjs.useTranslation();
	  const addNotice = adminjs.useNotice();
	  const [csvText, setCsvText] = react.useState('');
	  const [dryRun, setDryRun] = react.useState(true);
	  const [results, setResults] = react.useState([]);
	  const [loading, setLoading] = react.useState(false);
	  const summary = react.useMemo(() => {
	    const created = results.filter(r => r.status === 'created').length;
	    const updated = results.filter(r => r.status === 'updated').length;
	    const errors = results.filter(r => r.status === 'error').length;
	    return {
	      created,
	      updated,
	      errors
	    };
	  }, [results]);
	  const formatStatus = status => translateMessage(`product-csv-status-${status}`, {
	    defaultValue: status
	  });
	  const handleFile = file => {
	    if (!file) return;
	    const reader = new FileReader();
	    reader.onload = () => {
	      setCsvText(String(reader.result ?? ''));
	    };
	    reader.readAsText(file);
	  };
	  const handleExport = async () => {
	    setLoading(true);
	    try {
	      const response = await api$5.resourceAction({
	        resourceId: resource.id,
	        actionName: 'exportProductsCsv',
	        method: 'get'
	      });
	      const payload = response.data.payload;
	      const csv = payload?.csv ?? '';
	      if (!csv) {
	        addNotice({
	          message: 'product-csv-export-empty',
	          type: 'error'
	        });
	        return;
	      }
	      downloadText(csv, payload?.filename ?? 'products.csv');
	    } catch {
	      addNotice({
	        message: 'product-csv-export-failed',
	        type: 'error'
	      });
	    } finally {
	      setLoading(false);
	    }
	  };
	  const handleImport = async () => {
	    if (!csvText.trim()) {
	      addNotice({
	        message: 'product-csv-empty',
	        type: 'error'
	      });
	      return;
	    }
	    setLoading(true);
	    try {
	      const formData = new FormData();
	      formData.append('csv', csvText);
	      formData.append('dryRun', String(dryRun));
	      const response = await api$5.resourceAction({
	        resourceId: resource.id,
	        actionName: action.name,
	        method: 'post',
	        data: formData
	      });
	      if (response.data.notice) addNotice(response.data.notice);
	      setResults(response.data.payload?.results ?? []);
	    } catch {
	      addNotice({
	        message: 'product-csv-import-failed',
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
	    style: {
	      border: '1px solid #E2E8F0'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontSize: "xl",
	    fontWeight: "bold",
	    mb: "sm"
	  }, translateAction(action.name, resource.id)), /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60",
	    mb: "xl"
	  }, translateMessage('product-csv-description')), /*#__PURE__*/React.createElement(designSystem.Box, {
	    mb: "xl",
	    style: {
	      display: 'grid',
	      gap: 12
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Label, null, translateMessage('product-csv-file-label')), /*#__PURE__*/React.createElement(designSystem.Input, {
	    type: "file",
	    accept: ".csv,text/csv",
	    onChange: event => handleFile(event.target.files?.[0] ?? null)
	  }), /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      display: 'flex',
	      alignItems: 'center',
	      gap: 8
	    }
	  }, /*#__PURE__*/React.createElement("input", {
	    type: "checkbox",
	    checked: dryRun,
	    onChange: event => setDryRun(event.target.checked)
	  }), /*#__PURE__*/React.createElement(designSystem.Text, null, translateMessage('product-csv-dry-run'))), /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      display: 'flex',
	      gap: 12
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Button, {
	    variant: "outlined",
	    onClick: handleExport,
	    disabled: loading
	  }, translateMessage('product-csv-export')), /*#__PURE__*/React.createElement(designSystem.Button, {
	    variant: "contained",
	    color: "primary",
	    style: actionButtonStyle$7,
	    onClick: handleImport,
	    disabled: loading
	  }, loading ? translateMessage('product-csv-importing') : translateMessage('product-csv-import')))), results.length > 0 ? /*#__PURE__*/React.createElement(designSystem.Box, null, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold",
	    mb: "md"
	  }, translateMessage('product-csv-summary', {
	    created: String(summary.created),
	    updated: String(summary.updated),
	    errors: String(summary.errors)
	  })), /*#__PURE__*/React.createElement(designSystem.Table, null, /*#__PURE__*/React.createElement(designSystem.TableHead, null, /*#__PURE__*/React.createElement(designSystem.TableRow, null, /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('product-csv-row')), /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('product-csv-status')), /*#__PURE__*/React.createElement(designSystem.TableCell, null, translateMessage('product-csv-message')))), /*#__PURE__*/React.createElement(designSystem.TableBody, null, results.map(result => /*#__PURE__*/React.createElement(designSystem.TableRow, {
	    key: `${result.row}-${result.status}`
	  }, /*#__PURE__*/React.createElement(designSystem.TableCell, null, result.row), /*#__PURE__*/React.createElement(designSystem.TableCell, null, formatStatus(result.status)), /*#__PURE__*/React.createElement(designSystem.TableCell, null, result.message ?? '-')))))) : null);
	}

	const parseCsvTags = value => {
	  const parsed = value.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => tag.toLowerCase());
	  return Array.from(new Set(parsed));
	};
	const toCsv = value => {
	  if (!value) return '';
	  if (Array.isArray(value)) return value.map(v => String(v)).filter(Boolean).join(', ');
	  if (typeof value === 'string') return value;
	  return '';
	};
	function ProductTagsEdit(props) {
	  const {
	    property,
	    record,
	    onChange
	  } = props;
	  const {
	    translateProperty
	  } = adminjs.useTranslation();
	  const value = react.useMemo(() => adminjs.flat.get(record.params, property.path), [record.params, property.path]);
	  const initial = react.useMemo(() => toCsv(value), [value]);
	  const [text, setText] = react.useState(initial);
	  react.useEffect(() => {
	    setText(initial);
	  }, [initial]);
	  react.useEffect(() => {
	    if (record.id) return;
	    if (value === undefined) onChange(property.path, []);
	  }, [onChange, property.path, record.id, value]);
	  return /*#__PURE__*/React.createElement(designSystem.FormGroup, {
	    mb: "xl"
	  }, /*#__PURE__*/React.createElement(designSystem.Label, null, translateProperty(property.label, property.resourceId)), /*#__PURE__*/React.createElement(designSystem.Input, {
	    name: property.path,
	    placeholder: "popular, discount",
	    value: text,
	    onChange: e => {
	      const nextText = e.target.value;
	      setText(nextText);
	      onChange(property.path, parseCsvTags(nextText));
	    }
	  }));
	}

	const hintKeyByProperty = {
	  name: 'product-hint-name',
	  metaTitle: 'product-hint-metaTitle',
	  metaDescription: 'product-hint-metaDescription',
	  canonicalUrl: 'product-hint-canonicalUrl',
	  openGraphImage: 'product-hint-openGraphImage',
	  slug: 'product-hint-slug',
	  fullSlug: 'product-hint-fullSlug',
	  categoryName: 'product-hint-categoryName',
	  subcategoryName: 'product-hint-subcategoryName',
	  productCode: 'product-hint-productCode',
	  basePrice: 'product-hint-basePrice',
	  discountPrice: 'product-hint-discountPrice',
	  discountStartAt: 'product-hint-discountStartAt',
	  discountEndAt: 'product-hint-discountEndAt',
	  currency: 'product-hint-currency',
	  stock: 'product-hint-stock',
	  inStock: 'product-hint-inStock',
	  imageUrl: 'product-hint-imageUrl',
	  brand: 'product-hint-brand',
	  category: 'product-hint-category',
	  tags: 'product-hint-tags'
	};
	const looksLikeTranslationKey = value => typeof value === 'string' && (value.startsWith('product-') || value.startsWith('bulk-'));
	function ProductValidationErrorSummary(props) {
	  const {
	    record,
	    resource
	  } = props;
	  const {
	    translateMessage,
	    translateProperty
	  } = adminjs.useTranslation();
	  const errors = record?.errors ?? {};
	  const items = Object.entries(errors).filter(([, err]) => err && typeof err === 'object' && err.message != null);
	  if (items.length === 0) return null;
	  return /*#__PURE__*/React.createElement(designSystem.Box, {
	    variant: "white",
	    p: "xl",
	    borderRadius: "xl",
	    boxShadow: "sm",
	    mb: "xl",
	    style: {
	      border: '1px solid #FCA5A5',
	      background: '#FEF2F2'
	    }
	  }, /*#__PURE__*/React.createElement(designSystem.Text, {
	    fontWeight: "bold",
	    mb: "sm"
	  }, translateMessage('product-validation-summary-title', resource.id, {
	    count: items.length
	  })), /*#__PURE__*/React.createElement(designSystem.Text, {
	    color: "grey60",
	    mb: "lg"
	  }, translateMessage('product-validation-summary-subtitle')), /*#__PURE__*/React.createElement(designSystem.Box, {
	    style: {
	      display: 'flex',
	      flexDirection: 'column',
	      gap: 12
	    }
	  }, items.map(([propertyPath, err]) => {
	    const message = err.message;
	    const messageText = looksLikeTranslationKey(message) ? translateMessage(message) : String(message ?? '');
	    const hintKey = hintKeyByProperty[propertyPath];
	    return /*#__PURE__*/React.createElement(designSystem.Box, {
	      key: propertyPath,
	      style: {
	        padding: 12,
	        borderRadius: 12,
	        border: '1px solid #FECACA'
	      }
	    }, /*#__PURE__*/React.createElement(designSystem.Text, {
	      fontWeight: "bold"
	    }, translateProperty(propertyPath, resource.id)), /*#__PURE__*/React.createElement(designSystem.Text, null, messageText), hintKey ? /*#__PURE__*/React.createElement(designSystem.Text, {
	      color: "grey60",
	      style: {
	        fontSize: 13,
	        marginTop: 6
	      }
	    }, translateMessage(hintKey)) : null);
	  })));
	}

	function ProductNew(props) {
	  return /*#__PURE__*/React.createElement(designSystem.Box, null, /*#__PURE__*/React.createElement(ProductValidationErrorSummary, props), /*#__PURE__*/React.createElement(adminjs.OriginalNew, props));
	}

	function ProductEdit(props) {
	  return /*#__PURE__*/React.createElement(designSystem.Box, null, /*#__PURE__*/React.createElement(ProductValidationErrorSummary, props), /*#__PURE__*/React.createElement(adminjs.OriginalEdit, props));
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

	function isNil$1(value) {
	  return value == null;
	}

	var isNil_1 = isNil$1;

	var isNil = /*@__PURE__*/getDefaultExportFromCjs(isNil_1);

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
	var Map$4 = getNative$6(root$5, 'Map');

	var _Map = Map$4;

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
	    Map$3 = _Map;

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
	    'map': new (Map$3 || ListCache$2),
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
	    Map$2 = _Map,
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
	    if (!Map$2 || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
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
	var Set$2 = getNative$2(root$1, 'Set');

	var _Set = Set$2;

	var getNative$1 = _getNative,
	    root = _root;

	/* Built-in method references that are verified to be native. */
	var WeakMap$1 = getNative$1(root, 'WeakMap');

	var _WeakMap = WeakMap$1;

	var DataView = _DataView,
	    Map$1 = _Map,
	    Promise$1 = _Promise,
	    Set$1 = _Set,
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
	    mapCtorString = toSource(Map$1),
	    promiseCtorString = toSource(Promise$1),
	    setCtorString = toSource(Set$1),
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
	    (Map$1 && getTag$1(new Map$1) != mapTag) ||
	    (Promise$1 && getTag$1(Promise$1.resolve()) != promiseTag) ||
	    (Set$1 && getTag$1(new Set$1) != setTag) ||
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
	function pickBy$1(object, predicate) {
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

	var pickBy_1 = pickBy$1;

	var pickBy = /*@__PURE__*/getDefaultExportFromCjs(pickBy_1);

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
	      filters: pickBy(filter, v => !isNil(v)),
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
	AdminJS.UserComponents.ProductVariantMatrix = ProductVariantMatrix;
	AdminJS.UserComponents.ProductCsvImportExportAction = ProductCsvImportExportAction;
	AdminJS.UserComponents.ProductTagsEdit = ProductTagsEdit;
	AdminJS.UserComponents.ProductNew = ProductNew;
	AdminJS.UserComponents.ProductEdit = ProductEdit;
	AdminJS.UserComponents.ProductActivityTimeline = ProductActivityTimeline;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9PcmRlclN0YXR1c0FjdGlvbi50c3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9DYW5jZWxPcmRlckFjdGlvbi50c3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9PcmRlckF1ZGl0VGltZWxpbmVBY3Rpb24udHN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvT3JkZXJTaG93LnRzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL09yZGVyRnVsZmlsbG1lbnRBY3Rpb24udHN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvT3JkZXJQYWNraW5nU2xpcEFjdGlvbi50c3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9PcmRlclRvdGFsTGlzdC50c3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9PcmRlclRvdGFsUmFuZ2VGaWx0ZXIudHN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvU2VsZWN0RmlsdGVyV2l0aFBsYWNlaG9sZGVyLnRzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL1VzZXJTaG93LnRzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL1VzZXJTZWdtZW50cy50c3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9Qcm9kdWN0U2NoZWR1bGVEaXNjb3VudEFjdGlvbi50c3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9Qcm9kdWN0TmFtZUxpc3QudHN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvUHJvZHVjdExpc3QudHN4IiwiLi4vc3JjL2NvbnN0YW50cy9sb2NhbGVzLnRzIiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvUHJvZHVjdEFjdGl2aXR5VGltZWxpbmUudHN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvUHJvZHVjdFNob3cudHN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvUHJvZHVjdFZhcmlhbnRNYXRyaXgudHN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvUHJvZHVjdENzdkltcG9ydEV4cG9ydEFjdGlvbi50c3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9Qcm9kdWN0VGFnc0VkaXQudHN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvUHJvZHVjdFZhbGlkYXRpb25FcnJvclN1bW1hcnkudHN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvUHJvZHVjdE5ldy50c3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9Qcm9kdWN0RWRpdC50c3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9Qcm9kdWN0QnVsa1NldENhdGVnb3J5QWN0aW9uLnRzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL1Byb2R1Y3RCdWxrU2V0QnJhbmRBY3Rpb24udHN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvUHJvZHVjdEJ1bGtFZGl0VGFnc0FjdGlvbi50c3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9Qcm9kdWN0QnVsa0FkanVzdFByaWNlQWN0aW9uLnRzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL1Byb2R1Y3RCdWxrVG9nZ2xlSW5TdG9ja0FjdGlvbi50c3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9EYXNoYm9hcmQudHN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvTG9naW4udHN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvTG9nZ2VkSW4udHN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvVG9wQmFyLnRzeCIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNOaWwuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19hcnJheU1hcC5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2xpc3RDYWNoZUNsZWFyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9lcS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Fzc29jSW5kZXhPZi5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2xpc3RDYWNoZURlbGV0ZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2xpc3RDYWNoZUdldC5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2xpc3RDYWNoZUhhcy5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2xpc3RDYWNoZVNldC5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX0xpc3RDYWNoZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX3N0YWNrQ2xlYXIuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19zdGFja0RlbGV0ZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX3N0YWNrR2V0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fc3RhY2tIYXMuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19mcmVlR2xvYmFsLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fcm9vdC5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX1N5bWJvbC5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldFJhd1RhZy5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX29iamVjdFRvU3RyaW5nLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUdldFRhZy5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNPYmplY3QuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL2lzRnVuY3Rpb24uanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19jb3JlSnNEYXRhLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faXNNYXNrZWQuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL190b1NvdXJjZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VJc05hdGl2ZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldFZhbHVlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZ2V0TmF0aXZlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fTWFwLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbmF0aXZlQ3JlYXRlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faGFzaENsZWFyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faGFzaERlbGV0ZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2hhc2hHZXQuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19oYXNoSGFzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faGFzaFNldC5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX0hhc2guanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19tYXBDYWNoZUNsZWFyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faXNLZXlhYmxlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZ2V0TWFwRGF0YS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX21hcENhY2hlRGVsZXRlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbWFwQ2FjaGVHZXQuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19tYXBDYWNoZUhhcy5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX21hcENhY2hlU2V0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fTWFwQ2FjaGUuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19zdGFja1NldC5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX1N0YWNrLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fc2V0Q2FjaGVBZGQuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19zZXRDYWNoZUhhcy5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX1NldENhY2hlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYXJyYXlTb21lLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fY2FjaGVIYXMuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19lcXVhbEFycmF5cy5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX1VpbnQ4QXJyYXkuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19tYXBUb0FycmF5LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fc2V0VG9BcnJheS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2VxdWFsQnlUYWcuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19hcnJheVB1c2guanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL2lzQXJyYXkuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlR2V0QWxsS2V5cy5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2FycmF5RmlsdGVyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9zdHViQXJyYXkuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19nZXRTeW1ib2xzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZVRpbWVzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9pc09iamVjdExpa2UuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlSXNBcmd1bWVudHMuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL2lzQXJndW1lbnRzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9zdHViRmFsc2UuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL2lzQnVmZmVyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faXNJbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNMZW5ndGguanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlSXNUeXBlZEFycmF5LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZVVuYXJ5LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbm9kZVV0aWwuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL2lzVHlwZWRBcnJheS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2FycmF5TGlrZUtleXMuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19pc1Byb3RvdHlwZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX292ZXJBcmcuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19uYXRpdmVLZXlzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUtleXMuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL2lzQXJyYXlMaWtlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9rZXlzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZ2V0QWxsS2V5cy5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2VxdWFsT2JqZWN0cy5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX0RhdGFWaWV3LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fUHJvbWlzZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX1NldC5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX1dlYWtNYXAuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19nZXRUYWcuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlSXNFcXVhbERlZXAuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlSXNFcXVhbC5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VJc01hdGNoLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faXNTdHJpY3RDb21wYXJhYmxlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZ2V0TWF0Y2hEYXRhLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbWF0Y2hlc1N0cmljdENvbXBhcmFibGUuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlTWF0Y2hlcy5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNTeW1ib2wuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19pc0tleS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvbWVtb2l6ZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX21lbW9pemVDYXBwZWQuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19zdHJpbmdUb1BhdGguanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlVG9TdHJpbmcuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL3RvU3RyaW5nLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fY2FzdFBhdGguanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL190b0tleS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VHZXQuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL2dldC5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VIYXNJbi5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2hhc1BhdGguanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL2hhc0luLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZU1hdGNoZXNQcm9wZXJ0eS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaWRlbnRpdHkuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlUHJvcGVydHkuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlUHJvcGVydHlEZWVwLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9wcm9wZXJ0eS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VJdGVyYXRlZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2RlZmluZVByb3BlcnR5LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUFzc2lnblZhbHVlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYXNzaWduVmFsdWUuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlU2V0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZVBpY2tCeS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldFByb3RvdHlwZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldFN5bWJvbHNJbi5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX25hdGl2ZUtleXNJbi5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VLZXlzSW4uanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL2tleXNJbi5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldEFsbEtleXNJbi5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvcGlja0J5LmpzIiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvRmlsdGVyRHJhd2VyLnRzeCIsImVudHJ5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHVzZU1lbW8sIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQXBpQ2xpZW50LCB0eXBlIEFjdGlvblByb3BzLCB1c2VOb3RpY2UsIHVzZVRyYW5zbGF0aW9uIH0gZnJvbSAnYWRtaW5qcyc7XG5pbXBvcnQgeyBCYWRnZSwgQm94LCBCdXR0b24sIEZvcm1Hcm91cCwgU2VsZWN0LCBUZXh0IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSc7XG5cbnR5cGUgT3JkZXJTdGF0dXMgPSAnUEVORElORycgfCAnUEFJRCcgfCAnU0hJUFBFRCcgfCAnREVMSVZFUkVEJyB8ICdDQU5DRUxMRUQnO1xudHlwZSBTdGF0dXNPcHRpb24gPSB7IHZhbHVlOiBPcmRlclN0YXR1czsgbGFiZWw6IHN0cmluZyB9O1xuXG5jb25zdCBhcGkgPSBuZXcgQXBpQ2xpZW50KCk7XG5cbmNvbnN0IHN0YXR1c2VzOiBPcmRlclN0YXR1c1tdID0gWydQRU5ESU5HJywgJ1BBSUQnLCAnU0hJUFBFRCcsICdERUxJVkVSRUQnLCAnQ0FOQ0VMTEVEJ107XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIE9yZGVyU3RhdHVzQWN0aW9uKHsgYWN0aW9uLCByZWNvcmQsIHJlc291cmNlIH06IEFjdGlvblByb3BzKSB7XG5cdGNvbnN0IFtsb2NhbFJlY29yZCwgc2V0TG9jYWxSZWNvcmRdID0gdXNlU3RhdGUocmVjb3JkKTtcblx0Y29uc3QgW3NlbGVjdGVkU3RhdHVzLCBzZXRTZWxlY3RlZFN0YXR1c10gPSB1c2VTdGF0ZTxPcmRlclN0YXR1cz4oXG5cdFx0KHJlY29yZD8ucGFyYW1zLnN0YXR1cyBhcyBPcmRlclN0YXR1cykgPz8gJ1BFTkRJTkcnXG5cdCk7XG5cdGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcblx0Y29uc3QgYWRkTm90aWNlID0gdXNlTm90aWNlKCk7XG5cdGNvbnN0IHsgdHJhbnNsYXRlQWN0aW9uLCB0cmFuc2xhdGVMYWJlbCwgdHJhbnNsYXRlTWVzc2FnZSB9ID0gdXNlVHJhbnNsYXRpb24oKTtcblxuXHRpZiAoIWxvY2FsUmVjb3JkKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxCb3ggdmFyaWFudD0nd2hpdGUnIHA9J3hsJz5cblx0XHRcdFx0PFRleHQ+e3RyYW5zbGF0ZU1lc3NhZ2UoJ3N0YXR1cy11cGRhdGUtZmFpbGVkJyl9PC9UZXh0PlxuXHRcdFx0PC9Cb3g+XG5cdFx0KTtcblx0fVxuXG5cdGNvbnN0IGN1cnJlbnRTdGF0dXMgPSBsb2NhbFJlY29yZC5wYXJhbXMuc3RhdHVzIGFzIE9yZGVyU3RhdHVzIHwgdW5kZWZpbmVkO1xuXHRjb25zdCBzdGF0dXNPcHRpb25zID0gdXNlTWVtbzxTdGF0dXNPcHRpb25bXT4oXG5cdFx0KCkgPT5cblx0XHRcdHN0YXR1c2VzLm1hcCgoc3RhdHVzKSA9PiAoe1xuXHRcdFx0XHR2YWx1ZTogc3RhdHVzLFxuXHRcdFx0XHRsYWJlbDogdHJhbnNsYXRlTGFiZWwoYHN0YXR1cy4ke3N0YXR1c31gLCByZXNvdXJjZS5pZCksXG5cdFx0XHR9KSksXG5cdFx0W3Jlc291cmNlLmlkLCB0cmFuc2xhdGVMYWJlbF1cblx0KTtcblx0Y29uc3QgY3VycmVudExhYmVsID0gY3VycmVudFN0YXR1c1xuXHRcdD8gdHJhbnNsYXRlTGFiZWwoYHN0YXR1cy4ke2N1cnJlbnRTdGF0dXN9YCwgcmVzb3VyY2UuaWQpXG5cdFx0OiB0cmFuc2xhdGVNZXNzYWdlKCdzdGF0dXMtdW5rbm93bicpO1xuXHRjb25zdCBzZWxlY3RlZE9wdGlvbiA9IHN0YXR1c09wdGlvbnMuZmluZCgob3B0aW9uKSA9PiBvcHRpb24udmFsdWUgPT09IHNlbGVjdGVkU3RhdHVzKSA/PyBudWxsO1xuXHRjb25zdCBuZXh0TGFiZWwgPSBzZWxlY3RlZFN0YXR1cyA/IHRyYW5zbGF0ZUxhYmVsKGBzdGF0dXMuJHtzZWxlY3RlZFN0YXR1c31gLCByZXNvdXJjZS5pZCkgOiBudWxsO1xuXG5cdGNvbnN0IGhhbmRsZUNsaWNrID0gYXN5bmMgKCkgPT4ge1xuXHRcdGlmICghbG9jYWxSZWNvcmQgfHwgIXNlbGVjdGVkU3RhdHVzKSByZXR1cm47XG5cdFx0c2V0TG9hZGluZyh0cnVlKTtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcblx0XHRcdGZvcm1EYXRhLmFwcGVuZCgnc3RhdHVzJywgc2VsZWN0ZWRTdGF0dXMpO1xuXHRcdFx0Y29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhcGkucmVjb3JkQWN0aW9uKHtcblx0XHRcdFx0cmVzb3VyY2VJZDogcmVzb3VyY2UuaWQsXG5cdFx0XHRcdHJlY29yZElkOiBsb2NhbFJlY29yZC5pZCxcblx0XHRcdFx0YWN0aW9uTmFtZTogYWN0aW9uLm5hbWUsXG5cdFx0XHRcdG1ldGhvZDogJ3Bvc3QnLFxuXHRcdFx0XHRkYXRhOiBmb3JtRGF0YSxcblx0XHRcdH0pO1xuXHRcdFx0aWYgKHJlc3BvbnNlLmRhdGEubm90aWNlPy50eXBlID09PSAnZXJyb3InKSB7XG5cdFx0XHRcdGFkZE5vdGljZShyZXNwb25zZS5kYXRhLm5vdGljZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRhZGROb3RpY2Uoe1xuXHRcdFx0XHRcdG1lc3NhZ2U6ICdzdGF0dXMtdXBkYXRlZCcsXG5cdFx0XHRcdFx0dHlwZTogJ3N1Y2Nlc3MnLFxuXHRcdFx0XHRcdG9wdGlvbnM6IHsgc3RhdHVzOiBuZXh0TGFiZWwgPz8gc2VsZWN0ZWRTdGF0dXMgfSxcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRpZiAocmVzcG9uc2UuZGF0YS5yZWNvcmQpIHtcblx0XHRcdFx0c2V0TG9jYWxSZWNvcmQocmVzcG9uc2UuZGF0YS5yZWNvcmQpO1xuXHRcdFx0fVxuXHRcdH0gY2F0Y2gge1xuXHRcdFx0YWRkTm90aWNlKHsgbWVzc2FnZTogJ3N0YXR1cy11cGRhdGUtZmFpbGVkJywgdHlwZTogJ2Vycm9yJyB9KTtcblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0c2V0TG9hZGluZyhmYWxzZSk7XG5cdFx0fVxuXHR9O1xuXG5cdGNvbnN0IGJ1dHRvbkxhYmVsID0gbG9hZGluZ1xuXHRcdD8gdHJhbnNsYXRlTWVzc2FnZSgnc3RhdHVzLXVwZGF0ZS1wcm9ncmVzcycpXG5cdFx0OiB0cmFuc2xhdGVNZXNzYWdlKCdhcHBseS1zdGF0dXMnKTtcblx0Y29uc3QgdGl0bGUgPSB0cmFuc2xhdGVBY3Rpb24oYWN0aW9uLm5hbWUsIHJlc291cmNlLmlkKTtcblxuXHRyZXR1cm4gKFxuXHRcdDxCb3hcblx0XHRcdHZhcmlhbnQ9J3doaXRlJ1xuXHRcdFx0cD0neHhsJ1xuXHRcdFx0Ym9yZGVyUmFkaXVzPSd4bCdcblx0XHRcdGJveFNoYWRvdz0nc20nXG5cdFx0XHRtYXhXaWR0aD0nNjgwcHgnXG5cdFx0XHRzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQgI0UyRThGMCcgfX1cblx0XHQ+XG5cdFx0XHQ8Qm94IGRpc3BsYXk9J2ZsZXgnIGFsaWduSXRlbXM9J2NlbnRlcicganVzdGlmeUNvbnRlbnQ9J3NwYWNlLWJldHdlZW4nIG1iPSd4bCc+XG5cdFx0XHRcdDxUZXh0IGZvbnRTaXplPSd4bCcgZm9udFdlaWdodD0nYm9sZCc+XG5cdFx0XHRcdFx0e3RpdGxlfVxuXHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHQ8L0JveD5cblx0XHRcdDxCb3ggc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywgZ2FwOiAyNCB9fT5cblx0XHRcdFx0PEJveCBkaXNwbGF5PSdmbGV4JyBhbGlnbkl0ZW1zPSdjZW50ZXInPlxuXHRcdFx0XHRcdDxUZXh0IGZvbnRTaXplPSdsZycgZm9udFdlaWdodD0nNTAwJyBtcj0nbGcnPlxuXHRcdFx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoJ2N1cnJlbnQtc3RhdHVzJyl9XG5cdFx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0XHRcdDxCYWRnZVxuXHRcdFx0XHRcdFx0Zm9udFNpemU9J21kJ1xuXHRcdFx0XHRcdFx0b3V0bGluZVxuXHRcdFx0XHRcdFx0c3R5bGU9e3tcblx0XHRcdFx0XHRcdFx0YmFja2dyb3VuZDogJyNDNkY2RDUnLFxuXHRcdFx0XHRcdFx0XHRib3JkZXJDb2xvcjogJyMzOEExNjknLFxuXHRcdFx0XHRcdFx0XHRjb2xvcjogJyMyMjU0M0QnLFxuXHRcdFx0XHRcdFx0fX1cblx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHR7Y3VycmVudExhYmVsfVxuXHRcdFx0XHRcdDwvQmFkZ2U+XG5cdFx0XHRcdDwvQm94PlxuXHRcdFx0XHQ8Rm9ybUdyb3VwIGxhYmVsPXt0cmFuc2xhdGVNZXNzYWdlKCdzZWxlY3Qtc3RhdHVzJyl9IG1iPScwJz5cblx0XHRcdFx0XHQ8U2VsZWN0XG5cdFx0XHRcdFx0XHRpc0NsZWFyYWJsZT17ZmFsc2V9XG5cdFx0XHRcdFx0XHRvcHRpb25zPXtzdGF0dXNPcHRpb25zfVxuXHRcdFx0XHRcdFx0dmFsdWU9e3NlbGVjdGVkT3B0aW9ufVxuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyhvcHRpb246IFN0YXR1c09wdGlvbiB8IG51bGwpID0+IHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgdmFsdWUgPSBvcHRpb24/LnZhbHVlO1xuXHRcdFx0XHRcdFx0XHRzZXRTZWxlY3RlZFN0YXR1cyh2YWx1ZSA/PyBjdXJyZW50U3RhdHVzID8/ICdQRU5ESU5HJyk7XG5cdFx0XHRcdFx0XHR9fVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdDwvRm9ybUdyb3VwPlxuXHRcdFx0XHR7bmV4dExhYmVsID8gKFxuXHRcdFx0XHRcdDxCb3ggZGlzcGxheT0nZmxleCcgYWxpZ25JdGVtcz0nY2VudGVyJz5cblx0XHRcdFx0XHRcdDxUZXh0IGZvbnRXZWlnaHQ9JzUwMCcgZm9udFNpemU9J2xnJyBtcj0nbGcnPlxuXHRcdFx0XHRcdFx0XHR7dHJhbnNsYXRlTWVzc2FnZSgnbmV3LXN0YXR1cycpfVxuXHRcdFx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0XHRcdFx0PEJhZGdlXG5cdFx0XHRcdFx0XHRcdGZvbnRTaXplPSdtZCdcblx0XHRcdFx0XHRcdFx0b3V0bGluZVxuXHRcdFx0XHRcdFx0XHRzdHlsZT17e1xuXHRcdFx0XHRcdFx0XHRcdGJhY2tncm91bmQ6ICcjQzZGNkQ1Jyxcblx0XHRcdFx0XHRcdFx0XHRib3JkZXJDb2xvcjogJyMzOEExNjknLFxuXHRcdFx0XHRcdFx0XHRcdGNvbG9yOiAnIzIyNTQzRCcsXG5cdFx0XHRcdFx0XHRcdH19XG5cdFx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHRcdHtuZXh0TGFiZWx9XG5cdFx0XHRcdFx0XHQ8L0JhZGdlPlxuXHRcdFx0XHRcdDwvQm94PlxuXHRcdFx0XHQpIDogbnVsbH1cblx0XHRcdFx0PEJveD5cblx0XHRcdFx0XHQ8QnV0dG9uXG5cdFx0XHRcdFx0XHRzdHlsZT17e1xuXHRcdFx0XHRcdFx0XHRib3JkZXJDb2xvcjogJ3doaXRlJyxcblx0XHRcdFx0XHRcdFx0YmFja2dyb3VuZDogJyNmYWNjMTUnLFxuXHRcdFx0XHRcdFx0XHRjb2xvcjogJ2JsYWNrJyxcblx0XHRcdFx0XHRcdH19XG5cdFx0XHRcdFx0XHR2YXJpYW50PSdjb250YWluZWQnXG5cdFx0XHRcdFx0XHRjb2xvcj0ncHJpbWFyeSdcblx0XHRcdFx0XHRcdG9uQ2xpY2s9e2hhbmRsZUNsaWNrfVxuXHRcdFx0XHRcdFx0ZGlzYWJsZWQ9eyFzZWxlY3RlZFN0YXR1cyB8fCBsb2FkaW5nfVxuXHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdHtidXR0b25MYWJlbH1cblx0XHRcdFx0XHQ8L0J1dHRvbj5cblx0XHRcdFx0PC9Cb3g+XG5cdFx0XHQ8L0JveD5cblx0XHQ8L0JveD5cblx0KTtcbn1cbiIsImltcG9ydCB7IHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQXBpQ2xpZW50LCB0eXBlIEFjdGlvblByb3BzLCB1c2VOb3RpY2UsIHVzZVRyYW5zbGF0aW9uIH0gZnJvbSAnYWRtaW5qcyc7XG5pbXBvcnQgeyBCb3gsIEJ1dHRvbiwgVGV4dCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xuXG5jb25zdCBhcGkgPSBuZXcgQXBpQ2xpZW50KCk7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIENhbmNlbE9yZGVyQWN0aW9uKHsgYWN0aW9uLCByZWNvcmQsIHJlc291cmNlIH06IEFjdGlvblByb3BzKSB7XG5cdGNvbnN0IFtsb2NhbFJlY29yZCwgc2V0TG9jYWxSZWNvcmRdID0gdXNlU3RhdGUocmVjb3JkKTtcblx0Y29uc3QgW3JlZnVuZFBheW1lbnQsIHNldFJlZnVuZFBheW1lbnRdID0gdXNlU3RhdGUoZmFsc2UpO1xuXHRjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG5cdGNvbnN0IGFkZE5vdGljZSA9IHVzZU5vdGljZSgpO1xuXHRjb25zdCB7IHRyYW5zbGF0ZUFjdGlvbiwgdHJhbnNsYXRlTWVzc2FnZSB9ID0gdXNlVHJhbnNsYXRpb24oKTtcblxuXHRpZiAoIWxvY2FsUmVjb3JkKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxCb3ggdmFyaWFudD0nd2hpdGUnIHA9J3hsJz5cblx0XHRcdFx0PFRleHQ+e3RyYW5zbGF0ZU1lc3NhZ2UoJ3N0YXR1cy11cGRhdGUtZmFpbGVkJyl9PC9UZXh0PlxuXHRcdFx0PC9Cb3g+XG5cdFx0KTtcblx0fVxuXG5cdGNvbnN0IHN0cmlwZVNlc3Npb25JZCA9IGxvY2FsUmVjb3JkLnBhcmFtcy5zdHJpcGVTZXNzaW9uSWQgYXMgc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHRjb25zdCBjYW5SZWZ1bmQgPSBCb29sZWFuKHN0cmlwZVNlc3Npb25JZCk7XG5cdGNvbnN0IHRpdGxlID0gdHJhbnNsYXRlQWN0aW9uKGFjdGlvbi5uYW1lLCByZXNvdXJjZS5pZCk7XG5cdGNvbnN0IGJ1dHRvbkxhYmVsID0gbG9hZGluZyA/IHRyYW5zbGF0ZU1lc3NhZ2UoJ2NhbmNlbC1vcmRlci1wcm9ncmVzcycpIDogdGl0bGU7XG5cblx0Y29uc3QgaGFuZGxlQ2FuY2VsID0gYXN5bmMgKCkgPT4ge1xuXHRcdGlmICghbG9jYWxSZWNvcmQpIHJldHVybjtcblx0XHRzZXRMb2FkaW5nKHRydWUpO1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuXHRcdFx0Zm9ybURhdGEuYXBwZW5kKCdyZWZ1bmQnLCByZWZ1bmRQYXltZW50ID8gJ3RydWUnIDogJ2ZhbHNlJyk7XG5cdFx0XHRjb25zdCByZXNwb25zZSA9IGF3YWl0IGFwaS5yZWNvcmRBY3Rpb24oe1xuXHRcdFx0XHRyZXNvdXJjZUlkOiByZXNvdXJjZS5pZCxcblx0XHRcdFx0cmVjb3JkSWQ6IGxvY2FsUmVjb3JkLmlkLFxuXHRcdFx0XHRhY3Rpb25OYW1lOiBhY3Rpb24ubmFtZSxcblx0XHRcdFx0bWV0aG9kOiAncG9zdCcsXG5cdFx0XHRcdGRhdGE6IGZvcm1EYXRhLFxuXHRcdFx0fSk7XG5cdFx0XHRpZiAocmVzcG9uc2UuZGF0YS5ub3RpY2UpIHtcblx0XHRcdFx0YWRkTm90aWNlKHJlc3BvbnNlLmRhdGEubm90aWNlKTtcblx0XHRcdH1cblx0XHRcdGlmIChyZXNwb25zZS5kYXRhLnJlY29yZCkge1xuXHRcdFx0XHRzZXRMb2NhbFJlY29yZChyZXNwb25zZS5kYXRhLnJlY29yZCk7XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCB7XG5cdFx0XHRhZGROb3RpY2UoeyBtZXNzYWdlOiAnc3RhdHVzLXVwZGF0ZS1mYWlsZWQnLCB0eXBlOiAnZXJyb3InIH0pO1xuXHRcdH0gZmluYWxseSB7XG5cdFx0XHRzZXRMb2FkaW5nKGZhbHNlKTtcblx0XHR9XG5cdH07XG5cblx0cmV0dXJuIChcblx0XHQ8Qm94XG5cdFx0XHR2YXJpYW50PSd3aGl0ZSdcblx0XHRcdHA9J3h4bCdcblx0XHRcdGJvcmRlclJhZGl1cz0neGwnXG5cdFx0XHRib3hTaGFkb3c9J3NtJ1xuXHRcdFx0bWF4V2lkdGg9JzY4MHB4J1xuXHRcdFx0c3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnIH19XG5cdFx0PlxuXHRcdFx0PEJveCBkaXNwbGF5PSdmbGV4JyBhbGlnbkl0ZW1zPSdjZW50ZXInIGp1c3RpZnlDb250ZW50PSdzcGFjZS1iZXR3ZWVuJyBtYj0neGwnPlxuXHRcdFx0XHQ8VGV4dCBmb250U2l6ZT0neGwnIGZvbnRXZWlnaHQ9J2JvbGQnPlxuXHRcdFx0XHRcdHt0aXRsZX1cblx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0PC9Cb3g+XG5cdFx0XHQ8Qm94IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGdhcDogMTYgfX0+XG5cdFx0XHRcdDxCb3hcblx0XHRcdFx0XHRhcz0nbGFiZWwnXG5cdFx0XHRcdFx0ZGlzcGxheT0nZmxleCdcblx0XHRcdFx0XHRhbGlnbkl0ZW1zPSdjZW50ZXInXG5cdFx0XHRcdFx0c3R5bGU9e3sgZ2FwOiAxMCwgY3Vyc29yOiBjYW5SZWZ1bmQgPyAncG9pbnRlcicgOiAnbm90LWFsbG93ZWQnIH19XG5cdFx0XHRcdD5cblx0XHRcdFx0XHQ8aW5wdXRcblx0XHRcdFx0XHRcdHR5cGU9J2NoZWNrYm94J1xuXHRcdFx0XHRcdFx0Y2hlY2tlZD17cmVmdW5kUGF5bWVudH1cblx0XHRcdFx0XHRcdGRpc2FibGVkPXshY2FuUmVmdW5kfVxuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyhldmVudCkgPT4gc2V0UmVmdW5kUGF5bWVudChldmVudC50YXJnZXQuY2hlY2tlZCl9XG5cdFx0XHRcdFx0XHRzdHlsZT17eyB3aWR0aDogMTYsIGhlaWdodDogMTYgfX1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHRcdDxUZXh0Pnt0cmFuc2xhdGVNZXNzYWdlKCdyZWZ1bmQtcGF5bWVudCcpfTwvVGV4dD5cblx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdHshY2FuUmVmdW5kID8gKFxuXHRcdFx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnIGZvbnRTaXplPSdzbSc+XG5cdFx0XHRcdFx0XHR7dHJhbnNsYXRlTWVzc2FnZSgncmVmdW5kLXBheW1lbnQtaGludCcpfVxuXHRcdFx0XHRcdDwvVGV4dD5cblx0XHRcdFx0KSA6IG51bGx9XG5cdFx0XHRcdDxCb3g+XG5cdFx0XHRcdFx0PEJ1dHRvblxuXHRcdFx0XHRcdFx0c3R5bGU9e3tcblx0XHRcdFx0XHRcdFx0Ym9yZGVyQ29sb3I6ICd3aGl0ZScsXG5cdFx0XHRcdFx0XHRcdGJhY2tncm91bmQ6ICcjZmFjYzE1Jyxcblx0XHRcdFx0XHRcdFx0Y29sb3I6ICdibGFjaycsXG5cdFx0XHRcdFx0XHR9fVxuXHRcdFx0XHRcdFx0dmFyaWFudD0nY29udGFpbmVkJ1xuXHRcdFx0XHRcdFx0Y29sb3I9J3ByaW1hcnknXG5cdFx0XHRcdFx0XHRvbkNsaWNrPXtoYW5kbGVDYW5jZWx9XG5cdFx0XHRcdFx0XHRkaXNhYmxlZD17bG9hZGluZ31cblx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHR7YnV0dG9uTGFiZWx9XG5cdFx0XHRcdFx0PC9CdXR0b24+XG5cdFx0XHRcdDwvQm94PlxuXHRcdFx0PC9Cb3g+XG5cdFx0PC9Cb3g+XG5cdCk7XG59XG4iLCJpbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBBcGlDbGllbnQsIHR5cGUgQWN0aW9uUHJvcHMsIHVzZU5vdGljZSwgdXNlVHJhbnNsYXRpb24gfSBmcm9tICdhZG1pbmpzJztcbmltcG9ydCB7IEJhZGdlLCBCb3gsIEJ1dHRvbiwgSWNvbiwgTGFiZWwsIFRleHQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcblxuY29uc3QgYXBpID0gbmV3IEFwaUNsaWVudCgpO1xuXG50eXBlIE9yZGVyU3RhdHVzID0gJ1BFTkRJTkcnIHwgJ1BBSUQnIHwgJ1NISVBQRUQnIHwgJ0RFTElWRVJFRCcgfCAnQ0FOQ0VMTEVEJztcblxudHlwZSBBdWRpdEVudHJ5ID0ge1xuXHRpZDogc3RyaW5nO1xuXHR0eXBlOiAnU1RBVFVTX0NIQU5HRScgfCAnTk9URSc7XG5cdGZyb21TdGF0dXM6IE9yZGVyU3RhdHVzIHwgbnVsbDtcblx0dG9TdGF0dXM6IE9yZGVyU3RhdHVzIHwgbnVsbDtcblx0bm90ZTogc3RyaW5nIHwgbnVsbDtcblx0YWRtaW5FbWFpbDogc3RyaW5nIHwgbnVsbDtcblx0Y3JlYXRlZEF0OiBzdHJpbmc7XG59O1xuXG5jb25zdCBleHRyYWN0RW50cmllcyA9IChwYXlsb2FkOiB1bmtub3duKTogQXVkaXRFbnRyeVtdID0+IHtcblx0aWYgKCFwYXlsb2FkIHx8IHR5cGVvZiBwYXlsb2FkICE9PSAnb2JqZWN0JykgcmV0dXJuIFtdO1xuXHRjb25zdCBlbnRyaWVzID0gKHBheWxvYWQgYXMgeyBlbnRyaWVzPzogQXVkaXRFbnRyeVtdIH0pLmVudHJpZXM7XG5cdHJldHVybiBBcnJheS5pc0FycmF5KGVudHJpZXMpID8gZW50cmllcyA6IFtdO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gT3JkZXJBdWRpdFRpbWVsaW5lQWN0aW9uKHsgYWN0aW9uLCByZWNvcmQsIHJlc291cmNlIH06IEFjdGlvblByb3BzKSB7XG5cdGNvbnN0IFtlbnRyaWVzLCBzZXRFbnRyaWVzXSA9IHVzZVN0YXRlPEF1ZGl0RW50cnlbXT4oW10pO1xuXHRjb25zdCBbbm90ZSwgc2V0Tm90ZV0gPSB1c2VTdGF0ZSgnJyk7XG5cdGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcblx0Y29uc3QgW3NhdmluZywgc2V0U2F2aW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcblx0Y29uc3QgYWRkTm90aWNlID0gdXNlTm90aWNlKCk7XG5cdGNvbnN0IHsgdHJhbnNsYXRlQWN0aW9uLCB0cmFuc2xhdGVMYWJlbCwgdHJhbnNsYXRlTWVzc2FnZSB9ID0gdXNlVHJhbnNsYXRpb24oKTtcblx0Y29uc3QgcmVjb3JkSWQgPSByZWNvcmQ/LmlkO1xuXHRjb25zdCBhZGROb3RpY2VSZWYgPSB1c2VSZWYoYWRkTm90aWNlKTtcblxuXHR1c2VFZmZlY3QoKCkgPT4ge1xuXHRcdGFkZE5vdGljZVJlZi5jdXJyZW50ID0gYWRkTm90aWNlO1xuXHR9LCBbYWRkTm90aWNlXSk7XG5cblx0dXNlRWZmZWN0KCgpID0+IHtcblx0XHRpZiAoIXJlY29yZElkKSByZXR1cm47XG5cdFx0bGV0IGlzQWN0aXZlID0gdHJ1ZTtcblx0XHRzZXRMb2FkaW5nKHRydWUpO1xuXHRcdGFwaS5yZWNvcmRBY3Rpb24oe1xuXHRcdFx0cmVzb3VyY2VJZDogcmVzb3VyY2UuaWQsXG5cdFx0XHRyZWNvcmRJZCxcblx0XHRcdGFjdGlvbk5hbWU6IGFjdGlvbi5uYW1lLFxuXHRcdFx0bWV0aG9kOiAnZ2V0Jyxcblx0XHR9KVxuXHRcdFx0LnRoZW4oKHJlc3BvbnNlKSA9PiB7XG5cdFx0XHRcdGlmICghaXNBY3RpdmUpIHJldHVybjtcblx0XHRcdFx0Y29uc3QgcGF5bG9hZEVudHJpZXMgPSBleHRyYWN0RW50cmllcyhyZXNwb25zZS5kYXRhLnBheWxvYWQpO1xuXHRcdFx0XHRzZXRFbnRyaWVzKHBheWxvYWRFbnRyaWVzKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goKCkgPT4ge1xuXHRcdFx0XHRpZiAoIWlzQWN0aXZlKSByZXR1cm47XG5cdFx0XHRcdGFkZE5vdGljZVJlZi5jdXJyZW50KHsgbWVzc2FnZTogJ2F1ZGl0LWxvYWQtZmFpbGVkJywgdHlwZTogJ2Vycm9yJyB9KTtcblx0XHRcdH0pXG5cdFx0XHQuZmluYWxseSgoKSA9PiB7XG5cdFx0XHRcdGlmICghaXNBY3RpdmUpIHJldHVybjtcblx0XHRcdFx0c2V0TG9hZGluZyhmYWxzZSk7XG5cdFx0XHR9KTtcblx0XHRyZXR1cm4gKCkgPT4ge1xuXHRcdFx0aXNBY3RpdmUgPSBmYWxzZTtcblx0XHR9O1xuXHR9LCBbYWN0aW9uLm5hbWUsIHJlY29yZElkLCByZXNvdXJjZS5pZF0pO1xuXG5cdGlmICghcmVjb3JkSWQpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PEJveCB2YXJpYW50PSd3aGl0ZScgcD0neGwnPlxuXHRcdFx0XHQ8VGV4dD57dHJhbnNsYXRlTWVzc2FnZSgnYXVkaXQtbG9hZC1mYWlsZWQnKX08L1RleHQ+XG5cdFx0XHQ8L0JveD5cblx0XHQpO1xuXHR9XG5cblx0Y29uc3QgdGl0bGUgPSB0cmFuc2xhdGVBY3Rpb24oYWN0aW9uLm5hbWUsIHJlc291cmNlLmlkKTtcblx0Y29uc3QgZm9ybWF0VGltZXN0YW1wID0gKHZhbHVlOiBzdHJpbmcpID0+IHtcblx0XHRjb25zdCBwYXJzZWQgPSBEYXRlLnBhcnNlKHZhbHVlKTtcblx0XHRpZiAoTnVtYmVyLmlzTmFOKHBhcnNlZCkpIHtcblx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHR9XG5cdFx0cmV0dXJuIG5ldyBEYXRlKHBhcnNlZCkudG9Mb2NhbGVTdHJpbmcoKTtcblx0fTtcblxuXHRjb25zdCBoYW5kbGVTdWJtaXQgPSBhc3luYyAoKSA9PiB7XG5cdFx0aWYgKCFyZWNvcmRJZCkgcmV0dXJuO1xuXHRcdGNvbnN0IHRyaW1tZWQgPSBub3RlLnRyaW0oKTtcblx0XHRpZiAoIXRyaW1tZWQpIHtcblx0XHRcdGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdhdWRpdC1ub3RlLWVtcHR5JywgdHlwZTogJ2Vycm9yJyB9KTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0c2V0U2F2aW5nKHRydWUpO1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuXHRcdFx0Zm9ybURhdGEuYXBwZW5kKCdub3RlJywgdHJpbW1lZCk7XG5cdFx0XHRjb25zdCByZXNwb25zZSA9IGF3YWl0IGFwaS5yZWNvcmRBY3Rpb24oe1xuXHRcdFx0XHRyZXNvdXJjZUlkOiByZXNvdXJjZS5pZCxcblx0XHRcdFx0cmVjb3JkSWQsXG5cdFx0XHRcdGFjdGlvbk5hbWU6IGFjdGlvbi5uYW1lLFxuXHRcdFx0XHRtZXRob2Q6ICdwb3N0Jyxcblx0XHRcdFx0ZGF0YTogZm9ybURhdGEsXG5cdFx0XHR9KTtcblx0XHRcdGlmIChyZXNwb25zZS5kYXRhLm5vdGljZSkge1xuXHRcdFx0XHRhZGROb3RpY2UocmVzcG9uc2UuZGF0YS5ub3RpY2UpO1xuXHRcdFx0fVxuXHRcdFx0c2V0Tm90ZSgnJyk7XG5cdFx0XHRjb25zdCBwYXlsb2FkRW50cmllcyA9IGV4dHJhY3RFbnRyaWVzKHJlc3BvbnNlLmRhdGEucGF5bG9hZCk7XG5cdFx0XHRzZXRFbnRyaWVzKHBheWxvYWRFbnRyaWVzKTtcblx0XHR9IGNhdGNoIHtcblx0XHRcdGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdhdWRpdC1ub3RlLXNhdmUtZmFpbGVkJywgdHlwZTogJ2Vycm9yJyB9KTtcblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0c2V0U2F2aW5nKGZhbHNlKTtcblx0XHR9XG5cdH07XG5cblx0cmV0dXJuIChcblx0XHQ8Qm94XG5cdFx0XHR2YXJpYW50PSd3aGl0ZSdcblx0XHRcdHA9J3h4bCdcblx0XHRcdGJvcmRlclJhZGl1cz0neGwnXG5cdFx0XHRib3hTaGFkb3c9J3NtJ1xuXHRcdFx0bWF4V2lkdGg9JzgyMHB4J1xuXHRcdFx0c3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnIH19XG5cdFx0PlxuXHRcdFx0PEJveCBkaXNwbGF5PSdmbGV4JyBhbGlnbkl0ZW1zPSdjZW50ZXInIGp1c3RpZnlDb250ZW50PSdzcGFjZS1iZXR3ZWVuJyBtYj0neGwnPlxuXHRcdFx0XHQ8VGV4dCBmb250U2l6ZT0neGwnIGZvbnRXZWlnaHQ9J2JvbGQnPlxuXHRcdFx0XHRcdHt0aXRsZX1cblx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0PC9Cb3g+XG5cdFx0XHQ8Qm94IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGdhcDogMjAgfX0+XG5cdFx0XHRcdDxCb3g+XG5cdFx0XHRcdFx0PExhYmVsIGh0bWxGb3I9J2F1ZGl0LW5vdGUnPnt0cmFuc2xhdGVNZXNzYWdlKCdhdWRpdC1ub3RlLWxhYmVsJyl9PC9MYWJlbD5cblx0XHRcdFx0XHQ8dGV4dGFyZWFcblx0XHRcdFx0XHRcdGlkPSdhdWRpdC1ub3RlJ1xuXHRcdFx0XHRcdFx0bmFtZT0nYXVkaXROb3RlJ1xuXHRcdFx0XHRcdFx0dmFsdWU9e25vdGV9XG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXROb3RlKGV2ZW50LnRhcmdldC52YWx1ZSl9XG5cdFx0XHRcdFx0XHRwbGFjZWhvbGRlcj17dHJhbnNsYXRlTWVzc2FnZSgnYXVkaXQtbm90ZS1wbGFjZWhvbGRlcicpfVxuXHRcdFx0XHRcdFx0cm93cz17NH1cblx0XHRcdFx0XHRcdHN0eWxlPXt7XG5cdFx0XHRcdFx0XHRcdHdpZHRoOiAnMTAwJScsXG5cdFx0XHRcdFx0XHRcdHJlc2l6ZTogJ3ZlcnRpY2FsJyxcblx0XHRcdFx0XHRcdFx0cGFkZGluZzogJzEycHggMTRweCcsXG5cdFx0XHRcdFx0XHRcdGJvcmRlclJhZGl1czogOCxcblx0XHRcdFx0XHRcdFx0Ym9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnLFxuXHRcdFx0XHRcdFx0XHRmb250U2l6ZTogMTQsXG5cdFx0XHRcdFx0XHRcdG1hcmdpblRvcDogMTIsXG5cdFx0XHRcdFx0XHR9fVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdDwvQm94PlxuXHRcdFx0XHQ8Qm94PlxuXHRcdFx0XHRcdDxCdXR0b25cblx0XHRcdFx0XHRcdHN0eWxlPXt7XG5cdFx0XHRcdFx0XHRcdGJvcmRlckNvbG9yOiAnd2hpdGUnLFxuXHRcdFx0XHRcdFx0XHRiYWNrZ3JvdW5kOiAnI2ZhY2MxNScsXG5cdFx0XHRcdFx0XHRcdGNvbG9yOiAnYmxhY2snLFxuXHRcdFx0XHRcdFx0fX1cblx0XHRcdFx0XHRcdHZhcmlhbnQ9J2NvbnRhaW5lZCdcblx0XHRcdFx0XHRcdGNvbG9yPSdwcmltYXJ5J1xuXHRcdFx0XHRcdFx0b25DbGljaz17aGFuZGxlU3VibWl0fVxuXHRcdFx0XHRcdFx0ZGlzYWJsZWQ9e3NhdmluZ31cblx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHR7c2F2aW5nID8gdHJhbnNsYXRlTWVzc2FnZSgnYXVkaXQtbm90ZS1zYXZpbmcnKSA6IHRyYW5zbGF0ZU1lc3NhZ2UoJ2F1ZGl0LW5vdGUtc3VibWl0Jyl9XG5cdFx0XHRcdFx0PC9CdXR0b24+XG5cdFx0XHRcdDwvQm94PlxuXHRcdFx0XHQ8Qm94PlxuXHRcdFx0XHRcdDxUZXh0IGZvbnRTaXplPSdsZycgZm9udFdlaWdodD0nYm9sZCcgbWI9J21kJz5cblx0XHRcdFx0XHRcdHt0cmFuc2xhdGVNZXNzYWdlKCdhdWRpdC10aW1lbGluZScpfVxuXHRcdFx0XHRcdDwvVGV4dD5cblx0XHRcdFx0XHR7bG9hZGluZyA/IChcblx0XHRcdFx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnPnt0cmFuc2xhdGVNZXNzYWdlKCdhdWRpdC1sb2FkLXByb2dyZXNzJyl9PC9UZXh0PlxuXHRcdFx0XHRcdCkgOiBlbnRyaWVzLmxlbmd0aCA9PT0gMCA/IChcblx0XHRcdFx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnPnt0cmFuc2xhdGVNZXNzYWdlKCdhdWRpdC10aW1lbGluZS1lbXB0eScpfTwvVGV4dD5cblx0XHRcdFx0XHQpIDogKFxuXHRcdFx0XHRcdFx0PEJveCBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBnYXA6IDE2IH19PlxuXHRcdFx0XHRcdFx0XHR7ZW50cmllcy5tYXAoKGVudHJ5KSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3QgYWRtaW5MYWJlbCA9IGVudHJ5LmFkbWluRW1haWwgPz8gdHJhbnNsYXRlTWVzc2FnZSgnYXVkaXQtdW5rbm93bi1hZG1pbicpO1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IHRpbWVzdGFtcCA9IGZvcm1hdFRpbWVzdGFtcChlbnRyeS5jcmVhdGVkQXQpO1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IGZyb21MYWJlbCA9IGVudHJ5LmZyb21TdGF0dXNcblx0XHRcdFx0XHRcdFx0XHRcdD8gdHJhbnNsYXRlTGFiZWwoYHN0YXR1cy4ke2VudHJ5LmZyb21TdGF0dXN9YCwgcmVzb3VyY2UuaWQpXG5cdFx0XHRcdFx0XHRcdFx0XHQ6IHRyYW5zbGF0ZU1lc3NhZ2UoJ3N0YXR1cy11bmtub3duJyk7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3QgdG9MYWJlbCA9IGVudHJ5LnRvU3RhdHVzXG5cdFx0XHRcdFx0XHRcdFx0XHQ/IHRyYW5zbGF0ZUxhYmVsKGBzdGF0dXMuJHtlbnRyeS50b1N0YXR1c31gLCByZXNvdXJjZS5pZClcblx0XHRcdFx0XHRcdFx0XHRcdDogdHJhbnNsYXRlTWVzc2FnZSgnc3RhdHVzLXVua25vd24nKTtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRcdFx0XHRcdFx0PEJveFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRrZXk9e2VudHJ5LmlkfVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRzdHlsZT17e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRib3JkZXJSYWRpdXM6IDEyLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHBhZGRpbmc6IDE2LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJhY2tncm91bmQ6ICcjRjhGQUZDJyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0fX1cblx0XHRcdFx0XHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0PEJveCBkaXNwbGF5PSdmbGV4JyBhbGlnbkl0ZW1zPSdjZW50ZXInIGp1c3RpZnlDb250ZW50PSdzcGFjZS1iZXR3ZWVuJyBtYj0nc20nPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxUZXh0IGZvbnRXZWlnaHQ9JzYwMCc+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR7ZW50cnkudHlwZSA9PT0gJ05PVEUnXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdD8gdHJhbnNsYXRlTWVzc2FnZSgnYXVkaXQtbm90ZS1lbnRyeScpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDogdHJhbnNsYXRlTWVzc2FnZSgnYXVkaXQtc3RhdHVzLWNoYW5nZScsIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGZyb206IGZyb21MYWJlbCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHRvOiB0b0xhYmVsLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQgIH0pfVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDwvVGV4dD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJyBmb250U2l6ZT0nc20nPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0e3RpbWVzdGFtcH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdDwvQm94PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHR7ZW50cnkudHlwZSA9PT0gJ1NUQVRVU19DSEFOR0UnID8gKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxCb3ggZGlzcGxheT0nZmxleCcgYWxpZ25JdGVtcz0nY2VudGVyJyBzdHlsZT17eyBnYXA6IDggfX0+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8QmFkZ2Ugb3V0bGluZT57ZnJvbUxhYmVsfTwvQmFkZ2U+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8Qm94IGRpc3BsYXk9J2ZsZXgnIGFsaWduSXRlbXM9J2NlbnRlcicgc3R5bGU9e3sgY29sb3I6ICcjNzE4MDk2JyB9fT5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PEljb24gaWNvbj0nQ2hldnJvblJpZ2h0JyBzaXplPXsxOH0gLz5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDwvQm94PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PEJhZGdlIG91dGxpbmU+e3RvTGFiZWx9PC9CYWRnZT5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0KSA6IGVudHJ5Lm5vdGUgPyAoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0PFRleHQ+e2VudHJ5Lm5vdGV9PC9UZXh0PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQpIDogbnVsbH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0PFRleHQgY29sb3I9J2dyZXk2MCcgZm9udFNpemU9J3NtJyBtdD0nc20nPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHt0cmFuc2xhdGVNZXNzYWdlKCdhdWRpdC1hZG1pbi1sYWJlbCcpfToge2FkbWluTGFiZWx9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdDwvVGV4dD5cblx0XHRcdFx0XHRcdFx0XHRcdDwvQm94PlxuXHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdH0pfVxuXHRcdFx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdFx0KX1cblx0XHRcdFx0PC9Cb3g+XG5cdFx0XHQ8L0JveD5cblx0XHQ8L0JveD5cblx0KTtcbn1cbiIsImltcG9ydCB7IHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBBcGlDbGllbnQsIHR5cGUgQWN0aW9uUHJvcHMsIE9yaWdpbmFsU2hvdywgdXNlVHJhbnNsYXRpb24gfSBmcm9tICdhZG1pbmpzJztcbmltcG9ydCB7IEJhZGdlLCBCb3gsIFRleHQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcblxuY29uc3QgYXBpID0gbmV3IEFwaUNsaWVudCgpO1xuXG50eXBlIFBheW1lbnRTdGF0dXMgPSAnUEFJRCcgfCAnVU5QQUlEJyB8ICdDQU5DRUxMRUQnO1xuXG50eXBlIEZpbmFuY2lhbEJyZWFrZG93blBheWxvYWQgPSB7XG5cdHN1YnRvdGFsOiBudW1iZXI7XG5cdGRpc2NvdW50czogbnVtYmVyO1xuXHRzaGlwcGluZzogbnVtYmVyO1xuXHR0b3RhbDogbnVtYmVyO1xuXHRwYXltZW50U3RhdHVzOiBQYXltZW50U3RhdHVzO1xuXHRwYXltZW50TWV0aG9kOiBzdHJpbmcgfCBudWxsO1xuXHRzaGlwbWVudE1ldGhvZDogc3RyaW5nIHwgbnVsbDtcbn07XG5cbmNvbnN0IGZvcm1hdE1vbmV5ID0gKHZhbHVlOiBudW1iZXIsIGN1cnJlbmN5ID0gJ1VBSCcpID0+IHtcblx0Y29uc3Qgc2FmZVZhbHVlID0gTnVtYmVyLmlzRmluaXRlKHZhbHVlKSA/IHZhbHVlIDogMDtcblx0dHJ5IHtcblx0XHRyZXR1cm4gbmV3IEludGwuTnVtYmVyRm9ybWF0KHVuZGVmaW5lZCwge1xuXHRcdFx0c3R5bGU6ICdjdXJyZW5jeScsXG5cdFx0XHRjdXJyZW5jeSxcblx0XHRcdG1pbmltdW1GcmFjdGlvbkRpZ2l0czogMixcblx0XHRcdG1heGltdW1GcmFjdGlvbkRpZ2l0czogMixcblx0XHR9KS5mb3JtYXQoc2FmZVZhbHVlKTtcblx0fSBjYXRjaCB7XG5cdFx0cmV0dXJuIHNhZmVWYWx1ZS50b0ZpeGVkKDIpO1xuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBPcmRlclNob3cocHJvcHM6IEFjdGlvblByb3BzKSB7XG5cdGNvbnN0IHsgcmVjb3JkLCByZXNvdXJjZSB9ID0gcHJvcHM7XG5cdGNvbnN0IHJlY29yZElkID0gcmVjb3JkPy5pZDtcblx0Y29uc3QgeyB0cmFuc2xhdGVNZXNzYWdlIH0gPSB1c2VUcmFuc2xhdGlvbigpO1xuXHRjb25zdCBbcGF5bG9hZCwgc2V0UGF5bG9hZF0gPSB1c2VTdGF0ZTxGaW5hbmNpYWxCcmVha2Rvd25QYXlsb2FkIHwgbnVsbD4obnVsbCk7XG5cdGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuXHR1c2VFZmZlY3QoKCkgPT4ge1xuXHRcdGlmICghcmVjb3JkSWQpIHJldHVybjtcblx0XHRsZXQgaXNBY3RpdmUgPSB0cnVlO1xuXHRcdHNldExvYWRpbmcodHJ1ZSk7XG5cdFx0YXBpLnJlY29yZEFjdGlvbih7XG5cdFx0XHRyZXNvdXJjZUlkOiByZXNvdXJjZS5pZCxcblx0XHRcdHJlY29yZElkLFxuXHRcdFx0YWN0aW9uTmFtZTogJ2ZpbmFuY2lhbEJyZWFrZG93bicsXG5cdFx0XHRtZXRob2Q6ICdnZXQnLFxuXHRcdH0pXG5cdFx0XHQudGhlbigocmVzcG9uc2UpID0+IHtcblx0XHRcdFx0aWYgKCFpc0FjdGl2ZSkgcmV0dXJuO1xuXHRcdFx0XHRzZXRQYXlsb2FkKChyZXNwb25zZS5kYXRhLnBheWxvYWQgPz8gbnVsbCkgYXMgRmluYW5jaWFsQnJlYWtkb3duUGF5bG9hZCB8IG51bGwpO1xuXHRcdFx0fSlcblx0XHRcdC5maW5hbGx5KCgpID0+IHtcblx0XHRcdFx0aWYgKCFpc0FjdGl2ZSkgcmV0dXJuO1xuXHRcdFx0XHRzZXRMb2FkaW5nKGZhbHNlKTtcblx0XHRcdH0pO1xuXHRcdHJldHVybiAoKSA9PiB7XG5cdFx0XHRpc0FjdGl2ZSA9IGZhbHNlO1xuXHRcdH07XG5cdH0sIFtyZWNvcmRJZCwgcmVzb3VyY2UuaWRdKTtcblxuXHRjb25zdCBzdGF0dXNWYXJpYW50ID0gdXNlTWVtbygoKSA9PiB7XG5cdFx0c3dpdGNoIChwYXlsb2FkPy5wYXltZW50U3RhdHVzKSB7XG5cdFx0XHRjYXNlICdQQUlEJzpcblx0XHRcdFx0cmV0dXJuIHsgYmFja2dyb3VuZDogJyNDNkY2RDUnLCBib3JkZXJDb2xvcjogJyMzOEExNjknLCBjb2xvcjogJyMyMjU0M0QnIH07XG5cdFx0XHRjYXNlICdDQU5DRUxMRUQnOlxuXHRcdFx0XHRyZXR1cm4geyBiYWNrZ3JvdW5kOiAnI0ZFRDdENycsIGJvcmRlckNvbG9yOiAnI0U1M0UzRScsIGNvbG9yOiAnIzc0MkEyQScgfTtcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiB7IGJhY2tncm91bmQ6ICcjRkVGQ0JGJywgYm9yZGVyQ29sb3I6ICcjRDY5RTJFJywgY29sb3I6ICcjNzQ0MjEwJyB9O1xuXHRcdH1cblx0fSwgW3BheWxvYWQ/LnBheW1lbnRTdGF0dXNdKTtcblxuXHRjb25zdCBwYXltZW50U3RhdHVzTGFiZWwgPSB1c2VNZW1vKCgpID0+IHtcblx0XHRzd2l0Y2ggKHBheWxvYWQ/LnBheW1lbnRTdGF0dXMpIHtcblx0XHRcdGNhc2UgJ1BBSUQnOlxuXHRcdFx0XHRyZXR1cm4gdHJhbnNsYXRlTWVzc2FnZSgncGF5bWVudC1zdGF0dXMtcGFpZCcpO1xuXHRcdFx0Y2FzZSAnQ0FOQ0VMTEVEJzpcblx0XHRcdFx0cmV0dXJuIHRyYW5zbGF0ZU1lc3NhZ2UoJ3BheW1lbnQtc3RhdHVzLWNhbmNlbGxlZCcpO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuIHRyYW5zbGF0ZU1lc3NhZ2UoJ3BheW1lbnQtc3RhdHVzLXVucGFpZCcpO1xuXHRcdH1cblx0fSwgW3BheWxvYWQ/LnBheW1lbnRTdGF0dXMsIHRyYW5zbGF0ZU1lc3NhZ2VdKTtcblxuXHRyZXR1cm4gKFxuXHRcdDxCb3g+XG5cdFx0XHQ8Qm94XG5cdFx0XHRcdHZhcmlhbnQ9J3doaXRlJ1xuXHRcdFx0XHRwPSd4eGwnXG5cdFx0XHRcdGJvcmRlclJhZGl1cz0neGwnXG5cdFx0XHRcdGJveFNoYWRvdz0nc20nXG5cdFx0XHRcdG1iPSd4bCdcblx0XHRcdFx0Y2xhc3NOYW1lPSdhZG1pbi1jYXJkLS1maW5hbmNpYWwnXG5cdFx0XHRcdHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJyB9fVxuXHRcdFx0PlxuXHRcdFx0XHQ8Qm94IGRpc3BsYXk9J2ZsZXgnIGFsaWduSXRlbXM9J2NlbnRlcicganVzdGlmeUNvbnRlbnQ9J3NwYWNlLWJldHdlZW4nIG1iPSdsZyc+XG5cdFx0XHRcdFx0PFRleHQgZm9udFdlaWdodD0nYm9sZCc+e3RyYW5zbGF0ZU1lc3NhZ2UoJ2ZpbmFuY2lhbC1icmVha2Rvd24nKX08L1RleHQ+XG5cdFx0XHRcdFx0PEJhZGdlXG5cdFx0XHRcdFx0XHRvdXRsaW5lXG5cdFx0XHRcdFx0XHRzdHlsZT17e1xuXHRcdFx0XHRcdFx0XHRiYWNrZ3JvdW5kOiBzdGF0dXNWYXJpYW50LmJhY2tncm91bmQsXG5cdFx0XHRcdFx0XHRcdGJvcmRlckNvbG9yOiBzdGF0dXNWYXJpYW50LmJvcmRlckNvbG9yLFxuXHRcdFx0XHRcdFx0XHRjb2xvcjogc3RhdHVzVmFyaWFudC5jb2xvcixcblx0XHRcdFx0XHRcdH19XG5cdFx0XHRcdFx0PlxuXHRcdFx0XHRcdFx0e3BheW1lbnRTdGF0dXNMYWJlbH1cblx0XHRcdFx0XHQ8L0JhZGdlPlxuXHRcdFx0XHQ8L0JveD5cblxuXHRcdFx0XHR7bG9hZGluZyB8fCAhcGF5bG9hZCA/IChcblx0XHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJz57dHJhbnNsYXRlTWVzc2FnZSgnZmluYW5jaWFsLWJyZWFrZG93bi1sb2FkaW5nJyl9PC9UZXh0PlxuXHRcdFx0XHQpIDogKFxuXHRcdFx0XHRcdDxCb3hcblx0XHRcdFx0XHRcdHN0eWxlPXt7XG5cdFx0XHRcdFx0XHRcdGRpc3BsYXk6ICdncmlkJyxcblx0XHRcdFx0XHRcdFx0Z3JpZFRlbXBsYXRlQ29sdW1uczogJ3JlcGVhdChhdXRvLWZpdCwgbWlubWF4KDIyMHB4LCAxZnIpKScsXG5cdFx0XHRcdFx0XHRcdGdhcDogMTYsXG5cdFx0XHRcdFx0XHR9fVxuXHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdDxCb3ggc3R5bGU9e3sgcGFkZGluZzogMTQsIGJvcmRlclJhZGl1czogMTIsIGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJyB9fT5cblx0XHRcdFx0XHRcdFx0PFRleHQgY29sb3I9J2dyZXk2MCc+e3RyYW5zbGF0ZU1lc3NhZ2UoJ3N1YnRvdGFsJyl9PC9UZXh0PlxuXHRcdFx0XHRcdFx0XHQ8VGV4dCBmb250V2VpZ2h0PSdib2xkJz57Zm9ybWF0TW9uZXkocGF5bG9hZC5zdWJ0b3RhbCl9PC9UZXh0PlxuXHRcdFx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdFx0XHQ8Qm94IHN0eWxlPXt7IHBhZGRpbmc6IDE0LCBib3JkZXJSYWRpdXM6IDEyLCBib3JkZXI6ICcxcHggc29saWQgI0UyRThGMCcgfX0+XG5cdFx0XHRcdFx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnPnt0cmFuc2xhdGVNZXNzYWdlKCdkaXNjb3VudHMnKX08L1RleHQ+XG5cdFx0XHRcdFx0XHRcdDxUZXh0IGZvbnRXZWlnaHQ9J2JvbGQnPntmb3JtYXRNb25leShwYXlsb2FkLmRpc2NvdW50cyl9PC9UZXh0PlxuXHRcdFx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdFx0XHQ8Qm94IHN0eWxlPXt7IHBhZGRpbmc6IDE0LCBib3JkZXJSYWRpdXM6IDEyLCBib3JkZXI6ICcxcHggc29saWQgI0UyRThGMCcgfX0+XG5cdFx0XHRcdFx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnPnt0cmFuc2xhdGVNZXNzYWdlKCdzaGlwcGluZycpfTwvVGV4dD5cblx0XHRcdFx0XHRcdFx0PFRleHQgZm9udFdlaWdodD0nYm9sZCc+e2Zvcm1hdE1vbmV5KHBheWxvYWQuc2hpcHBpbmcpfTwvVGV4dD5cblx0XHRcdFx0XHRcdDwvQm94PlxuXHRcdFx0XHRcdFx0PEJveCBzdHlsZT17eyBwYWRkaW5nOiAxNCwgYm9yZGVyUmFkaXVzOiAxMiwgYm9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnIH19PlxuXHRcdFx0XHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJz57dHJhbnNsYXRlTWVzc2FnZSgndG90YWwnKX08L1RleHQ+XG5cdFx0XHRcdFx0XHRcdDxUZXh0IGZvbnRXZWlnaHQ9J2JvbGQnPntmb3JtYXRNb25leShwYXlsb2FkLnRvdGFsKX08L1RleHQ+XG5cdFx0XHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0KX1cblx0XHRcdDwvQm94PlxuXG5cdFx0XHQ8T3JpZ2luYWxTaG93IHsuLi5wcm9wc30gLz5cblx0XHQ8L0JveD5cblx0KTtcbn1cbiIsImltcG9ydCB7IHVzZUNhbGxiYWNrLCB1c2VFZmZlY3QsIHVzZVJlZiwgdXNlU3RhdGUsIHR5cGUgQ2hhbmdlRXZlbnQgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBBcGlDbGllbnQsIHR5cGUgQWN0aW9uUHJvcHMsIHVzZU5vdGljZSwgdXNlVHJhbnNsYXRpb24gfSBmcm9tICdhZG1pbmpzJztcbmltcG9ydCB7IEJveCwgQnV0dG9uLCBGb3JtR3JvdXAsIElucHV0LCBMYWJlbCwgVGV4dCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xuXG5jb25zdCBhcGkgPSBuZXcgQXBpQ2xpZW50KCk7XG5cbnR5cGUgRnVsZmlsbG1lbnRQYXlsb2FkID0ge1xuXHRjYXJyaWVyOiBzdHJpbmcgfCBudWxsO1xuXHR0cmFja2luZ051bWJlcjogc3RyaW5nIHwgbnVsbDtcbn07XG5cbmNvbnN0IGV4dHJhY3RQYXlsb2FkID0gKHBheWxvYWQ6IHVua25vd24pOiBGdWxmaWxsbWVudFBheWxvYWQgPT4ge1xuXHRpZiAoIXBheWxvYWQgfHwgdHlwZW9mIHBheWxvYWQgIT09ICdvYmplY3QnKSB7XG5cdFx0cmV0dXJuIHsgY2FycmllcjogbnVsbCwgdHJhY2tpbmdOdW1iZXI6IG51bGwgfTtcblx0fVxuXHRjb25zdCBtYXliZSA9IHBheWxvYWQgYXMgUGFydGlhbDxGdWxmaWxsbWVudFBheWxvYWQ+O1xuXHRyZXR1cm4ge1xuXHRcdGNhcnJpZXI6IHR5cGVvZiBtYXliZS5jYXJyaWVyID09PSAnc3RyaW5nJyA/IG1heWJlLmNhcnJpZXIgOiBudWxsLFxuXHRcdHRyYWNraW5nTnVtYmVyOiB0eXBlb2YgbWF5YmUudHJhY2tpbmdOdW1iZXIgPT09ICdzdHJpbmcnID8gbWF5YmUudHJhY2tpbmdOdW1iZXIgOiBudWxsLFxuXHR9O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gT3JkZXJGdWxmaWxsbWVudEFjdGlvbih7IGFjdGlvbiwgcmVjb3JkLCByZXNvdXJjZSB9OiBBY3Rpb25Qcm9wcykge1xuXHRjb25zdCByZWNvcmRJZCA9IHJlY29yZD8uaWQ7XG5cdGNvbnN0IFtjYXJyaWVyLCBzZXRDYXJyaWVyXSA9IHVzZVN0YXRlKCcnKTtcblx0Y29uc3QgW3RyYWNraW5nTnVtYmVyLCBzZXRUcmFja2luZ051bWJlcl0gPSB1c2VTdGF0ZSgnJyk7XG5cdGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcblx0Y29uc3QgW3NhdmluZywgc2V0U2F2aW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcblx0Y29uc3QgYWRkTm90aWNlID0gdXNlTm90aWNlKCk7XG5cdGNvbnN0IGFkZE5vdGljZVJlZiA9IHVzZVJlZihhZGROb3RpY2UpO1xuXHRjb25zdCB7IHRyYW5zbGF0ZUFjdGlvbiwgdHJhbnNsYXRlTWVzc2FnZSB9ID0gdXNlVHJhbnNsYXRpb24oKTtcblxuXHR1c2VFZmZlY3QoKCkgPT4ge1xuXHRcdGFkZE5vdGljZVJlZi5jdXJyZW50ID0gYWRkTm90aWNlO1xuXHR9LCBbYWRkTm90aWNlXSk7XG5cblx0Y29uc3QgbG9hZCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcblx0XHRpZiAoIXJlY29yZElkKSByZXR1cm47XG5cdFx0bGV0IGlzQWN0aXZlID0gdHJ1ZTtcblx0XHRzZXRMb2FkaW5nKHRydWUpO1xuXHRcdGFwaS5yZWNvcmRBY3Rpb24oe1xuXHRcdFx0cmVzb3VyY2VJZDogcmVzb3VyY2UuaWQsXG5cdFx0XHRyZWNvcmRJZCxcblx0XHRcdGFjdGlvbk5hbWU6IGFjdGlvbi5uYW1lLFxuXHRcdFx0bWV0aG9kOiAnZ2V0Jyxcblx0XHR9KVxuXHRcdFx0LnRoZW4oKHJlc3BvbnNlKSA9PiB7XG5cdFx0XHRcdGlmICghaXNBY3RpdmUpIHJldHVybjtcblx0XHRcdFx0Y29uc3QgcGF5bG9hZCA9IGV4dHJhY3RQYXlsb2FkKHJlc3BvbnNlLmRhdGEucGF5bG9hZCk7XG5cdFx0XHRcdHNldENhcnJpZXIocGF5bG9hZC5jYXJyaWVyID8/ICcnKTtcblx0XHRcdFx0c2V0VHJhY2tpbmdOdW1iZXIocGF5bG9hZC50cmFja2luZ051bWJlciA/PyAnJyk7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKCgpID0+IHtcblx0XHRcdFx0aWYgKCFpc0FjdGl2ZSkgcmV0dXJuO1xuXHRcdFx0XHRhZGROb3RpY2VSZWYuY3VycmVudCh7IG1lc3NhZ2U6ICdmdWxmaWxsbWVudC1sb2FkLWZhaWxlZCcsIHR5cGU6ICdlcnJvcicgfSk7XG5cdFx0XHR9KVxuXHRcdFx0LmZpbmFsbHkoKCkgPT4ge1xuXHRcdFx0XHRpZiAoIWlzQWN0aXZlKSByZXR1cm47XG5cdFx0XHRcdHNldExvYWRpbmcoZmFsc2UpO1xuXHRcdFx0fSk7XG5cdFx0cmV0dXJuICgpID0+IHtcblx0XHRcdGlzQWN0aXZlID0gZmFsc2U7XG5cdFx0fTtcblx0fSwgW2FjdGlvbi5uYW1lLCByZWNvcmRJZCwgcmVzb3VyY2UuaWRdKTtcblxuXHR1c2VFZmZlY3QoKCkgPT4ge1xuXHRcdHJldHVybiBsb2FkKCk7XG5cdH0sIFtsb2FkXSk7XG5cblx0aWYgKCFyZWNvcmRJZCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8Qm94IHZhcmlhbnQ9J3doaXRlJyBwPSd4bCc+XG5cdFx0XHRcdDxUZXh0Pnt0cmFuc2xhdGVNZXNzYWdlKCdmdWxmaWxsbWVudC1sb2FkLWZhaWxlZCcpfTwvVGV4dD5cblx0XHRcdDwvQm94PlxuXHRcdCk7XG5cdH1cblxuXHRjb25zdCB0aXRsZSA9IHRyYW5zbGF0ZUFjdGlvbihhY3Rpb24ubmFtZSwgcmVzb3VyY2UuaWQpO1xuXG5cdGNvbnN0IGhhbmRsZVNhdmUgPSBhc3luYyAoKSA9PiB7XG5cdFx0c2V0U2F2aW5nKHRydWUpO1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuXHRcdFx0Zm9ybURhdGEuYXBwZW5kKCdjYXJyaWVyJywgY2Fycmllcik7XG5cdFx0XHRmb3JtRGF0YS5hcHBlbmQoJ3RyYWNraW5nTnVtYmVyJywgdHJhY2tpbmdOdW1iZXIpO1xuXHRcdFx0Y29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhcGkucmVjb3JkQWN0aW9uKHtcblx0XHRcdFx0cmVzb3VyY2VJZDogcmVzb3VyY2UuaWQsXG5cdFx0XHRcdHJlY29yZElkLFxuXHRcdFx0XHRhY3Rpb25OYW1lOiBhY3Rpb24ubmFtZSxcblx0XHRcdFx0bWV0aG9kOiAncG9zdCcsXG5cdFx0XHRcdGRhdGE6IGZvcm1EYXRhLFxuXHRcdFx0fSk7XG5cdFx0XHRpZiAocmVzcG9uc2UuZGF0YS5ub3RpY2UpIHtcblx0XHRcdFx0YWRkTm90aWNlKHJlc3BvbnNlLmRhdGEubm90aWNlKTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IHBheWxvYWQgPSBleHRyYWN0UGF5bG9hZChyZXNwb25zZS5kYXRhLnBheWxvYWQpO1xuXHRcdFx0c2V0Q2FycmllcihwYXlsb2FkLmNhcnJpZXIgPz8gJycpO1xuXHRcdFx0c2V0VHJhY2tpbmdOdW1iZXIocGF5bG9hZC50cmFja2luZ051bWJlciA/PyAnJyk7XG5cdFx0fSBjYXRjaCB7XG5cdFx0XHRhZGROb3RpY2UoeyBtZXNzYWdlOiAnZnVsZmlsbG1lbnQtc2F2ZS1mYWlsZWQnLCB0eXBlOiAnZXJyb3InIH0pO1xuXHRcdH0gZmluYWxseSB7XG5cdFx0XHRzZXRTYXZpbmcoZmFsc2UpO1xuXHRcdH1cblx0fTtcblxuXHRyZXR1cm4gKFxuXHRcdDxCb3hcblx0XHRcdHZhcmlhbnQ9J3doaXRlJ1xuXHRcdFx0cD0neHhsJ1xuXHRcdFx0Ym9yZGVyUmFkaXVzPSd4bCdcblx0XHRcdGJveFNoYWRvdz0nc20nXG5cdFx0XHRtYXhXaWR0aD0nNjgwcHgnXG5cdFx0XHRzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQgI0UyRThGMCcgfX1cblx0XHQ+XG5cdFx0XHQ8Qm94IGRpc3BsYXk9J2ZsZXgnIGFsaWduSXRlbXM9J2NlbnRlcicganVzdGlmeUNvbnRlbnQ9J3NwYWNlLWJldHdlZW4nIG1iPSd4bCc+XG5cdFx0XHRcdDxUZXh0IGZvbnRTaXplPSd4bCcgZm9udFdlaWdodD0nYm9sZCc+XG5cdFx0XHRcdFx0e3RpdGxlfVxuXHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHQ8L0JveD5cblx0XHRcdHtsb2FkaW5nID8gKFxuXHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJz57dHJhbnNsYXRlTWVzc2FnZSgnZnVsZmlsbG1lbnQtbG9hZC1wcm9ncmVzcycpfTwvVGV4dD5cblx0XHRcdCkgOiAoXG5cdFx0XHRcdDxCb3ggc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywgZ2FwOiAxNiB9fT5cblx0XHRcdFx0XHQ8Rm9ybUdyb3VwPlxuXHRcdFx0XHRcdFx0PExhYmVsPnt0cmFuc2xhdGVNZXNzYWdlKCdmdWxmaWxsbWVudC1jYXJyaWVyJyl9PC9MYWJlbD5cblx0XHRcdFx0XHRcdDxJbnB1dFxuXHRcdFx0XHRcdFx0XHR2YWx1ZT17Y2Fycmllcn1cblx0XHRcdFx0XHRcdFx0b25DaGFuZ2U9eyhlOiBDaGFuZ2VFdmVudDxIVE1MSW5wdXRFbGVtZW50PikgPT4gc2V0Q2FycmllcihlLnRhcmdldC52YWx1ZSl9XG5cdFx0XHRcdFx0XHQvPlxuXHRcdFx0XHRcdDwvRm9ybUdyb3VwPlxuXHRcdFx0XHRcdDxGb3JtR3JvdXA+XG5cdFx0XHRcdFx0XHQ8TGFiZWw+e3RyYW5zbGF0ZU1lc3NhZ2UoJ2Z1bGZpbGxtZW50LXRyYWNraW5nLW51bWJlcicpfTwvTGFiZWw+XG5cdFx0XHRcdFx0XHQ8SW5wdXRcblx0XHRcdFx0XHRcdFx0dmFsdWU9e3RyYWNraW5nTnVtYmVyfVxuXHRcdFx0XHRcdFx0XHRvbkNoYW5nZT17KGU6IENoYW5nZUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+KSA9PiBzZXRUcmFja2luZ051bWJlcihlLnRhcmdldC52YWx1ZSl9XG5cdFx0XHRcdFx0XHQvPlxuXHRcdFx0XHRcdDwvRm9ybUdyb3VwPlxuXHRcdFx0XHRcdDxCb3g+XG5cdFx0XHRcdFx0XHQ8QnV0dG9uXG5cdFx0XHRcdFx0XHRcdHN0eWxlPXt7IGJvcmRlckNvbG9yOiAnd2hpdGUnLCBiYWNrZ3JvdW5kOiAnI2ZhY2MxNScsIGNvbG9yOiAnYmxhY2snIH19XG5cdFx0XHRcdFx0XHRcdHZhcmlhbnQ9J2NvbnRhaW5lZCdcblx0XHRcdFx0XHRcdFx0Y29sb3I9J3ByaW1hcnknXG5cdFx0XHRcdFx0XHRcdG9uQ2xpY2s9e2hhbmRsZVNhdmV9XG5cdFx0XHRcdFx0XHRcdGRpc2FibGVkPXtzYXZpbmd9XG5cdFx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHRcdHtzYXZpbmcgPyB0cmFuc2xhdGVNZXNzYWdlKCdmdWxmaWxsbWVudC1zYXZlLXByb2dyZXNzJykgOiB0cmFuc2xhdGVNZXNzYWdlKCdjb25maXJtJyl9XG5cdFx0XHRcdFx0XHQ8L0J1dHRvbj5cblx0XHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0PC9Cb3g+XG5cdFx0XHQpfVxuXHRcdDwvQm94PlxuXHQpO1xufVxuIiwiaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQXBpQ2xpZW50LCB0eXBlIEFjdGlvblByb3BzLCB1c2VOb3RpY2UsIHVzZVRyYW5zbGF0aW9uIH0gZnJvbSAnYWRtaW5qcyc7XG5pbXBvcnQgeyBCb3gsIEJ1dHRvbiwgSWNvbiwgVGFibGUsIFRhYmxlQm9keSwgVGFibGVDZWxsLCBUYWJsZUhlYWQsIFRhYmxlUm93LCBUZXh0IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSc7XG5cbmNvbnN0IGFwaSA9IG5ldyBBcGlDbGllbnQoKTtcblxudHlwZSBQYWNraW5nU2xpcEl0ZW0gPSB7XG5cdG5hbWU6IHN0cmluZztcblx0cXVhbnRpdHk6IG51bWJlcjtcblx0dW5pdFByaWNlOiBudW1iZXI7XG5cdHByaWNlOiBudW1iZXI7XG59O1xuXG50eXBlIFBhY2tpbmdTbGlwUGF5bG9hZCA9IHtcblx0b3JkZXJJZDogc3RyaW5nO1xuXHRjcmVhdGVkQXQ6IHN0cmluZztcblx0c3RhdHVzOiBzdHJpbmc7XG5cdGNvbnRhY3ROYW1lOiBzdHJpbmcgfCBudWxsO1xuXHRjb250YWN0TGFzdE5hbWU6IHN0cmluZyB8IG51bGw7XG5cdGNvbnRhY3RFbWFpbDogc3RyaW5nIHwgbnVsbDtcblx0Y29udGFjdFBob25lOiBzdHJpbmcgfCBudWxsO1xuXHRwYXltZW50TWV0aG9kOiBzdHJpbmcgfCBudWxsO1xuXHRzaGlwbWVudE1ldGhvZDogc3RyaW5nIHwgbnVsbDtcblx0Y2Fycmllcjogc3RyaW5nIHwgbnVsbDtcblx0dHJhY2tpbmdOdW1iZXI6IHN0cmluZyB8IG51bGw7XG5cdHRvdGFsOiBudW1iZXI7XG5cdGl0ZW1zOiBQYWNraW5nU2xpcEl0ZW1bXTtcbn07XG5cbmNvbnN0IGZvcm1hdE1vbmV5ID0gKHZhbHVlOiBudW1iZXIsIGN1cnJlbmN5ID0gJ1VBSCcpID0+IHtcblx0Y29uc3Qgc2FmZVZhbHVlID0gTnVtYmVyLmlzRmluaXRlKHZhbHVlKSA/IHZhbHVlIDogMDtcblx0dHJ5IHtcblx0XHRyZXR1cm4gbmV3IEludGwuTnVtYmVyRm9ybWF0KHVuZGVmaW5lZCwge1xuXHRcdFx0c3R5bGU6ICdjdXJyZW5jeScsXG5cdFx0XHRjdXJyZW5jeSxcblx0XHRcdG1pbmltdW1GcmFjdGlvbkRpZ2l0czogMixcblx0XHRcdG1heGltdW1GcmFjdGlvbkRpZ2l0czogMixcblx0XHR9KS5mb3JtYXQoc2FmZVZhbHVlKTtcblx0fSBjYXRjaCB7XG5cdFx0cmV0dXJuIHNhZmVWYWx1ZS50b0ZpeGVkKDIpO1xuXHR9XG59O1xuXG5jb25zdCBub3JtYWxpemVGdWxsTmFtZSA9IChmaXJzdDogc3RyaW5nIHwgbnVsbCwgbGFzdDogc3RyaW5nIHwgbnVsbCkgPT4ge1xuXHRjb25zdCBmaXJzdFRyaW1tZWQgPSAoZmlyc3QgPz8gJycpLnRyaW0oKTtcblx0Y29uc3QgbGFzdFRyaW1tZWQgPSAobGFzdCA/PyAnJykudHJpbSgpO1xuXHRpZiAoIWZpcnN0VHJpbW1lZCAmJiAhbGFzdFRyaW1tZWQpIHJldHVybiBudWxsO1xuXHRpZiAoIWxhc3RUcmltbWVkKSByZXR1cm4gZmlyc3RUcmltbWVkIHx8IG51bGw7XG5cdGlmICghZmlyc3RUcmltbWVkKSByZXR1cm4gbGFzdFRyaW1tZWQgfHwgbnVsbDtcblxuXHRjb25zdCBmaXJzdExvd2VyID0gZmlyc3RUcmltbWVkLnRvTG9jYWxlTG93ZXJDYXNlKCk7XG5cdGNvbnN0IGxhc3RMb3dlciA9IGxhc3RUcmltbWVkLnRvTG9jYWxlTG93ZXJDYXNlKCk7XG5cdGlmIChmaXJzdExvd2VyLmluY2x1ZGVzKGxhc3RMb3dlcikpIHtcblx0XHRyZXR1cm4gZmlyc3RUcmltbWVkO1xuXHR9XG5cdHJldHVybiBgJHtmaXJzdFRyaW1tZWR9ICR7bGFzdFRyaW1tZWR9YDtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIE9yZGVyUGFja2luZ1NsaXBBY3Rpb24oeyBhY3Rpb24sIHJlY29yZCwgcmVzb3VyY2UgfTogQWN0aW9uUHJvcHMpIHtcblx0Y29uc3QgcmVjb3JkSWQgPSByZWNvcmQ/LmlkO1xuXHRjb25zdCBbcGF5bG9hZCwgc2V0UGF5bG9hZF0gPSB1c2VTdGF0ZTxQYWNraW5nU2xpcFBheWxvYWQgfCBudWxsPihudWxsKTtcblx0Y29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuXHRjb25zdCBhZGROb3RpY2UgPSB1c2VOb3RpY2UoKTtcblx0Y29uc3QgYWRkTm90aWNlUmVmID0gdXNlUmVmKGFkZE5vdGljZSk7XG5cdGNvbnN0IHsgdHJhbnNsYXRlQWN0aW9uLCB0cmFuc2xhdGVNZXNzYWdlIH0gPSB1c2VUcmFuc2xhdGlvbigpO1xuXG5cdHVzZUVmZmVjdCgoKSA9PiB7XG5cdFx0YWRkTm90aWNlUmVmLmN1cnJlbnQgPSBhZGROb3RpY2U7XG5cdH0sIFthZGROb3RpY2VdKTtcblxuXHR1c2VFZmZlY3QoKCkgPT4ge1xuXHRcdGlmICghcmVjb3JkSWQpIHJldHVybjtcblx0XHRsZXQgaXNBY3RpdmUgPSB0cnVlO1xuXHRcdHNldExvYWRpbmcodHJ1ZSk7XG5cdFx0YXBpLnJlY29yZEFjdGlvbih7XG5cdFx0XHRyZXNvdXJjZUlkOiByZXNvdXJjZS5pZCxcblx0XHRcdHJlY29yZElkLFxuXHRcdFx0YWN0aW9uTmFtZTogYWN0aW9uLm5hbWUsXG5cdFx0XHRtZXRob2Q6ICdnZXQnLFxuXHRcdH0pXG5cdFx0XHQudGhlbigocmVzcG9uc2UpID0+IHtcblx0XHRcdFx0aWYgKCFpc0FjdGl2ZSkgcmV0dXJuO1xuXHRcdFx0XHRzZXRQYXlsb2FkKChyZXNwb25zZS5kYXRhLnBheWxvYWQgPz8gbnVsbCkgYXMgUGFja2luZ1NsaXBQYXlsb2FkIHwgbnVsbCk7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKCgpID0+IHtcblx0XHRcdFx0aWYgKCFpc0FjdGl2ZSkgcmV0dXJuO1xuXHRcdFx0XHRhZGROb3RpY2VSZWYuY3VycmVudCh7IG1lc3NhZ2U6ICdwYWNraW5nLXNsaXAtbG9hZC1mYWlsZWQnLCB0eXBlOiAnZXJyb3InIH0pO1xuXHRcdFx0fSlcblx0XHRcdC5maW5hbGx5KCgpID0+IHtcblx0XHRcdFx0aWYgKCFpc0FjdGl2ZSkgcmV0dXJuO1xuXHRcdFx0XHRzZXRMb2FkaW5nKGZhbHNlKTtcblx0XHRcdH0pO1xuXHRcdHJldHVybiAoKSA9PiB7XG5cdFx0XHRpc0FjdGl2ZSA9IGZhbHNlO1xuXHRcdH07XG5cdH0sIFthY3Rpb24ubmFtZSwgcmVjb3JkSWQsIHJlc291cmNlLmlkXSk7XG5cblx0Y29uc3QgdGl0bGUgPSB0cmFuc2xhdGVBY3Rpb24oYWN0aW9uLm5hbWUsIHJlc291cmNlLmlkKTtcblx0Y29uc3QgY3VzdG9tZXIgPSBwYXlsb2FkID8gbm9ybWFsaXplRnVsbE5hbWUocGF5bG9hZC5jb250YWN0TmFtZSwgcGF5bG9hZC5jb250YWN0TGFzdE5hbWUpIDogbnVsbDtcblxuXHRyZXR1cm4gKFxuXHRcdDxCb3hcblx0XHRcdHZhcmlhbnQ9J3doaXRlJ1xuXHRcdFx0cD0neHhsJ1xuXHRcdFx0Ym9yZGVyUmFkaXVzPSd4bCdcblx0XHRcdGJveFNoYWRvdz0nc20nXG5cdFx0XHRtYXhXaWR0aD0nOTIwcHgnXG5cdFx0XHRzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQgI0UyRThGMCcgfX1cblx0XHQ+XG5cdFx0XHQ8Qm94IGRpc3BsYXk9J2ZsZXgnIGFsaWduSXRlbXM9J2NlbnRlcicganVzdGlmeUNvbnRlbnQ9J3NwYWNlLWJldHdlZW4nIG1iPSd4bCc+XG5cdFx0XHRcdDxUZXh0IGZvbnRTaXplPSd4bCcgZm9udFdlaWdodD0nYm9sZCc+XG5cdFx0XHRcdFx0e3RpdGxlfVxuXHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHRcdDxCdXR0b25cblx0XHRcdFx0XHR2YXJpYW50PSdjb250YWluZWQnXG5cdFx0XHRcdFx0Y29sb3I9J3ByaW1hcnknXG5cdFx0XHRcdFx0b25DbGljaz17KCkgPT4gd2luZG93LnByaW50KCl9XG5cdFx0XHRcdFx0c3R5bGU9e3sgYm9yZGVyQ29sb3I6ICd3aGl0ZScsIGJhY2tncm91bmQ6ICcjZmFjYzE1JywgY29sb3I6ICdibGFjaycgfX1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdDxJY29uIGljb249J1ByaW50ZXInIC8+XG5cdFx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoJ3BhY2tpbmctc2xpcC1wcmludCcpfVxuXHRcdFx0XHQ8L0J1dHRvbj5cblx0XHRcdDwvQm94PlxuXG5cdFx0XHR7bG9hZGluZyB8fCAhcGF5bG9hZCA/IChcblx0XHRcdFx0PFRleHQgY29sb3I9J2dyZXk2MCc+XG5cdFx0XHRcdFx0e2xvYWRpbmcgPyB0cmFuc2xhdGVNZXNzYWdlKCdwYWNraW5nLXNsaXAtbG9hZGluZycpIDogdHJhbnNsYXRlTWVzc2FnZSgncGFja2luZy1zbGlwLWxvYWQtZmFpbGVkJyl9XG5cdFx0XHRcdDwvVGV4dD5cblx0XHRcdCkgOiAoXG5cdFx0XHRcdDxCb3ggc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywgZ2FwOiAxNiB9fT5cblx0XHRcdFx0XHQ8Qm94IHN0eWxlPXt7IGRpc3BsYXk6ICdncmlkJywgZ3JpZFRlbXBsYXRlQ29sdW1uczogJ3JlcGVhdChhdXRvLWZpdCwgbWlubWF4KDIyMHB4LCAxZnIpKScsIGdhcDogMTIgfX0+XG5cdFx0XHRcdFx0XHQ8Qm94IHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJywgYm9yZGVyUmFkaXVzOiAxMiwgcGFkZGluZzogMTQgfX0+XG5cdFx0XHRcdFx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnIGZvbnRTaXplPSdzbSc+XG5cdFx0XHRcdFx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoJ3BhY2tpbmctc2xpcC1vcmRlcicpfVxuXHRcdFx0XHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHRcdFx0XHRcdDxUZXh0IGZvbnRXZWlnaHQ9J2JvbGQnPntwYXlsb2FkLm9yZGVySWR9PC9UZXh0PlxuXHRcdFx0XHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJyBmb250U2l6ZT0nc20nPlxuXHRcdFx0XHRcdFx0XHRcdHtuZXcgRGF0ZShwYXlsb2FkLmNyZWF0ZWRBdCkudG9Mb2NhbGVTdHJpbmcoKX1cblx0XHRcdFx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdFx0XHQ8Qm94IHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJywgYm9yZGVyUmFkaXVzOiAxMiwgcGFkZGluZzogMTQgfX0+XG5cdFx0XHRcdFx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnIGZvbnRTaXplPSdzbSc+XG5cdFx0XHRcdFx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoJ3BhY2tpbmctc2xpcC1jdXN0b21lcicpfVxuXHRcdFx0XHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHRcdFx0XHRcdDxUZXh0IGZvbnRXZWlnaHQ9J2JvbGQnPntjdXN0b21lciA/PyAnLSd9PC9UZXh0PlxuXHRcdFx0XHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJyBmb250U2l6ZT0nc20nPlxuXHRcdFx0XHRcdFx0XHRcdHtwYXlsb2FkLmNvbnRhY3RQaG9uZSA/PyBwYXlsb2FkLmNvbnRhY3RFbWFpbCA/PyAnLSd9XG5cdFx0XHRcdFx0XHRcdDwvVGV4dD5cblx0XHRcdFx0XHRcdDwvQm94PlxuXHRcdFx0XHRcdFx0PEJveCBzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQgI0UyRThGMCcsIGJvcmRlclJhZGl1czogMTIsIHBhZGRpbmc6IDE0IH19PlxuXHRcdFx0XHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJyBmb250U2l6ZT0nc20nPlxuXHRcdFx0XHRcdFx0XHRcdHt0cmFuc2xhdGVNZXNzYWdlKCdwYWNraW5nLXNsaXAtZnVsZmlsbG1lbnQnKX1cblx0XHRcdFx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0XHRcdFx0XHQ8VGV4dCBmb250V2VpZ2h0PSdib2xkJz5cblx0XHRcdFx0XHRcdFx0XHR7cGF5bG9hZC5jYXJyaWVyID8/ICctJ31cblx0XHRcdFx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0XHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJyBmb250U2l6ZT0nc20nPlxuXHRcdFx0XHRcdFx0XHRcdHtwYXlsb2FkLnRyYWNraW5nTnVtYmVyID8/ICctJ31cblx0XHRcdFx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdFx0PC9Cb3g+XG5cblx0XHRcdFx0XHQ8VGFibGU+XG5cdFx0XHRcdFx0XHQ8VGFibGVIZWFkPlxuXHRcdFx0XHRcdFx0XHQ8VGFibGVSb3c+XG5cdFx0XHRcdFx0XHRcdFx0PFRhYmxlQ2VsbD57dHJhbnNsYXRlTWVzc2FnZSgncGFja2luZy1zbGlwLWl0ZW0nKX08L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHQ8VGFibGVDZWxsPnt0cmFuc2xhdGVNZXNzYWdlKCdwYWNraW5nLXNsaXAtcXR5Jyl9PC9UYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHRcdFx0PFRhYmxlQ2VsbD57dHJhbnNsYXRlTWVzc2FnZSgncGFja2luZy1zbGlwLXVuaXQnKX08L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHQ8VGFibGVDZWxsPnt0cmFuc2xhdGVNZXNzYWdlKCdwYWNraW5nLXNsaXAtbGluZScpfTwvVGFibGVDZWxsPlxuXHRcdFx0XHRcdFx0XHQ8L1RhYmxlUm93PlxuXHRcdFx0XHRcdFx0PC9UYWJsZUhlYWQ+XG5cdFx0XHRcdFx0XHQ8VGFibGVCb2R5PlxuXHRcdFx0XHRcdFx0XHR7cGF5bG9hZC5pdGVtcy5tYXAoKGl0ZW0sIGluZGV4KSA9PiAoXG5cdFx0XHRcdFx0XHRcdFx0PFRhYmxlUm93IGtleT17YCR7aXRlbS5uYW1lfS0ke2luZGV4fWB9PlxuXHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlQ2VsbD57aXRlbS5uYW1lfTwvVGFibGVDZWxsPlxuXHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlQ2VsbD57aXRlbS5xdWFudGl0eX08L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZUNlbGw+e2Zvcm1hdE1vbmV5KGl0ZW0udW5pdFByaWNlKX08L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZUNlbGw+e2Zvcm1hdE1vbmV5KGl0ZW0ucHJpY2UpfTwvVGFibGVDZWxsPlxuXHRcdFx0XHRcdFx0XHRcdDwvVGFibGVSb3c+XG5cdFx0XHRcdFx0XHRcdCkpfVxuXHRcdFx0XHRcdFx0PC9UYWJsZUJvZHk+XG5cdFx0XHRcdFx0PC9UYWJsZT5cblxuXHRcdFx0XHRcdDxCb3ggZGlzcGxheT0nZmxleCcganVzdGlmeUNvbnRlbnQ9J2ZsZXgtZW5kJz5cblx0XHRcdFx0XHRcdDxCb3ggc3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnLCBib3JkZXJSYWRpdXM6IDEyLCBwYWRkaW5nOiAxNCwgbWluV2lkdGg6IDI2MCB9fT5cblx0XHRcdFx0XHRcdFx0PFRleHQgY29sb3I9J2dyZXk2MCcgZm9udFNpemU9J3NtJz5cblx0XHRcdFx0XHRcdFx0XHR7dHJhbnNsYXRlTWVzc2FnZSgndG90YWwnKX1cblx0XHRcdFx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0XHRcdFx0XHQ8VGV4dCBmb250U2l6ZT0neGwnIGZvbnRXZWlnaHQ9J2JvbGQnPlxuXHRcdFx0XHRcdFx0XHRcdHtmb3JtYXRNb25leShwYXlsb2FkLnRvdGFsKX1cblx0XHRcdFx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdDwvQm94PlxuXHRcdFx0KX1cblx0XHQ8L0JveD5cblx0KTtcbn1cbiIsImltcG9ydCB0eXBlIHsgU2hvd1Byb3BlcnR5UHJvcHMgfSBmcm9tICdhZG1pbmpzJztcblxuY29uc3QgZm9ybWF0TW9uZXkgPSAodmFsdWU6IG51bWJlciwgY3VycmVuY3kgPSAnVUFIJykgPT4ge1xuXHRjb25zdCBzYWZlVmFsdWUgPSBOdW1iZXIuaXNGaW5pdGUodmFsdWUpID8gdmFsdWUgOiAwO1xuXHR0cnkge1xuXHRcdHJldHVybiBuZXcgSW50bC5OdW1iZXJGb3JtYXQodW5kZWZpbmVkLCB7XG5cdFx0XHRzdHlsZTogJ2N1cnJlbmN5Jyxcblx0XHRcdGN1cnJlbmN5LFxuXHRcdFx0bWluaW11bUZyYWN0aW9uRGlnaXRzOiAyLFxuXHRcdFx0bWF4aW11bUZyYWN0aW9uRGlnaXRzOiAyLFxuXHRcdH0pLmZvcm1hdChzYWZlVmFsdWUpO1xuXHR9IGNhdGNoIHtcblx0XHRyZXR1cm4gc2FmZVZhbHVlLnRvRml4ZWQoMik7XG5cdH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIE9yZGVyVG90YWxMaXN0KHByb3BzOiBTaG93UHJvcGVydHlQcm9wcykge1xuXHRjb25zdCB7IHJlY29yZCwgcHJvcGVydHkgfSA9IHByb3BzO1xuXHRjb25zdCByYXcgPSByZWNvcmQucGFyYW1zW3Byb3BlcnR5LnBhdGhdO1xuXHRjb25zdCBudW1lcmljID0gTnVtYmVyKHJhdyA/PyAwKTtcblx0cmV0dXJuIGZvcm1hdE1vbmV5KG51bWVyaWMpO1xufVxuIiwiaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSwgdHlwZSBDaGFuZ2VFdmVudCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB0eXBlIHsgRWRpdFByb3BlcnR5UHJvcHMgfSBmcm9tICdhZG1pbmpzJztcbmltcG9ydCB7IEZvcm1Hcm91cCwgSW5wdXQsIExhYmVsIH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSc7XG5pbXBvcnQgeyB1c2VUcmFuc2xhdGlvbiB9IGZyb20gJ2FkbWluanMnO1xuXG5jb25zdCBwYXJzZU51bWJlciA9ICh2YWx1ZTogc3RyaW5nKTogbnVtYmVyIHwgbnVsbCA9PiB7XG5cdGNvbnN0IG5vcm1hbGl6ZWQgPSB2YWx1ZS50cmltKCk7XG5cdGlmICghbm9ybWFsaXplZCkgcmV0dXJuIG51bGw7XG5cdGNvbnN0IG51bWVyaWMgPSBOdW1iZXIobm9ybWFsaXplZCk7XG5cdHJldHVybiBOdW1iZXIuaXNGaW5pdGUobnVtZXJpYykgPyBudW1lcmljIDogbnVsbDtcbn07XG5cbmNvbnN0IGJ1aWxkRmlsdGVySnNvbiA9IChtaW46IHN0cmluZywgbWF4OiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuXHRjb25zdCBtaW5WYWx1ZSA9IHBhcnNlTnVtYmVyKG1pbik7XG5cdGNvbnN0IG1heFZhbHVlID0gcGFyc2VOdW1iZXIobWF4KTtcblx0aWYgKG1pblZhbHVlID09PSBudWxsICYmIG1heFZhbHVlID09PSBudWxsKSByZXR1cm4gJyc7XG5cdGlmIChtaW5WYWx1ZSAhPT0gbnVsbCAmJiBtYXhWYWx1ZSAhPT0gbnVsbCkgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHsgZ3RlOiBtaW5WYWx1ZSwgbHRlOiBtYXhWYWx1ZSB9KTtcblx0aWYgKG1pblZhbHVlICE9PSBudWxsKSByZXR1cm4gSlNPTi5zdHJpbmdpZnkoeyBndGU6IG1pblZhbHVlIH0pO1xuXHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkoeyBsdGU6IG1heFZhbHVlIH0pO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gT3JkZXJUb3RhbFJhbmdlRmlsdGVyKHByb3BzOiBFZGl0UHJvcGVydHlQcm9wcykge1xuXHRjb25zdCB7IG9uQ2hhbmdlLCBwcm9wZXJ0eSwgZmlsdGVyIH0gPSBwcm9wcztcblx0Y29uc3QgeyB0cmFuc2xhdGVQcm9wZXJ0eSB9ID0gdXNlVHJhbnNsYXRpb24oKTtcblx0Y29uc3QgZmlsdGVyVmFsdWUgPSBmaWx0ZXJbcHJvcGVydHkucGF0aF0gYXMgc3RyaW5nIHwgdW5kZWZpbmVkO1xuXG5cdGNvbnN0IFttaW4sIHNldE1pbl0gPSB1c2VTdGF0ZSgnJyk7XG5cdGNvbnN0IFttYXgsIHNldE1heF0gPSB1c2VTdGF0ZSgnJyk7XG5cblx0dXNlRWZmZWN0KCgpID0+IHtcblx0XHRpZiAoIWZpbHRlclZhbHVlKSB7XG5cdFx0XHRzZXRNaW4oJycpO1xuXHRcdFx0c2V0TWF4KCcnKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UoZmlsdGVyVmFsdWUpIGFzIHVua25vd247XG5cdFx0XHRpZiAocGFyc2VkICYmIHR5cGVvZiBwYXJzZWQgPT09ICdvYmplY3QnKSB7XG5cdFx0XHRcdGNvbnN0IG9iaiA9IHBhcnNlZCBhcyB7IGd0ZT86IHVua25vd247IGx0ZT86IHVua25vd24gfTtcblx0XHRcdFx0c2V0TWluKHR5cGVvZiBvYmouZ3RlID09PSAnbnVtYmVyJyA/IFN0cmluZyhvYmouZ3RlKSA6ICcnKTtcblx0XHRcdFx0c2V0TWF4KHR5cGVvZiBvYmoubHRlID09PSAnbnVtYmVyJyA/IFN0cmluZyhvYmoubHRlKSA6ICcnKTtcblx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIHBhcnNlZCA9PT0gJ251bWJlcicpIHtcblx0XHRcdFx0c2V0TWluKFN0cmluZyhwYXJzZWQpKTtcblx0XHRcdFx0c2V0TWF4KCcnKTtcblx0XHRcdH1cblx0XHR9IGNhdGNoIHtcblx0XHRcdC8vIGlnbm9yZVxuXHRcdH1cblx0fSwgW2ZpbHRlclZhbHVlXSk7XG5cblx0cmV0dXJuIChcblx0XHQ8Rm9ybUdyb3VwIHZhcmlhbnQ9J2ZpbHRlcic+XG5cdFx0XHQ8TGFiZWw+e3RyYW5zbGF0ZVByb3BlcnR5KHByb3BlcnR5LmxhYmVsLCBwcm9wZXJ0eS5yZXNvdXJjZUlkKX08L0xhYmVsPlxuXHRcdFx0PElucHV0XG5cdFx0XHRcdG5hbWU9e2BmaWx0ZXItJHtwcm9wZXJ0eS5wYXRofS1taW5gfVxuXHRcdFx0XHR0eXBlPSdudW1iZXInXG5cdFx0XHRcdGlucHV0TW9kZT0nZGVjaW1hbCdcblx0XHRcdFx0cGxhY2Vob2xkZXI9e3RyYW5zbGF0ZVByb3BlcnR5KCdmcm9tJyl9XG5cdFx0XHRcdHZhbHVlPXttaW59XG5cdFx0XHRcdG9uQ2hhbmdlPXsoZTogQ2hhbmdlRXZlbnQ8SFRNTElucHV0RWxlbWVudD4pID0+IHtcblx0XHRcdFx0XHRjb25zdCBuZXh0ID0gZS50YXJnZXQudmFsdWU7XG5cdFx0XHRcdFx0c2V0TWluKG5leHQpO1xuXHRcdFx0XHRcdG9uQ2hhbmdlKHByb3BlcnR5LnBhdGgsIGJ1aWxkRmlsdGVySnNvbihuZXh0LCBtYXgpKTtcblx0XHRcdFx0fX1cblx0XHRcdC8+XG5cdFx0XHQ8SW5wdXRcblx0XHRcdFx0bmFtZT17YGZpbHRlci0ke3Byb3BlcnR5LnBhdGh9LW1heGB9XG5cdFx0XHRcdHR5cGU9J251bWJlcidcblx0XHRcdFx0aW5wdXRNb2RlPSdkZWNpbWFsJ1xuXHRcdFx0XHRwbGFjZWhvbGRlcj17dHJhbnNsYXRlUHJvcGVydHkoJ3RvJyl9XG5cdFx0XHRcdHZhbHVlPXttYXh9XG5cdFx0XHRcdG10PSdkZWZhdWx0J1xuXHRcdFx0XHRvbkNoYW5nZT17KGU6IENoYW5nZUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+KSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgbmV4dCA9IGUudGFyZ2V0LnZhbHVlO1xuXHRcdFx0XHRcdHNldE1heChuZXh0KTtcblx0XHRcdFx0XHRvbkNoYW5nZShwcm9wZXJ0eS5wYXRoLCBidWlsZEZpbHRlckpzb24obWluLCBuZXh0KSk7XG5cdFx0XHRcdH19XG5cdFx0XHQvPlxuXHRcdDwvRm9ybUdyb3VwPlxuXHQpO1xufVxuIiwiaW1wb3J0IHR5cGUgeyBGaWx0ZXJQcm9wZXJ0eVByb3BzIH0gZnJvbSAnYWRtaW5qcyc7XG5pbXBvcnQgeyB1c2VUcmFuc2xhdGlvbiB9IGZyb20gJ2FkbWluanMnO1xuaW1wb3J0IHsgRm9ybUdyb3VwLCBMYWJlbCwgU2VsZWN0IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSc7XG5cbnR5cGUgU2VsZWN0T3B0aW9uID0geyB2YWx1ZTogc3RyaW5nIHwgbnVtYmVyOyBsYWJlbDogc3RyaW5nIH07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFNlbGVjdEZpbHRlcldpdGhQbGFjZWhvbGRlcihwcm9wczogRmlsdGVyUHJvcGVydHlQcm9wcykge1xuXHRjb25zdCB7IHByb3BlcnR5LCBmaWx0ZXIsIG9uQ2hhbmdlIH0gPSBwcm9wcztcblx0Y29uc3QgeyB0bCwgdHJhbnNsYXRlTWVzc2FnZSwgdHJhbnNsYXRlUHJvcGVydHkgfSA9IHVzZVRyYW5zbGF0aW9uKCk7XG5cblx0Y29uc3QgYXZhaWxhYmxlVmFsdWVzID0gcHJvcGVydHkuYXZhaWxhYmxlVmFsdWVzID8/IFtdO1xuXHRjb25zdCBvcHRpb25zOiBTZWxlY3RPcHRpb25bXSA9IGF2YWlsYWJsZVZhbHVlcy5tYXAoKG9wdGlvbikgPT4gKHtcblx0XHR2YWx1ZTogb3B0aW9uLnZhbHVlLFxuXHRcdGxhYmVsOiB0bChgJHtwcm9wZXJ0eS5wYXRofS4ke29wdGlvbi52YWx1ZX1gLCBwcm9wZXJ0eS5yZXNvdXJjZUlkLCB7XG5cdFx0XHRkZWZhdWx0VmFsdWU6IG9wdGlvbi5sYWJlbCA/PyBTdHJpbmcob3B0aW9uLnZhbHVlKSxcblx0XHR9KSxcblx0fSkpO1xuXG5cdGNvbnN0IGN1cnJlbnRWYWx1ZSA9IGZpbHRlcltwcm9wZXJ0eS5wYXRoXSA/PyAnJztcblx0Y29uc3Qgc2VsZWN0ZWQgPVxuXHRcdG9wdGlvbnMuZmluZCgob3B0aW9uKSA9PiBTdHJpbmcob3B0aW9uLnZhbHVlKSA9PT0gU3RyaW5nKGN1cnJlbnRWYWx1ZSkpID8/IG51bGw7XG5cblx0cmV0dXJuIChcblx0XHQ8Rm9ybUdyb3VwIHZhcmlhbnQ9J2ZpbHRlcic+XG5cdFx0XHQ8TGFiZWw+e3RyYW5zbGF0ZVByb3BlcnR5KHByb3BlcnR5LmxhYmVsLCBwcm9wZXJ0eS5yZXNvdXJjZUlkKX08L0xhYmVsPlxuXHRcdFx0PFNlbGVjdFxuXHRcdFx0XHR2YXJpYW50PSdmaWx0ZXInXG5cdFx0XHRcdGlzQ2xlYXJhYmxlXG5cdFx0XHRcdHBsYWNlaG9sZGVyPXt0cmFuc2xhdGVNZXNzYWdlKCdzZWxlY3QtcGxhY2Vob2xkZXInLCB7IGRlZmF1bHRWYWx1ZTogJ1NlbGVjdC4uLicgfSl9XG5cdFx0XHRcdG9wdGlvbnM9e29wdGlvbnN9XG5cdFx0XHRcdHZhbHVlPXtzZWxlY3RlZH1cblx0XHRcdFx0b25DaGFuZ2U9eyhvcHRpb246IFNlbGVjdE9wdGlvbiB8IG51bGwpID0+IHtcblx0XHRcdFx0XHRjb25zdCB2YWx1ZSA9IG9wdGlvbiA/IG9wdGlvbi52YWx1ZSA6ICcnO1xuXHRcdFx0XHRcdG9uQ2hhbmdlKHByb3BlcnR5LnBhdGgsIHZhbHVlKTtcblx0XHRcdFx0fX1cblx0XHRcdC8+XG5cdFx0PC9Gb3JtR3JvdXA+XG5cdCk7XG59XG4iLCJpbXBvcnQgeyB1c2VFZmZlY3QsIHVzZU1lbW8sIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQXBpQ2xpZW50LCB0eXBlIEFjdGlvblByb3BzLCBPcmlnaW5hbFNob3csIHVzZU5vdGljZSwgdXNlVHJhbnNsYXRpb24gfSBmcm9tICdhZG1pbmpzJztcbmltcG9ydCB7XG5cdEJhZGdlLFxuXHRCb3gsXG5cdEJ1dHRvbixcblx0Rm9ybUdyb3VwLFxuXHRMYWJlbCxcblx0U2VsZWN0LFxuXHRUYWJsZSxcblx0VGFibGVCb2R5LFxuXHRUYWJsZUNlbGwsXG5cdFRhYmxlSGVhZCxcblx0VGFibGVSb3csXG5cdFRleHQsXG59IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xuXG5jb25zdCBhcGkgPSBuZXcgQXBpQ2xpZW50KCk7XG5cbnR5cGUgVXNlcktwaXNQYXlsb2FkID0ge1xuXHR0b3RhbE9yZGVyczogbnVtYmVyO1xuXHRsaWZldGltZVZhbHVlOiBudW1iZXI7XG5cdGF2ZXJhZ2VPcmRlclZhbHVlOiBudW1iZXI7XG5cdGxhc3RPcmRlckRhdGU6IHN0cmluZyB8IG51bGw7XG59O1xuXG50eXBlIFVzZXJBZG1pblN0YXR1cyA9ICdBQ1RJVkUnIHwgJ1NVU1BFTkRFRCcgfCAnQkxPQ0tFRCc7XG50eXBlIFN0YXR1c09wdGlvbiA9IHsgdmFsdWU6IFVzZXJBZG1pblN0YXR1czsgbGFiZWw6IHN0cmluZyB9O1xuXG50eXBlIFVzZXJSZWxhdGVkUGF5bG9hZCA9IHtcblx0b3JkZXJzOiB7IGlkOiBzdHJpbmc7IHN0YXR1czogc3RyaW5nOyB0b3RhbDogbnVtYmVyOyBjcmVhdGVkQXQ6IHN0cmluZyB9W107XG5cdHJldmlld3M6IHtcblx0XHRpZDogc3RyaW5nO1xuXHRcdHJhdGluZzogbnVtYmVyO1xuXHRcdGNvbW1lbnQ6IHN0cmluZztcblx0XHRjcmVhdGVkQXQ6IHN0cmluZztcblx0XHRwcm9kdWN0SWQ6IHN0cmluZztcblx0XHRwcm9kdWN0TmFtZTogc3RyaW5nO1xuXHR9W107XG5cdHdpc2hsaXN0OiB7IHByb2R1Y3RJZDogc3RyaW5nOyBwcm9kdWN0TmFtZTogc3RyaW5nOyBjcmVhdGVkQXQ6IHN0cmluZyB9W107XG5cdHJlY2VudGx5Vmlld2VkOiB7IHByb2R1Y3RJZDogc3RyaW5nOyBwcm9kdWN0TmFtZTogc3RyaW5nOyBjcmVhdGVkQXQ6IHN0cmluZyB9W107XG59O1xuXG5jb25zdCBmb3JtYXRNb25leSA9ICh2YWx1ZTogbnVtYmVyLCBjdXJyZW5jeSA9ICdVQUgnKSA9PiB7XG5cdGNvbnN0IHNhZmVWYWx1ZSA9IE51bWJlci5pc0Zpbml0ZSh2YWx1ZSkgPyB2YWx1ZSA6IDA7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIG5ldyBJbnRsLk51bWJlckZvcm1hdCh1bmRlZmluZWQsIHtcblx0XHRcdHN0eWxlOiAnY3VycmVuY3knLFxuXHRcdFx0Y3VycmVuY3ksXG5cdFx0XHRtaW5pbXVtRnJhY3Rpb25EaWdpdHM6IDIsXG5cdFx0XHRtYXhpbXVtRnJhY3Rpb25EaWdpdHM6IDIsXG5cdFx0fSkuZm9ybWF0KHNhZmVWYWx1ZSk7XG5cdH0gY2F0Y2gge1xuXHRcdHJldHVybiBzYWZlVmFsdWUudG9GaXhlZCgyKTtcblx0fVxufTtcblxuY29uc3QgZm9ybWF0RGF0ZSA9ICh2YWx1ZTogc3RyaW5nIHwgbnVsbCkgPT4ge1xuXHRpZiAoIXZhbHVlKSByZXR1cm4gJy0nO1xuXHRjb25zdCBwYXJzZWQgPSBEYXRlLnBhcnNlKHZhbHVlKTtcblx0cmV0dXJuIE51bWJlci5pc05hTihwYXJzZWQpID8gdmFsdWUgOiBuZXcgRGF0ZShwYXJzZWQpLnRvTG9jYWxlU3RyaW5nKCk7XG59O1xuXG5jb25zdCBnZXRSb290UGF0aCA9ICgpID0+IHtcblx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSByZXR1cm4gJyc7XG5cdGNvbnN0IHBhdGggPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgPz8gJyc7XG5cdGNvbnN0IHBhcnRzID0gcGF0aC5zcGxpdCgnL3Jlc291cmNlcycpO1xuXHRyZXR1cm4gcGFydHNbMF0gPz8gJyc7XG59O1xuXG5jb25zdCBidWlsZFJlY29yZFNob3dIcmVmID0gKHJlc291cmNlSWQ6IHN0cmluZywgcmVjb3JkSWQ6IHN0cmluZykgPT5cblx0YCR7Z2V0Um9vdFBhdGgoKX0vcmVzb3VyY2VzLyR7cmVzb3VyY2VJZH0vcmVjb3Jkcy8ke3JlY29yZElkfS9zaG93YDtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gVXNlclNob3cocHJvcHM6IEFjdGlvblByb3BzKSB7XG5cdGNvbnN0IHsgcmVjb3JkLCByZXNvdXJjZSB9ID0gcHJvcHM7XG5cdGNvbnN0IHJlY29yZElkID0gcmVjb3JkPy5pZDtcblx0Y29uc3QgeyB0cmFuc2xhdGVNZXNzYWdlIH0gPSB1c2VUcmFuc2xhdGlvbigpO1xuXHRjb25zdCBhZGROb3RpY2UgPSB1c2VOb3RpY2UoKTtcblx0Y29uc3QgW3BheWxvYWQsIHNldFBheWxvYWRdID0gdXNlU3RhdGU8VXNlcktwaXNQYXlsb2FkIHwgbnVsbD4obnVsbCk7XG5cdGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcblx0Y29uc3QgW3JlbGF0ZWQsIHNldFJlbGF0ZWRdID0gdXNlU3RhdGU8VXNlclJlbGF0ZWRQYXlsb2FkIHwgbnVsbD4obnVsbCk7XG5cdGNvbnN0IFtyZWxhdGVkTG9hZGluZywgc2V0UmVsYXRlZExvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuXHRjb25zdCBbbG9jYWxSZWNvcmQsIHNldExvY2FsUmVjb3JkXSA9IHVzZVN0YXRlKHJlY29yZCk7XG5cdGNvbnN0IFthZG1pblN0YXR1cywgc2V0QWRtaW5TdGF0dXNdID0gdXNlU3RhdGU8VXNlckFkbWluU3RhdHVzPignQUNUSVZFJyk7XG5cdGNvbnN0IFthZG1pbk5vdGVzLCBzZXRBZG1pbk5vdGVzXSA9IHVzZVN0YXRlKCcnKTtcblx0Y29uc3QgW3NhdmluZ01ldGEsIHNldFNhdmluZ01ldGFdID0gdXNlU3RhdGUoZmFsc2UpO1xuXG5cdHVzZUVmZmVjdCgoKSA9PiB7XG5cdFx0c2V0TG9jYWxSZWNvcmQocmVjb3JkKTtcblx0XHRjb25zdCBuZXh0U3RhdHVzID0gKHJlY29yZD8ucGFyYW1zPy5hZG1pblN0YXR1cyBhcyBVc2VyQWRtaW5TdGF0dXMgfCB1bmRlZmluZWQpID8/ICdBQ1RJVkUnO1xuXHRcdGNvbnN0IG5leHROb3RlcyA9IChyZWNvcmQ/LnBhcmFtcz8uYWRtaW5Ob3RlcyBhcyBzdHJpbmcgfCB1bmRlZmluZWQpID8/ICcnO1xuXHRcdHNldEFkbWluU3RhdHVzKG5leHRTdGF0dXMpO1xuXHRcdHNldEFkbWluTm90ZXMobmV4dE5vdGVzKTtcblx0fSwgW3JlY29yZD8uaWRdKTtcblxuXHR1c2VFZmZlY3QoKCkgPT4ge1xuXHRcdGlmICghcmVjb3JkSWQpIHJldHVybjtcblx0XHRsZXQgaXNBY3RpdmUgPSB0cnVlO1xuXHRcdHNldExvYWRpbmcodHJ1ZSk7XG5cdFx0YXBpLnJlY29yZEFjdGlvbih7XG5cdFx0XHRyZXNvdXJjZUlkOiByZXNvdXJjZS5pZCxcblx0XHRcdHJlY29yZElkLFxuXHRcdFx0YWN0aW9uTmFtZTogJ3VzZXJLcGlzJyxcblx0XHRcdG1ldGhvZDogJ2dldCcsXG5cdFx0fSlcblx0XHRcdC50aGVuKChyZXNwb25zZSkgPT4ge1xuXHRcdFx0XHRpZiAoIWlzQWN0aXZlKSByZXR1cm47XG5cdFx0XHRcdHNldFBheWxvYWQoKHJlc3BvbnNlLmRhdGEucGF5bG9hZCA/PyBudWxsKSBhcyBVc2VyS3Bpc1BheWxvYWQgfCBudWxsKTtcblx0XHRcdH0pXG5cdFx0XHQuZmluYWxseSgoKSA9PiB7XG5cdFx0XHRcdGlmICghaXNBY3RpdmUpIHJldHVybjtcblx0XHRcdFx0c2V0TG9hZGluZyhmYWxzZSk7XG5cdFx0XHR9KTtcblx0XHRyZXR1cm4gKCkgPT4ge1xuXHRcdFx0aXNBY3RpdmUgPSBmYWxzZTtcblx0XHR9O1xuXHR9LCBbcmVjb3JkSWQsIHJlc291cmNlLmlkXSk7XG5cblx0dXNlRWZmZWN0KCgpID0+IHtcblx0XHRpZiAoIXJlY29yZElkKSByZXR1cm47XG5cdFx0bGV0IGlzQWN0aXZlID0gdHJ1ZTtcblx0XHRzZXRSZWxhdGVkTG9hZGluZyh0cnVlKTtcblx0XHRhcGkucmVjb3JkQWN0aW9uKHtcblx0XHRcdHJlc291cmNlSWQ6IHJlc291cmNlLmlkLFxuXHRcdFx0cmVjb3JkSWQsXG5cdFx0XHRhY3Rpb25OYW1lOiAndXNlclJlbGF0ZWREYXRhJyxcblx0XHRcdG1ldGhvZDogJ2dldCcsXG5cdFx0fSlcblx0XHRcdC50aGVuKChyZXNwb25zZSkgPT4ge1xuXHRcdFx0XHRpZiAoIWlzQWN0aXZlKSByZXR1cm47XG5cdFx0XHRcdHNldFJlbGF0ZWQoKHJlc3BvbnNlLmRhdGEucGF5bG9hZCA/PyBudWxsKSBhcyBVc2VyUmVsYXRlZFBheWxvYWQgfCBudWxsKTtcblx0XHRcdH0pXG5cdFx0XHQuZmluYWxseSgoKSA9PiB7XG5cdFx0XHRcdGlmICghaXNBY3RpdmUpIHJldHVybjtcblx0XHRcdFx0c2V0UmVsYXRlZExvYWRpbmcoZmFsc2UpO1xuXHRcdFx0fSk7XG5cdFx0cmV0dXJuICgpID0+IHtcblx0XHRcdGlzQWN0aXZlID0gZmFsc2U7XG5cdFx0fTtcblx0fSwgW3JlY29yZElkLCByZXNvdXJjZS5pZF0pO1xuXG5cdGNvbnN0IHN0YXR1c09wdGlvbnMgPSB1c2VNZW1vPFN0YXR1c09wdGlvbltdPihcblx0XHQoKSA9PiBbXG5cdFx0XHR7IHZhbHVlOiAnQUNUSVZFJywgbGFiZWw6IHRyYW5zbGF0ZU1lc3NhZ2UoJ3VzZXItc3RhdHVzLWFjdGl2ZScpIH0sXG5cdFx0XHR7IHZhbHVlOiAnU1VTUEVOREVEJywgbGFiZWw6IHRyYW5zbGF0ZU1lc3NhZ2UoJ3VzZXItc3RhdHVzLXN1c3BlbmRlZCcpIH0sXG5cdFx0XHR7IHZhbHVlOiAnQkxPQ0tFRCcsIGxhYmVsOiB0cmFuc2xhdGVNZXNzYWdlKCd1c2VyLXN0YXR1cy1ibG9ja2VkJykgfSxcblx0XHRdLFxuXHRcdFt0cmFuc2xhdGVNZXNzYWdlXVxuXHQpO1xuXHRjb25zdCBzZWxlY3RlZFN0YXR1c09wdGlvbiA9XG5cdFx0c3RhdHVzT3B0aW9ucy5maW5kKChvcHRpb24pID0+IG9wdGlvbi52YWx1ZSA9PT0gYWRtaW5TdGF0dXMpID8/IHN0YXR1c09wdGlvbnNbMF0gPz8gbnVsbDtcblxuXHRjb25zdCBsYXN0T3JkZXJUZXh0ID0gdXNlTWVtbygoKSA9PiB7XG5cdFx0aWYgKCFwYXlsb2FkPy5sYXN0T3JkZXJEYXRlKSByZXR1cm4gJy0nO1xuXHRcdGNvbnN0IHBhcnNlZCA9IERhdGUucGFyc2UocGF5bG9hZC5sYXN0T3JkZXJEYXRlKTtcblx0XHRyZXR1cm4gTnVtYmVyLmlzTmFOKHBhcnNlZCkgPyBwYXlsb2FkLmxhc3RPcmRlckRhdGUgOiBuZXcgRGF0ZShwYXJzZWQpLnRvTG9jYWxlU3RyaW5nKCk7XG5cdH0sIFtwYXlsb2FkPy5sYXN0T3JkZXJEYXRlXSk7XG5cblx0Y29uc3Qgc3RhdHVzQmFkZ2VTdHlsZSA9IHVzZU1lbW8oKCkgPT4ge1xuXHRcdGlmIChhZG1pblN0YXR1cyA9PT0gJ0JMT0NLRUQnKSB7XG5cdFx0XHRyZXR1cm4geyBiYWNrZ3JvdW5kOiAnI0ZFRDdENycsIGJvcmRlckNvbG9yOiAnI0U1M0UzRScsIGNvbG9yOiAnIzc0MkEyQScgfTtcblx0XHR9XG5cdFx0aWYgKGFkbWluU3RhdHVzID09PSAnU1VTUEVOREVEJykge1xuXHRcdFx0cmV0dXJuIHsgYmFja2dyb3VuZDogJyNGRUVCQzgnLCBib3JkZXJDb2xvcjogJyNERDZCMjAnLCBjb2xvcjogJyM3QjM0MUUnIH07XG5cdFx0fVxuXHRcdHJldHVybiB7IGJhY2tncm91bmQ6ICcjQzZGNkQ1JywgYm9yZGVyQ29sb3I6ICcjMzhBMTY5JywgY29sb3I6ICcjMjI1NDNEJyB9O1xuXHR9LCBbYWRtaW5TdGF0dXNdKTtcblxuXHRjb25zdCBpc0RpcnR5ID0gdXNlTWVtbygoKSA9PiB7XG5cdFx0Y29uc3QgYmFzZVN0YXR1cyA9IChsb2NhbFJlY29yZD8ucGFyYW1zPy5hZG1pblN0YXR1cyBhcyBVc2VyQWRtaW5TdGF0dXMgfCB1bmRlZmluZWQpID8/ICdBQ1RJVkUnO1xuXHRcdGNvbnN0IGJhc2VOb3RlcyA9IChsb2NhbFJlY29yZD8ucGFyYW1zPy5hZG1pbk5vdGVzIGFzIHN0cmluZyB8IHVuZGVmaW5lZCkgPz8gJyc7XG5cdFx0cmV0dXJuIGFkbWluU3RhdHVzICE9PSBiYXNlU3RhdHVzIHx8IGFkbWluTm90ZXMgIT09IGJhc2VOb3Rlcztcblx0fSwgW2FkbWluU3RhdHVzLCBhZG1pbk5vdGVzLCBsb2NhbFJlY29yZD8ucGFyYW1zPy5hZG1pbk5vdGVzLCBsb2NhbFJlY29yZD8ucGFyYW1zPy5hZG1pblN0YXR1c10pO1xuXG5cdGNvbnN0IGhhbmRsZVNhdmVNZXRhID0gYXN5bmMgKCkgPT4ge1xuXHRcdGlmICghbG9jYWxSZWNvcmQ/LmlkIHx8IHNhdmluZ01ldGEpIHJldHVybjtcblx0XHRzZXRTYXZpbmdNZXRhKHRydWUpO1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuXHRcdFx0Zm9ybURhdGEuYXBwZW5kKCdhZG1pblN0YXR1cycsIGFkbWluU3RhdHVzKTtcblx0XHRcdGZvcm1EYXRhLmFwcGVuZCgnYWRtaW5Ob3RlcycsIGFkbWluTm90ZXMpO1xuXHRcdFx0Y29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhcGkucmVjb3JkQWN0aW9uKHtcblx0XHRcdFx0cmVzb3VyY2VJZDogcmVzb3VyY2UuaWQsXG5cdFx0XHRcdHJlY29yZElkOiBsb2NhbFJlY29yZC5pZCxcblx0XHRcdFx0YWN0aW9uTmFtZTogJ3VwZGF0ZVVzZXJBZG1pbk1ldGEnLFxuXHRcdFx0XHRtZXRob2Q6ICdwb3N0Jyxcblx0XHRcdFx0ZGF0YTogZm9ybURhdGEsXG5cdFx0XHR9KTtcblx0XHRcdGlmIChyZXNwb25zZS5kYXRhLm5vdGljZSkge1xuXHRcdFx0XHRhZGROb3RpY2UocmVzcG9uc2UuZGF0YS5ub3RpY2UpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHJlc3BvbnNlLmRhdGEucmVjb3JkKSB7XG5cdFx0XHRcdHNldExvY2FsUmVjb3JkKHJlc3BvbnNlLmRhdGEucmVjb3JkKTtcblx0XHRcdFx0c2V0QWRtaW5TdGF0dXMoXG5cdFx0XHRcdFx0KChyZXNwb25zZS5kYXRhLnJlY29yZD8ucGFyYW1zPy5hZG1pblN0YXR1cyBhcyBVc2VyQWRtaW5TdGF0dXMgfCB1bmRlZmluZWQpID8/ICdBQ1RJVkUnKVxuXHRcdFx0XHQpO1xuXHRcdFx0XHRzZXRBZG1pbk5vdGVzKChyZXNwb25zZS5kYXRhLnJlY29yZD8ucGFyYW1zPy5hZG1pbk5vdGVzIGFzIHN0cmluZyB8IHVuZGVmaW5lZCkgPz8gJycpO1xuXHRcdFx0fVxuXHRcdH0gY2F0Y2gge1xuXHRcdFx0YWRkTm90aWNlKHsgbWVzc2FnZTogJ3VzZXItYWRtaW4tdXBkYXRlLWZhaWxlZCcsIHR5cGU6ICdlcnJvcicgfSk7XG5cdFx0fSBmaW5hbGx5IHtcblx0XHRcdHNldFNhdmluZ01ldGEoZmFsc2UpO1xuXHRcdH1cblx0fTtcblxuXHRyZXR1cm4gKFxuXHRcdDxCb3g+XG5cdFx0XHQ8Qm94XG5cdFx0XHRcdHZhcmlhbnQ9J3doaXRlJ1xuXHRcdFx0XHRwPSd4eGwnXG5cdFx0XHRcdGJvcmRlclJhZGl1cz0neGwnXG5cdFx0XHRcdGJveFNoYWRvdz0nc20nXG5cdFx0XHRcdG1iPSd4bCdcblx0XHRcdFx0c3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnIH19XG5cdFx0XHQ+XG5cdFx0XHRcdDxUZXh0IGZvbnRXZWlnaHQ9J2JvbGQnIG1iPSdsZyc+XG5cdFx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoJ2N1c3RvbWVyLWZsYWdzJyl9XG5cdFx0XHRcdDwvVGV4dD5cblxuXHRcdFx0XHQ8Qm94IHN0eWxlPXt7IGRpc3BsYXk6ICdncmlkJywgZ3JpZFRlbXBsYXRlQ29sdW1uczogJ3JlcGVhdChhdXRvLWZpdCwgbWlubWF4KDI2MHB4LCAxZnIpKScsIGdhcDogMTYgfX0+XG5cdFx0XHRcdFx0PEJveCBzdHlsZT17eyBwYWRkaW5nOiAxNCwgYm9yZGVyUmFkaXVzOiAxMiwgYm9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnIH19PlxuXHRcdFx0XHRcdFx0PFRleHQgY29sb3I9J2dyZXk2MCcgbWI9J3NtJz5cblx0XHRcdFx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoJ2N1c3RvbWVyLXN0YXR1cycpfVxuXHRcdFx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0XHRcdFx0PEJveCBkaXNwbGF5PSdmbGV4JyBhbGlnbkl0ZW1zPSdjZW50ZXInIGp1c3RpZnlDb250ZW50PSdzcGFjZS1iZXR3ZWVuJz5cblx0XHRcdFx0XHRcdFx0PEJhZGdlIGZvbnRTaXplPSdtZCcgb3V0bGluZSBzdHlsZT17c3RhdHVzQmFkZ2VTdHlsZX0+XG5cdFx0XHRcdFx0XHRcdFx0e3NlbGVjdGVkU3RhdHVzT3B0aW9uPy5sYWJlbCA/PyBhZG1pblN0YXR1c31cblx0XHRcdFx0XHRcdFx0PC9CYWRnZT5cblx0XHRcdFx0XHRcdDwvQm94PlxuXHRcdFx0XHRcdFx0PEJveCBtdD0nbWQnPlxuXHRcdFx0XHRcdFx0XHQ8Rm9ybUdyb3VwIGxhYmVsPXt0cmFuc2xhdGVNZXNzYWdlKCdjdXN0b21lci1zdGF0dXMtY2hhbmdlJyl9IG1iPScwJz5cblx0XHRcdFx0XHRcdFx0XHQ8U2VsZWN0XG5cdFx0XHRcdFx0XHRcdFx0XHRpc0NsZWFyYWJsZT17ZmFsc2V9XG5cdFx0XHRcdFx0XHRcdFx0XHRvcHRpb25zPXtzdGF0dXNPcHRpb25zfVxuXHRcdFx0XHRcdFx0XHRcdFx0dmFsdWU9e3NlbGVjdGVkU3RhdHVzT3B0aW9ufVxuXHRcdFx0XHRcdFx0XHRcdFx0b25DaGFuZ2U9eyhvcHRpb246IFN0YXR1c09wdGlvbiB8IG51bGwpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgdmFsdWUgPSBvcHRpb24/LnZhbHVlID8/ICdBQ1RJVkUnO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRzZXRBZG1pblN0YXR1cyh2YWx1ZSk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9fVxuXHRcdFx0XHRcdFx0XHRcdC8+XG5cdFx0XHRcdFx0XHRcdDwvRm9ybUdyb3VwPlxuXHRcdFx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdFx0PC9Cb3g+XG5cblx0XHRcdFx0XHQ8Qm94IHN0eWxlPXt7IHBhZGRpbmc6IDE0LCBib3JkZXJSYWRpdXM6IDEyLCBib3JkZXI6ICcxcHggc29saWQgI0UyRThGMCcgfX0+XG5cdFx0XHRcdFx0XHQ8TGFiZWwgaHRtbEZvcj0nYWRtaW4tbm90ZXMnPnt0cmFuc2xhdGVNZXNzYWdlKCdjdXN0b21lci1pbnRlcm5hbC1ub3RlcycpfTwvTGFiZWw+XG5cdFx0XHRcdFx0XHQ8dGV4dGFyZWFcblx0XHRcdFx0XHRcdFx0aWQ9J2FkbWluLW5vdGVzJ1xuXHRcdFx0XHRcdFx0XHR2YWx1ZT17YWRtaW5Ob3Rlc31cblx0XHRcdFx0XHRcdFx0b25DaGFuZ2U9eyhldmVudCkgPT4gc2V0QWRtaW5Ob3RlcyhldmVudC50YXJnZXQudmFsdWUpfVxuXHRcdFx0XHRcdFx0XHRwbGFjZWhvbGRlcj17dHJhbnNsYXRlTWVzc2FnZSgnY3VzdG9tZXItaW50ZXJuYWwtbm90ZXMtcGxhY2Vob2xkZXInKX1cblx0XHRcdFx0XHRcdFx0cm93cz17NX1cblx0XHRcdFx0XHRcdFx0c3R5bGU9e3tcblx0XHRcdFx0XHRcdFx0XHR3aWR0aDogJzEwMCUnLFxuXHRcdFx0XHRcdFx0XHRcdHJlc2l6ZTogJ3ZlcnRpY2FsJyxcblx0XHRcdFx0XHRcdFx0XHRwYWRkaW5nOiAnMTJweCAxNHB4Jyxcblx0XHRcdFx0XHRcdFx0XHRib3JkZXJSYWRpdXM6IDgsXG5cdFx0XHRcdFx0XHRcdFx0Ym9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnLFxuXHRcdFx0XHRcdFx0XHRcdGZvbnRTaXplOiAxNCxcblx0XHRcdFx0XHRcdFx0XHRtYXJnaW5Ub3A6IDEyLFxuXHRcdFx0XHRcdFx0XHR9fVxuXHRcdFx0XHRcdFx0Lz5cblx0XHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0PC9Cb3g+XG5cblx0XHRcdFx0PEJveCBtdD0neGwnIGRpc3BsYXk9J2ZsZXgnIHN0eWxlPXt7IGdhcDogMTIsIGZsZXhXcmFwOiAnd3JhcCcgfX0+XG5cdFx0XHRcdFx0PEJ1dHRvblxuXHRcdFx0XHRcdFx0c3R5bGU9e3sgYm9yZGVyQ29sb3I6ICd3aGl0ZScsIGJhY2tncm91bmQ6ICcjZmFjYzE1JywgY29sb3I6ICdibGFjaycgfX1cblx0XHRcdFx0XHRcdHZhcmlhbnQ9J2NvbnRhaW5lZCdcblx0XHRcdFx0XHRcdGNvbG9yPSdwcmltYXJ5J1xuXHRcdFx0XHRcdFx0b25DbGljaz17aGFuZGxlU2F2ZU1ldGF9XG5cdFx0XHRcdFx0XHRkaXNhYmxlZD17IWlzRGlydHkgfHwgc2F2aW5nTWV0YX1cblx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHR7c2F2aW5nTWV0YSA/IHRyYW5zbGF0ZU1lc3NhZ2UoJ2N1c3RvbWVyLWZsYWdzLXNhdmluZycpIDogdHJhbnNsYXRlTWVzc2FnZSgnY3VzdG9tZXItZmxhZ3Mtc2F2ZScpfVxuXHRcdFx0XHRcdDwvQnV0dG9uPlxuXHRcdFx0XHQ8L0JveD5cblx0XHRcdDwvQm94PlxuXG5cdFx0XHQ8Qm94XG5cdFx0XHRcdHZhcmlhbnQ9J3doaXRlJ1xuXHRcdFx0XHRwPSd4eGwnXG5cdFx0XHRcdGJvcmRlclJhZGl1cz0neGwnXG5cdFx0XHRcdGJveFNoYWRvdz0nc20nXG5cdFx0XHRcdG1iPSd4bCdcblx0XHRcdFx0Y2xhc3NOYW1lPSdhZG1pbi1jYXJkLS1rcGlzJ1xuXHRcdFx0XHRzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQgI0UyRThGMCcgfX1cblx0XHRcdD5cblx0XHRcdFx0PFRleHQgZm9udFdlaWdodD0nYm9sZCcgbWI9J2xnJz57dHJhbnNsYXRlTWVzc2FnZSgnY3VzdG9tZXIta3BpcycpfTwvVGV4dD5cblx0XHRcdFx0e2xvYWRpbmcgfHwgIXBheWxvYWQgPyAoXG5cdFx0XHRcdFx0PFRleHQgY29sb3I9J2dyZXk2MCc+e3RyYW5zbGF0ZU1lc3NhZ2UoJ2N1c3RvbWVyLWtwaXMtbG9hZGluZycpfTwvVGV4dD5cblx0XHRcdFx0KSA6IChcblx0XHRcdFx0XHQ8Qm94XG5cdFx0XHRcdFx0XHRzdHlsZT17e1xuXHRcdFx0XHRcdFx0XHRkaXNwbGF5OiAnZ3JpZCcsXG5cdFx0XHRcdFx0XHRcdGdyaWRUZW1wbGF0ZUNvbHVtbnM6ICdyZXBlYXQoYXV0by1maXQsIG1pbm1heCgyMjBweCwgMWZyKSknLFxuXHRcdFx0XHRcdFx0XHRnYXA6IDE2LFxuXHRcdFx0XHRcdFx0fX1cblx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHQ8Qm94IHN0eWxlPXt7IHBhZGRpbmc6IDE0LCBib3JkZXJSYWRpdXM6IDEyLCBib3JkZXI6ICcxcHggc29saWQgI0UyRThGMCcgfX0+XG5cdFx0XHRcdFx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnPlxuXHRcdFx0XHRcdFx0XHRcdHt0cmFuc2xhdGVNZXNzYWdlKCdjdXN0b21lci1rcGlzLXRvdGFsLW9yZGVycycpfVxuXHRcdFx0XHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHRcdFx0XHRcdDxUZXh0IGZvbnRXZWlnaHQ9J2JvbGQnPntwYXlsb2FkLnRvdGFsT3JkZXJzfTwvVGV4dD5cblx0XHRcdFx0XHRcdDwvQm94PlxuXHRcdFx0XHRcdFx0PEJveCBzdHlsZT17eyBwYWRkaW5nOiAxNCwgYm9yZGVyUmFkaXVzOiAxMiwgYm9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnIH19PlxuXHRcdFx0XHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJz5cblx0XHRcdFx0XHRcdFx0XHR7dHJhbnNsYXRlTWVzc2FnZSgnY3VzdG9tZXIta3Bpcy1sdHYnKX1cblx0XHRcdFx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0XHRcdFx0XHQ8VGV4dCBmb250V2VpZ2h0PSdib2xkJz57Zm9ybWF0TW9uZXkocGF5bG9hZC5saWZldGltZVZhbHVlKX08L1RleHQ+XG5cdFx0XHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0XHRcdDxCb3ggc3R5bGU9e3sgcGFkZGluZzogMTQsIGJvcmRlclJhZGl1czogMTIsIGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJyB9fT5cblx0XHRcdFx0XHRcdFx0PFRleHQgY29sb3I9J2dyZXk2MCc+XG5cdFx0XHRcdFx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoJ2N1c3RvbWVyLWtwaXMtYW92Jyl9XG5cdFx0XHRcdFx0XHRcdDwvVGV4dD5cblx0XHRcdFx0XHRcdFx0PFRleHQgZm9udFdlaWdodD0nYm9sZCc+e2Zvcm1hdE1vbmV5KHBheWxvYWQuYXZlcmFnZU9yZGVyVmFsdWUpfTwvVGV4dD5cblx0XHRcdFx0XHRcdDwvQm94PlxuXHRcdFx0XHRcdFx0PEJveCBzdHlsZT17eyBwYWRkaW5nOiAxNCwgYm9yZGVyUmFkaXVzOiAxMiwgYm9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnIH19PlxuXHRcdFx0XHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJz5cblx0XHRcdFx0XHRcdFx0XHR7dHJhbnNsYXRlTWVzc2FnZSgnY3VzdG9tZXIta3Bpcy1sYXN0LW9yZGVyJyl9XG5cdFx0XHRcdFx0XHRcdDwvVGV4dD5cblx0XHRcdFx0XHRcdFx0PFRleHQgZm9udFdlaWdodD0nYm9sZCc+e2xhc3RPcmRlclRleHR9PC9UZXh0PlxuXHRcdFx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdCl9XG5cdFx0XHQ8L0JveD5cblxuXHRcdFx0PEJveFxuXHRcdFx0XHR2YXJpYW50PSd3aGl0ZSdcblx0XHRcdFx0cD0neHhsJ1xuXHRcdFx0XHRib3JkZXJSYWRpdXM9J3hsJ1xuXHRcdFx0XHRib3hTaGFkb3c9J3NtJ1xuXHRcdFx0XHRtYj0neGwnXG5cdFx0XHRcdHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJyB9fVxuXHRcdFx0PlxuXHRcdFx0XHQ8VGV4dCBmb250V2VpZ2h0PSdib2xkJyBtYj0nbGcnPlxuXHRcdFx0XHRcdHt0cmFuc2xhdGVNZXNzYWdlKCdjdXN0b21lci1yZWxhdGVkJyl9XG5cdFx0XHRcdDwvVGV4dD5cblx0XHRcdFx0e3JlbGF0ZWRMb2FkaW5nIHx8ICFyZWxhdGVkID8gKFxuXHRcdFx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnPnt0cmFuc2xhdGVNZXNzYWdlKCdjdXN0b21lci1yZWxhdGVkLWxvYWRpbmcnKX08L1RleHQ+XG5cdFx0XHRcdCkgOiAoXG5cdFx0XHRcdFx0PEJveCBzdHlsZT17eyBkaXNwbGF5OiAnZ3JpZCcsIGdyaWRUZW1wbGF0ZUNvbHVtbnM6ICcxZnInLCBnYXA6IDE4IH19PlxuXHRcdFx0XHRcdFx0PEJveD5cblx0XHRcdFx0XHRcdFx0PFRleHQgZm9udFdlaWdodD0nYm9sZCcgbWI9J3NtJz5cblx0XHRcdFx0XHRcdFx0XHR7dHJhbnNsYXRlTWVzc2FnZSgnY3VzdG9tZXItcmVsYXRlZC1vcmRlcnMnKX1cblx0XHRcdFx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0XHRcdFx0XHR7cmVsYXRlZC5vcmRlcnMubGVuZ3RoID8gKFxuXHRcdFx0XHRcdFx0XHRcdDxUYWJsZT5cblx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZUhlYWQ+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZVJvdz5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVDZWxsPnt0cmFuc2xhdGVNZXNzYWdlKCdjdXN0b21lci1yZWxhdGVkLW9yZGVyLWlkJyl9PC9UYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlQ2VsbD57dHJhbnNsYXRlTWVzc2FnZSgnY3VzdG9tZXItcmVsYXRlZC1vcmRlci1zdGF0dXMnKX08L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVDZWxsPnt0cmFuc2xhdGVNZXNzYWdlKCdjdXN0b21lci1yZWxhdGVkLW9yZGVyLXRvdGFsJyl9PC9UYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlQ2VsbD57dHJhbnNsYXRlTWVzc2FnZSgnY3VzdG9tZXItcmVsYXRlZC1vcmRlci1jcmVhdGVkJyl9PC9UYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdDwvVGFibGVSb3c+XG5cdFx0XHRcdFx0XHRcdFx0XHQ8L1RhYmxlSGVhZD5cblx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZUJvZHk+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHtyZWxhdGVkLm9yZGVycy5tYXAoKG9yZGVyKSA9PiAoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlUm93IGtleT17b3JkZXIuaWR9PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PGEgaHJlZj17YnVpbGRSZWNvcmRTaG93SHJlZignT3JkZXInLCBvcmRlci5pZCl9IHN0eWxlPXt7IGZvbnRXZWlnaHQ6IDYwMCB9fT5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR7b3JkZXIuaWR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDwvYT5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDwvVGFibGVDZWxsPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlQ2VsbD57b3JkZXIuc3RhdHVzfTwvVGFibGVDZWxsPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlQ2VsbD57Zm9ybWF0TW9uZXkob3JkZXIudG90YWwpfTwvVGFibGVDZWxsPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlQ2VsbD57Zm9ybWF0RGF0ZShvcmRlci5jcmVhdGVkQXQpfTwvVGFibGVDZWxsPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDwvVGFibGVSb3c+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdCkpfVxuXHRcdFx0XHRcdFx0XHRcdFx0PC9UYWJsZUJvZHk+XG5cdFx0XHRcdFx0XHRcdFx0PC9UYWJsZT5cblx0XHRcdFx0XHRcdFx0KSA6IChcblx0XHRcdFx0XHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJz57dHJhbnNsYXRlTWVzc2FnZSgnY3VzdG9tZXItcmVsYXRlZC1lbXB0eScpfTwvVGV4dD5cblx0XHRcdFx0XHRcdFx0KX1cblx0XHRcdFx0XHRcdDwvQm94PlxuXG5cdFx0XHRcdFx0XHQ8Qm94PlxuXHRcdFx0XHRcdFx0XHQ8VGV4dCBmb250V2VpZ2h0PSdib2xkJyBtYj0nc20nPlxuXHRcdFx0XHRcdFx0XHRcdHt0cmFuc2xhdGVNZXNzYWdlKCdjdXN0b21lci1yZWxhdGVkLXJldmlld3MnKX1cblx0XHRcdFx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0XHRcdFx0XHR7cmVsYXRlZC5yZXZpZXdzLmxlbmd0aCA/IChcblx0XHRcdFx0XHRcdFx0XHQ8VGFibGU+XG5cdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVIZWFkPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVSb3c+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlQ2VsbD57dHJhbnNsYXRlTWVzc2FnZSgnY3VzdG9tZXItcmVsYXRlZC1yZXZpZXctcHJvZHVjdCcpfTwvVGFibGVDZWxsPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZUNlbGw+e3RyYW5zbGF0ZU1lc3NhZ2UoJ2N1c3RvbWVyLXJlbGF0ZWQtcmV2aWV3LXJhdGluZycpfTwvVGFibGVDZWxsPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZUNlbGw+e3RyYW5zbGF0ZU1lc3NhZ2UoJ2N1c3RvbWVyLXJlbGF0ZWQtcmV2aWV3LWNvbW1lbnQnKX08L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVDZWxsPnt0cmFuc2xhdGVNZXNzYWdlKCdjdXN0b21lci1yZWxhdGVkLXJldmlldy1jcmVhdGVkJyl9PC9UYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdDwvVGFibGVSb3c+XG5cdFx0XHRcdFx0XHRcdFx0XHQ8L1RhYmxlSGVhZD5cblx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZUJvZHk+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHtyZWxhdGVkLnJldmlld3MubWFwKChyZXZpZXcpID0+IChcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVSb3cga2V5PXtyZXZpZXcuaWR9PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PGEgaHJlZj17YnVpbGRSZWNvcmRTaG93SHJlZignUHJvZHVjdCcsIHJldmlldy5wcm9kdWN0SWQpfSBzdHlsZT17eyBmb250V2VpZ2h0OiA2MDAgfX0+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0e3Jldmlldy5wcm9kdWN0TmFtZX1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PC9hPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PC9UYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVDZWxsPntyZXZpZXcucmF0aW5nfTwvVGFibGVDZWxsPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PFRleHRcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzdHlsZT17e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0bWF4V2lkdGg6IDQyMCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHdoaXRlU3BhY2U6ICdub3dyYXAnLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0b3ZlcmZsb3c6ICdoaWRkZW4nLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0dGV4dE92ZXJmbG93OiAnZWxsaXBzaXMnLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH19XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR7cmV2aWV3LmNvbW1lbnR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDwvVGV4dD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDwvVGFibGVDZWxsPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlQ2VsbD57Zm9ybWF0RGF0ZShyZXZpZXcuY3JlYXRlZEF0KX08L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8L1RhYmxlUm93PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQpKX1cblx0XHRcdFx0XHRcdFx0XHRcdDwvVGFibGVCb2R5PlxuXHRcdFx0XHRcdFx0XHRcdDwvVGFibGU+XG5cdFx0XHRcdFx0XHRcdCkgOiAoXG5cdFx0XHRcdFx0XHRcdFx0PFRleHQgY29sb3I9J2dyZXk2MCc+e3RyYW5zbGF0ZU1lc3NhZ2UoJ2N1c3RvbWVyLXJlbGF0ZWQtZW1wdHknKX08L1RleHQ+XG5cdFx0XHRcdFx0XHRcdCl9XG5cdFx0XHRcdFx0XHQ8L0JveD5cblxuXHRcdFx0XHRcdFx0PEJveD5cblx0XHRcdFx0XHRcdFx0PFRleHQgZm9udFdlaWdodD0nYm9sZCcgbWI9J3NtJz5cblx0XHRcdFx0XHRcdFx0XHR7dHJhbnNsYXRlTWVzc2FnZSgnY3VzdG9tZXItcmVsYXRlZC13aXNobGlzdCcpfVxuXHRcdFx0XHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHRcdFx0XHRcdHtyZWxhdGVkLndpc2hsaXN0Lmxlbmd0aCA/IChcblx0XHRcdFx0XHRcdFx0XHQ8VGFibGU+XG5cdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVIZWFkPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVSb3c+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlQ2VsbD57dHJhbnNsYXRlTWVzc2FnZSgnY3VzdG9tZXItcmVsYXRlZC1wcm9kdWN0Jyl9PC9UYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlQ2VsbD57dHJhbnNsYXRlTWVzc2FnZSgnY3VzdG9tZXItcmVsYXRlZC1hZGRlZCcpfTwvVGFibGVDZWxsPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8L1RhYmxlUm93PlxuXHRcdFx0XHRcdFx0XHRcdFx0PC9UYWJsZUhlYWQ+XG5cdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVCb2R5PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHR7cmVsYXRlZC53aXNobGlzdC5tYXAoKGl0ZW0pID0+IChcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVSb3cga2V5PXtgJHtpdGVtLnByb2R1Y3RJZH06JHtpdGVtLmNyZWF0ZWRBdH1gfT5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxhIGhyZWY9e2J1aWxkUmVjb3JkU2hvd0hyZWYoJ1Byb2R1Y3QnLCBpdGVtLnByb2R1Y3RJZCl9IHN0eWxlPXt7IGZvbnRXZWlnaHQ6IDYwMCB9fT5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR7aXRlbS5wcm9kdWN0TmFtZX1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PC9hPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PC9UYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVDZWxsPntmb3JtYXREYXRlKGl0ZW0uY3JlYXRlZEF0KX08L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8L1RhYmxlUm93PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQpKX1cblx0XHRcdFx0XHRcdFx0XHRcdDwvVGFibGVCb2R5PlxuXHRcdFx0XHRcdFx0XHRcdDwvVGFibGU+XG5cdFx0XHRcdFx0XHRcdCkgOiAoXG5cdFx0XHRcdFx0XHRcdFx0PFRleHQgY29sb3I9J2dyZXk2MCc+e3RyYW5zbGF0ZU1lc3NhZ2UoJ2N1c3RvbWVyLXJlbGF0ZWQtZW1wdHknKX08L1RleHQ+XG5cdFx0XHRcdFx0XHRcdCl9XG5cdFx0XHRcdFx0XHQ8L0JveD5cblxuXHRcdFx0XHRcdFx0PEJveD5cblx0XHRcdFx0XHRcdFx0PFRleHQgZm9udFdlaWdodD0nYm9sZCcgbWI9J3NtJz5cblx0XHRcdFx0XHRcdFx0XHR7dHJhbnNsYXRlTWVzc2FnZSgnY3VzdG9tZXItcmVsYXRlZC1yZWNlbnRseS12aWV3ZWQnKX1cblx0XHRcdFx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0XHRcdFx0XHR7cmVsYXRlZC5yZWNlbnRseVZpZXdlZC5sZW5ndGggPyAoXG5cdFx0XHRcdFx0XHRcdFx0PFRhYmxlPlxuXHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlSGVhZD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlUm93PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZUNlbGw+e3RyYW5zbGF0ZU1lc3NhZ2UoJ2N1c3RvbWVyLXJlbGF0ZWQtcHJvZHVjdCcpfTwvVGFibGVDZWxsPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZUNlbGw+e3RyYW5zbGF0ZU1lc3NhZ2UoJ2N1c3RvbWVyLXJlbGF0ZWQtdXBkYXRlZCcpfTwvVGFibGVDZWxsPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8L1RhYmxlUm93PlxuXHRcdFx0XHRcdFx0XHRcdFx0PC9UYWJsZUhlYWQ+XG5cdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVCb2R5PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHR7cmVsYXRlZC5yZWNlbnRseVZpZXdlZC5tYXAoKGl0ZW0pID0+IChcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVSb3cga2V5PXtgJHtpdGVtLnByb2R1Y3RJZH06JHtpdGVtLmNyZWF0ZWRBdH1gfT5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxhIGhyZWY9e2J1aWxkUmVjb3JkU2hvd0hyZWYoJ1Byb2R1Y3QnLCBpdGVtLnByb2R1Y3RJZCl9IHN0eWxlPXt7IGZvbnRXZWlnaHQ6IDYwMCB9fT5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR7aXRlbS5wcm9kdWN0TmFtZX1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PC9hPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PC9UYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVDZWxsPntmb3JtYXREYXRlKGl0ZW0uY3JlYXRlZEF0KX08L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8L1RhYmxlUm93PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQpKX1cblx0XHRcdFx0XHRcdFx0XHRcdDwvVGFibGVCb2R5PlxuXHRcdFx0XHRcdFx0XHRcdDwvVGFibGU+XG5cdFx0XHRcdFx0XHRcdCkgOiAoXG5cdFx0XHRcdFx0XHRcdFx0PFRleHQgY29sb3I9J2dyZXk2MCc+e3RyYW5zbGF0ZU1lc3NhZ2UoJ2N1c3RvbWVyLXJlbGF0ZWQtZW1wdHknKX08L1RleHQ+XG5cdFx0XHRcdFx0XHRcdCl9XG5cdFx0XHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0KX1cblx0XHRcdDwvQm94PlxuXG5cdFx0XHQ8T3JpZ2luYWxTaG93IHsuLi5wcm9wc30gLz5cblx0XHQ8L0JveD5cblx0KTtcbn1cbiIsImltcG9ydCB7IHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBBcGlDbGllbnQsIHR5cGUgQWN0aW9uUHJvcHMsIHVzZVRyYW5zbGF0aW9uIH0gZnJvbSAnYWRtaW5qcyc7XG5pbXBvcnQgeyBCYWRnZSwgQm94LCBCdXR0b24sIFRhYmxlLCBUYWJsZUJvZHksIFRhYmxlQ2VsbCwgVGFibGVIZWFkLCBUYWJsZVJvdywgVGV4dCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xuXG5jb25zdCBhcGkgPSBuZXcgQXBpQ2xpZW50KCk7XG5cbnR5cGUgU2VnbWVudFVzZXIgPSB7XG5cdGlkOiBzdHJpbmc7XG5cdG5hbWU6IHN0cmluZztcblx0ZW1haWw6IHN0cmluZyB8IG51bGw7XG5cdGVtYWlsVmVyaWZpZWQ6IGJvb2xlYW47XG5cdHN1YnNjcmliZWQ6IGJvb2xlYW47XG5cdGNyZWF0ZWRBdDogc3RyaW5nO1xuXHRsYXN0T3JkZXJBdDogc3RyaW5nIHwgbnVsbDtcblx0bGlmZXRpbWVWYWx1ZTogbnVtYmVyIHwgbnVsbDtcbn07XG5cbnR5cGUgU2VnbWVudHNQYXlsb2FkID0ge1xuXHRjb25maWc6IHtcblx0XHRpbmFjdGl2ZURheXM6IG51bWJlcjtcblx0XHRoaWdoU3BlbmRlck1pbkx0djogbnVtYmVyO1xuXHRcdHByZXZpZXdMaW1pdDogbnVtYmVyO1xuXHR9O1xuXHRjb3VudHM6IHtcblx0XHRzdWJzY3JpYmVkOiBudW1iZXI7XG5cdFx0dmVyaWZpZWQ6IG51bWJlcjtcblx0XHR1bnZlcmlmaWVkOiBudW1iZXI7XG5cdFx0aW5hY3RpdmU6IG51bWJlcjtcblx0XHRoaWdoU3BlbmRlcnM6IG51bWJlciB8IG51bGw7XG5cdH07XG5cdGxpc3RzOiB7XG5cdFx0c3Vic2NyaWJlZDogU2VnbWVudFVzZXJbXTtcblx0XHR2ZXJpZmllZDogU2VnbWVudFVzZXJbXTtcblx0XHR1bnZlcmlmaWVkOiBTZWdtZW50VXNlcltdO1xuXHRcdGluYWN0aXZlOiBTZWdtZW50VXNlcltdO1xuXHRcdGhpZ2hTcGVuZGVyczogU2VnbWVudFVzZXJbXTtcblx0fTtcbn07XG5cbmNvbnN0IGZvcm1hdERhdGUgPSAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+IHtcblx0aWYgKCF2YWx1ZSkgcmV0dXJuICctJztcblx0Y29uc3QgcGFyc2VkID0gRGF0ZS5wYXJzZSh2YWx1ZSk7XG5cdHJldHVybiBOdW1iZXIuaXNOYU4ocGFyc2VkKSA/IHZhbHVlIDogbmV3IERhdGUocGFyc2VkKS50b0xvY2FsZVN0cmluZygpO1xufTtcblxuY29uc3QgZm9ybWF0TW9uZXkgPSAodmFsdWU6IG51bWJlciB8IG51bGwpID0+IHtcblx0Y29uc3Qgc2FmZVZhbHVlID0gdmFsdWUgPT0gbnVsbCB8fCAhTnVtYmVyLmlzRmluaXRlKHZhbHVlKSA/IDAgOiB2YWx1ZTtcblx0dHJ5IHtcblx0XHRyZXR1cm4gbmV3IEludGwuTnVtYmVyRm9ybWF0KHVuZGVmaW5lZCwge1xuXHRcdFx0c3R5bGU6ICdjdXJyZW5jeScsXG5cdFx0XHRjdXJyZW5jeTogJ1VBSCcsXG5cdFx0XHRtaW5pbXVtRnJhY3Rpb25EaWdpdHM6IDIsXG5cdFx0XHRtYXhpbXVtRnJhY3Rpb25EaWdpdHM6IDIsXG5cdFx0fSkuZm9ybWF0KHNhZmVWYWx1ZSk7XG5cdH0gY2F0Y2gge1xuXHRcdHJldHVybiBzYWZlVmFsdWUudG9GaXhlZCgyKTtcblx0fVxufTtcblxuY29uc3QgZ2V0Um9vdFBhdGggPSAoKSA9PiB7XG5cdGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykgcmV0dXJuICcnO1xuXHRjb25zdCBwYXRoID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lID8/ICcnO1xuXHRjb25zdCBwYXJ0cyA9IHBhdGguc3BsaXQoJy9yZXNvdXJjZXMnKTtcblx0cmV0dXJuIHBhcnRzWzBdID8/ICcnO1xufTtcblxuY29uc3QgYnVpbGRVc2VyU2hvd0hyZWYgPSAocmVzb3VyY2VJZDogc3RyaW5nLCB1c2VySWQ6IHN0cmluZykgPT5cblx0YCR7Z2V0Um9vdFBhdGgoKX0vcmVzb3VyY2VzLyR7cmVzb3VyY2VJZH0vcmVjb3Jkcy8ke3VzZXJJZH0vc2hvd2A7XG5cbmNvbnN0IGJ1aWxkVXNlckxpc3RIcmVmID0gKHJlc291cmNlSWQ6IHN0cmluZywgZmlsdGVyczogUmVjb3JkPHN0cmluZywgc3RyaW5nPikgPT4ge1xuXHRjb25zdCByb290ID0gZ2V0Um9vdFBhdGgoKTtcblx0Y29uc3QgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcygpO1xuXHRmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhmaWx0ZXJzKSkge1xuXHRcdHBhcmFtcy5zZXQoYGZpbHRlcnMuJHtrZXl9YCwgdmFsdWUpO1xuXHR9XG5cdHJldHVybiBgJHtyb290fS9yZXNvdXJjZXMvJHtyZXNvdXJjZUlkfT8ke3BhcmFtcy50b1N0cmluZygpfWA7XG59O1xuXG5mdW5jdGlvbiBVc2Vyc1RhYmxlKHtcblx0cmVzb3VyY2VJZCxcblx0dXNlcnMsXG5cdHNob3dMYXN0T3JkZXIsXG5cdHNob3dMdHYsXG59OiB7XG5cdHJlc291cmNlSWQ6IHN0cmluZztcblx0dXNlcnM6IFNlZ21lbnRVc2VyW107XG5cdHNob3dMYXN0T3JkZXI/OiBib29sZWFuO1xuXHRzaG93THR2PzogYm9vbGVhbjtcbn0pIHtcblx0Y29uc3QgeyB0cmFuc2xhdGVNZXNzYWdlIH0gPSB1c2VUcmFuc2xhdGlvbigpO1xuXG5cdGlmICghdXNlcnMubGVuZ3RoKSB7XG5cdFx0cmV0dXJuIDxUZXh0IGNvbG9yPSdncmV5NjAnPnt0cmFuc2xhdGVNZXNzYWdlKCd1c2VyLXNlZ21lbnRzLWVtcHR5Jyl9PC9UZXh0Pjtcblx0fVxuXG5cdHJldHVybiAoXG5cdFx0PFRhYmxlPlxuXHRcdFx0PFRhYmxlSGVhZD5cblx0XHRcdFx0PFRhYmxlUm93PlxuXHRcdFx0XHRcdDxUYWJsZUNlbGw+e3RyYW5zbGF0ZU1lc3NhZ2UoJ3VzZXItc2VnbWVudHMtY29sLW5hbWUnKX08L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHQ8VGFibGVDZWxsPnt0cmFuc2xhdGVNZXNzYWdlKCd1c2VyLXNlZ21lbnRzLWNvbC1lbWFpbCcpfTwvVGFibGVDZWxsPlxuXHRcdFx0XHRcdHtzaG93THR2ID8gPFRhYmxlQ2VsbD57dHJhbnNsYXRlTWVzc2FnZSgndXNlci1zZWdtZW50cy1jb2wtbHR2Jyl9PC9UYWJsZUNlbGw+IDogbnVsbH1cblx0XHRcdFx0XHR7c2hvd0xhc3RPcmRlciA/IDxUYWJsZUNlbGw+e3RyYW5zbGF0ZU1lc3NhZ2UoJ3VzZXItc2VnbWVudHMtY29sLWxhc3Qtb3JkZXInKX08L1RhYmxlQ2VsbD4gOiBudWxsfVxuXHRcdFx0XHRcdDxUYWJsZUNlbGw+e3RyYW5zbGF0ZU1lc3NhZ2UoJ3VzZXItc2VnbWVudHMtY29sLWNyZWF0ZWQnKX08L1RhYmxlQ2VsbD5cblx0XHRcdFx0PC9UYWJsZVJvdz5cblx0XHRcdDwvVGFibGVIZWFkPlxuXHRcdFx0PFRhYmxlQm9keT5cblx0XHRcdFx0e3VzZXJzLm1hcCgodXNlcikgPT4gKFxuXHRcdFx0XHRcdDxUYWJsZVJvdyBrZXk9e3VzZXIuaWR9PlxuXHRcdFx0XHRcdFx0PFRhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0PGEgaHJlZj17YnVpbGRVc2VyU2hvd0hyZWYocmVzb3VyY2VJZCwgdXNlci5pZCl9IHN0eWxlPXt7IGZvbnRXZWlnaHQ6IDYwMCB9fT5cblx0XHRcdFx0XHRcdFx0XHR7dXNlci5uYW1lfVxuXHRcdFx0XHRcdFx0XHQ8L2E+XG5cdFx0XHRcdFx0XHQ8L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdDxUYWJsZUNlbGw+e3VzZXIuZW1haWwgPz8gJy0nfTwvVGFibGVDZWxsPlxuXHRcdFx0XHRcdFx0e3Nob3dMdHYgPyA8VGFibGVDZWxsPntmb3JtYXRNb25leSh1c2VyLmxpZmV0aW1lVmFsdWUpfTwvVGFibGVDZWxsPiA6IG51bGx9XG5cdFx0XHRcdFx0XHR7c2hvd0xhc3RPcmRlciA/IDxUYWJsZUNlbGw+e2Zvcm1hdERhdGUodXNlci5sYXN0T3JkZXJBdCl9PC9UYWJsZUNlbGw+IDogbnVsbH1cblx0XHRcdFx0XHRcdDxUYWJsZUNlbGw+e2Zvcm1hdERhdGUodXNlci5jcmVhdGVkQXQpfTwvVGFibGVDZWxsPlxuXHRcdFx0XHRcdDwvVGFibGVSb3c+XG5cdFx0XHRcdCkpfVxuXHRcdFx0PC9UYWJsZUJvZHk+XG5cdFx0PC9UYWJsZT5cblx0KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gVXNlclNlZ21lbnRzKHsgcmVzb3VyY2UgfTogQWN0aW9uUHJvcHMpIHtcblx0Y29uc3QgeyB0cmFuc2xhdGVNZXNzYWdlIH0gPSB1c2VUcmFuc2xhdGlvbigpO1xuXHRjb25zdCBbcGF5bG9hZCwgc2V0UGF5bG9hZF0gPSB1c2VTdGF0ZTxTZWdtZW50c1BheWxvYWQgfCBudWxsPihudWxsKTtcblx0Y29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuXG5cdHVzZUVmZmVjdCgoKSA9PiB7XG5cdFx0bGV0IGlzQWN0aXZlID0gdHJ1ZTtcblx0XHRzZXRMb2FkaW5nKHRydWUpO1xuXHRcdGFwaS5yZXNvdXJjZUFjdGlvbih7XG5cdFx0XHRyZXNvdXJjZUlkOiByZXNvdXJjZS5pZCxcblx0XHRcdGFjdGlvbk5hbWU6ICd1c2VyU2VnbWVudHMnLFxuXHRcdFx0bWV0aG9kOiAnZ2V0Jyxcblx0XHR9KVxuXHRcdFx0LnRoZW4oKHJlc3BvbnNlKSA9PiB7XG5cdFx0XHRcdGlmICghaXNBY3RpdmUpIHJldHVybjtcblx0XHRcdFx0c2V0UGF5bG9hZCgocmVzcG9uc2UuZGF0YS5wYXlsb2FkID8/IG51bGwpIGFzIFNlZ21lbnRzUGF5bG9hZCB8IG51bGwpO1xuXHRcdFx0fSlcblx0XHRcdC5maW5hbGx5KCgpID0+IHtcblx0XHRcdFx0aWYgKCFpc0FjdGl2ZSkgcmV0dXJuO1xuXHRcdFx0XHRzZXRMb2FkaW5nKGZhbHNlKTtcblx0XHRcdH0pO1xuXHRcdHJldHVybiAoKSA9PiB7XG5cdFx0XHRpc0FjdGl2ZSA9IGZhbHNlO1xuXHRcdH07XG5cdH0sIFtyZXNvdXJjZS5pZF0pO1xuXG5cdGNvbnN0IHByZXZpZXdMaW1pdFRleHQgPSB1c2VNZW1vKCgpID0+IHtcblx0XHRpZiAoIXBheWxvYWQpIHJldHVybiAnJztcblx0XHRyZXR1cm4gdHJhbnNsYXRlTWVzc2FnZSgndXNlci1zZWdtZW50cy1wcmV2aWV3JywgeyBsaW1pdDogcGF5bG9hZC5jb25maWcucHJldmlld0xpbWl0IH0pO1xuXHR9LCBbcGF5bG9hZCwgdHJhbnNsYXRlTWVzc2FnZV0pO1xuXG5cdGlmIChsb2FkaW5nIHx8ICFwYXlsb2FkKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxCb3ggdmFyaWFudD0nd2hpdGUnIHA9J3h4bCcgYm9yZGVyUmFkaXVzPSd4bCcgYm94U2hhZG93PSdzbScgc3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnIH19PlxuXHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJz57dHJhbnNsYXRlTWVzc2FnZSgndXNlci1zZWdtZW50cy1sb2FkaW5nJyl9PC9UZXh0PlxuXHRcdFx0PC9Cb3g+XG5cdFx0KTtcblx0fVxuXG5cdHJldHVybiAoXG5cdFx0PEJveCBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBnYXA6IDE4IH19PlxuXHRcdFx0PEJveCB2YXJpYW50PSd3aGl0ZScgcD0neHhsJyBib3JkZXJSYWRpdXM9J3hsJyBib3hTaGFkb3c9J3NtJyBzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQgI0UyRThGMCcgfX0+XG5cdFx0XHRcdDxUZXh0IGZvbnRTaXplPSd4bCcgZm9udFdlaWdodD0nYm9sZCcgbWI9J3NtJz5cblx0XHRcdFx0XHR7dHJhbnNsYXRlTWVzc2FnZSgndXNlci1zZWdtZW50cy10aXRsZScpfVxuXHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnIG1iPSdtZCc+XG5cdFx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoJ3VzZXItc2VnbWVudHMtcHVycG9zZScpfVxuXHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnPntwcmV2aWV3TGltaXRUZXh0fTwvVGV4dD5cblx0XHRcdDwvQm94PlxuXG5cdFx0XHQ8Qm94IHZhcmlhbnQ9J3doaXRlJyBwPSd4eGwnIGJvcmRlclJhZGl1cz0neGwnIGJveFNoYWRvdz0nc20nIHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJyB9fT5cblx0XHRcdFx0PEJveCBkaXNwbGF5PSdmbGV4JyBhbGlnbkl0ZW1zPSdjZW50ZXInIGp1c3RpZnlDb250ZW50PSdzcGFjZS1iZXR3ZWVuJyBtYj0nbGcnPlxuXHRcdFx0XHRcdDxCb3g+XG5cdFx0XHRcdFx0XHQ8VGV4dCBmb250V2VpZ2h0PSdib2xkJz57dHJhbnNsYXRlTWVzc2FnZSgndXNlci1zZWdtZW50cy1zdWJzY3JpYmVkJyl9PC9UZXh0PlxuXHRcdFx0XHRcdFx0PFRleHQgY29sb3I9J2dyZXk2MCc+e3RyYW5zbGF0ZU1lc3NhZ2UoJ3VzZXItc2VnbWVudHMtc3Vic2NyaWJlZC1kZXNjJyl9PC9UZXh0PlxuXHRcdFx0XHRcdDwvQm94PlxuXHRcdFx0XHRcdDxCb3ggZGlzcGxheT0nZmxleCcgYWxpZ25JdGVtcz0nY2VudGVyJyBzdHlsZT17eyBnYXA6IDEyIH19PlxuXHRcdFx0XHRcdFx0PEJhZGdlIG91dGxpbmU+e3BheWxvYWQuY291bnRzLnN1YnNjcmliZWR9PC9CYWRnZT5cblx0XHRcdFx0XHRcdDxhIGhyZWY9e2J1aWxkVXNlckxpc3RIcmVmKHJlc291cmNlLmlkLCB7IHN1YnNjcmliZWQ6ICd0cnVlJyB9KX0+XG5cdFx0XHRcdFx0XHRcdDxCdXR0b24gdmFyaWFudD0nb3V0bGluZWQnPnt0cmFuc2xhdGVNZXNzYWdlKCd1c2VyLXNlZ21lbnRzLW9wZW4nKX08L0J1dHRvbj5cblx0XHRcdFx0XHRcdDwvYT5cblx0XHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdDxVc2Vyc1RhYmxlIHJlc291cmNlSWQ9e3Jlc291cmNlLmlkfSB1c2Vycz17cGF5bG9hZC5saXN0cy5zdWJzY3JpYmVkfSAvPlxuXHRcdFx0PC9Cb3g+XG5cblx0XHRcdDxCb3ggdmFyaWFudD0nd2hpdGUnIHA9J3h4bCcgYm9yZGVyUmFkaXVzPSd4bCcgYm94U2hhZG93PSdzbScgc3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnIH19PlxuXHRcdFx0XHQ8Qm94IGRpc3BsYXk9J2ZsZXgnIGFsaWduSXRlbXM9J2NlbnRlcicganVzdGlmeUNvbnRlbnQ9J3NwYWNlLWJldHdlZW4nIG1iPSdsZyc+XG5cdFx0XHRcdFx0PEJveD5cblx0XHRcdFx0XHRcdDxUZXh0IGZvbnRXZWlnaHQ9J2JvbGQnPnt0cmFuc2xhdGVNZXNzYWdlKCd1c2VyLXNlZ21lbnRzLXZlcmlmaWVkJyl9PC9UZXh0PlxuXHRcdFx0XHRcdFx0PFRleHQgY29sb3I9J2dyZXk2MCc+e3RyYW5zbGF0ZU1lc3NhZ2UoJ3VzZXItc2VnbWVudHMtdmVyaWZpZWQtZGVzYycpfTwvVGV4dD5cblx0XHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0XHQ8Qm94IGRpc3BsYXk9J2ZsZXgnIGFsaWduSXRlbXM9J2NlbnRlcicgc3R5bGU9e3sgZ2FwOiAxMiB9fT5cblx0XHRcdFx0XHRcdDxCYWRnZSBvdXRsaW5lPntwYXlsb2FkLmNvdW50cy52ZXJpZmllZH08L0JhZGdlPlxuXHRcdFx0XHRcdFx0PGEgaHJlZj17YnVpbGRVc2VyTGlzdEhyZWYocmVzb3VyY2UuaWQsIHsgZW1haWxWZXJpZmllZDogJ3RydWUnIH0pfT5cblx0XHRcdFx0XHRcdFx0PEJ1dHRvbiB2YXJpYW50PSdvdXRsaW5lZCc+e3RyYW5zbGF0ZU1lc3NhZ2UoJ3VzZXItc2VnbWVudHMtb3BlbicpfTwvQnV0dG9uPlxuXHRcdFx0XHRcdFx0PC9hPlxuXHRcdFx0XHRcdDwvQm94PlxuXHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0PFVzZXJzVGFibGUgcmVzb3VyY2VJZD17cmVzb3VyY2UuaWR9IHVzZXJzPXtwYXlsb2FkLmxpc3RzLnZlcmlmaWVkfSAvPlxuXHRcdFx0PC9Cb3g+XG5cblx0XHRcdDxCb3ggdmFyaWFudD0nd2hpdGUnIHA9J3h4bCcgYm9yZGVyUmFkaXVzPSd4bCcgYm94U2hhZG93PSdzbScgc3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnIH19PlxuXHRcdFx0XHQ8Qm94IGRpc3BsYXk9J2ZsZXgnIGFsaWduSXRlbXM9J2NlbnRlcicganVzdGlmeUNvbnRlbnQ9J3NwYWNlLWJldHdlZW4nIG1iPSdsZyc+XG5cdFx0XHRcdFx0PEJveD5cblx0XHRcdFx0XHRcdDxUZXh0IGZvbnRXZWlnaHQ9J2JvbGQnPnt0cmFuc2xhdGVNZXNzYWdlKCd1c2VyLXNlZ21lbnRzLXVudmVyaWZpZWQnKX08L1RleHQ+XG5cdFx0XHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJz57dHJhbnNsYXRlTWVzc2FnZSgndXNlci1zZWdtZW50cy11bnZlcmlmaWVkLWRlc2MnKX08L1RleHQ+XG5cdFx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdFx0PEJveCBkaXNwbGF5PSdmbGV4JyBhbGlnbkl0ZW1zPSdjZW50ZXInIHN0eWxlPXt7IGdhcDogMTIgfX0+XG5cdFx0XHRcdFx0XHQ8QmFkZ2Ugb3V0bGluZT57cGF5bG9hZC5jb3VudHMudW52ZXJpZmllZH08L0JhZGdlPlxuXHRcdFx0XHRcdFx0PGEgaHJlZj17YnVpbGRVc2VyTGlzdEhyZWYocmVzb3VyY2UuaWQsIHsgZW1haWxWZXJpZmllZDogJ2ZhbHNlJyB9KX0+XG5cdFx0XHRcdFx0XHRcdDxCdXR0b24gdmFyaWFudD0nb3V0bGluZWQnPnt0cmFuc2xhdGVNZXNzYWdlKCd1c2VyLXNlZ21lbnRzLW9wZW4nKX08L0J1dHRvbj5cblx0XHRcdFx0XHRcdDwvYT5cblx0XHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdDxVc2Vyc1RhYmxlIHJlc291cmNlSWQ9e3Jlc291cmNlLmlkfSB1c2Vycz17cGF5bG9hZC5saXN0cy51bnZlcmlmaWVkfSAvPlxuXHRcdFx0PC9Cb3g+XG5cblx0XHRcdDxCb3ggdmFyaWFudD0nd2hpdGUnIHA9J3h4bCcgYm9yZGVyUmFkaXVzPSd4bCcgYm94U2hhZG93PSdzbScgc3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnIH19PlxuXHRcdFx0XHQ8Qm94IGRpc3BsYXk9J2ZsZXgnIGFsaWduSXRlbXM9J2NlbnRlcicganVzdGlmeUNvbnRlbnQ9J3NwYWNlLWJldHdlZW4nIG1iPSdsZyc+XG5cdFx0XHRcdFx0PEJveD5cblx0XHRcdFx0XHRcdDxUZXh0IGZvbnRXZWlnaHQ9J2JvbGQnPnt0cmFuc2xhdGVNZXNzYWdlKCd1c2VyLXNlZ21lbnRzLWhpZ2gtc3BlbmRlcnMnKX08L1RleHQ+XG5cdFx0XHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJz5cblx0XHRcdFx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoJ3VzZXItc2VnbWVudHMtaGlnaC1zcGVuZGVycy1kZXNjJywge1xuXHRcdFx0XHRcdFx0XHRcdG1pbjogU3RyaW5nKHBheWxvYWQuY29uZmlnLmhpZ2hTcGVuZGVyTWluTHR2KSxcblx0XHRcdFx0XHRcdFx0fSl9XG5cdFx0XHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdFx0PEJveCBkaXNwbGF5PSdmbGV4JyBhbGlnbkl0ZW1zPSdjZW50ZXInIHN0eWxlPXt7IGdhcDogMTIgfX0+XG5cdFx0XHRcdFx0XHQ8QmFkZ2Ugb3V0bGluZT57cGF5bG9hZC5jb3VudHMuaGlnaFNwZW5kZXJzID8/ICctJ308L0JhZGdlPlxuXHRcdFx0XHRcdDwvQm94PlxuXHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0PFVzZXJzVGFibGUgcmVzb3VyY2VJZD17cmVzb3VyY2UuaWR9IHVzZXJzPXtwYXlsb2FkLmxpc3RzLmhpZ2hTcGVuZGVyc30gc2hvd0x0diBzaG93TGFzdE9yZGVyIC8+XG5cdFx0XHQ8L0JveD5cblxuXHRcdFx0PEJveCB2YXJpYW50PSd3aGl0ZScgcD0neHhsJyBib3JkZXJSYWRpdXM9J3hsJyBib3hTaGFkb3c9J3NtJyBzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQgI0UyRThGMCcgfX0+XG5cdFx0XHRcdDxCb3ggZGlzcGxheT0nZmxleCcgYWxpZ25JdGVtcz0nY2VudGVyJyBqdXN0aWZ5Q29udGVudD0nc3BhY2UtYmV0d2VlbicgbWI9J2xnJz5cblx0XHRcdFx0XHQ8Qm94PlxuXHRcdFx0XHRcdFx0PFRleHQgZm9udFdlaWdodD0nYm9sZCc+e3RyYW5zbGF0ZU1lc3NhZ2UoJ3VzZXItc2VnbWVudHMtaW5hY3RpdmUnKX08L1RleHQ+XG5cdFx0XHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJz5cblx0XHRcdFx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoJ3VzZXItc2VnbWVudHMtaW5hY3RpdmUtZGVzYycsIHsgZGF5czogU3RyaW5nKHBheWxvYWQuY29uZmlnLmluYWN0aXZlRGF5cykgfSl9XG5cdFx0XHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdFx0PEJveCBkaXNwbGF5PSdmbGV4JyBhbGlnbkl0ZW1zPSdjZW50ZXInIHN0eWxlPXt7IGdhcDogMTIgfX0+XG5cdFx0XHRcdFx0XHQ8QmFkZ2Ugb3V0bGluZT57cGF5bG9hZC5jb3VudHMuaW5hY3RpdmV9PC9CYWRnZT5cblx0XHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdDxVc2Vyc1RhYmxlIHJlc291cmNlSWQ9e3Jlc291cmNlLmlkfSB1c2Vycz17cGF5bG9hZC5saXN0cy5pbmFjdGl2ZX0gc2hvd0xhc3RPcmRlciAvPlxuXHRcdFx0PC9Cb3g+XG5cdFx0PC9Cb3g+XG5cdCk7XG59XG4iLCJpbXBvcnQgeyB1c2VNZW1vLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEFwaUNsaWVudCwgdHlwZSBBY3Rpb25Qcm9wcywgdXNlTm90aWNlLCB1c2VUcmFuc2xhdGlvbiB9IGZyb20gJ2FkbWluanMnO1xuaW1wb3J0IHsgQm94LCBCdXR0b24sIEZvcm1Hcm91cCwgTGFiZWwsIFRleHQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcblxuY29uc3QgYXBpID0gbmV3IEFwaUNsaWVudCgpO1xuXG5jb25zdCB0b0xvY2FsSW5wdXRWYWx1ZSA9ICh2YWx1ZTogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCkgPT4ge1xuXHRpZiAoIXZhbHVlKSByZXR1cm4gJyc7XG5cdGNvbnN0IHBhcnNlZCA9IERhdGUucGFyc2UodmFsdWUpO1xuXHRpZiAoTnVtYmVyLmlzTmFOKHBhcnNlZCkpIHJldHVybiAnJztcblx0Y29uc3QgZCA9IG5ldyBEYXRlKHBhcnNlZCk7XG5cdGNvbnN0IHBhZCA9IChuOiBudW1iZXIpID0+IFN0cmluZyhuKS5wYWRTdGFydCgyLCAnMCcpO1xuXHRyZXR1cm4gYCR7ZC5nZXRGdWxsWWVhcigpfS0ke3BhZChkLmdldE1vbnRoKCkgKyAxKX0tJHtwYWQoZC5nZXREYXRlKCkpfVQke3BhZChkLmdldEhvdXJzKCkpfToke3BhZChkLmdldE1pbnV0ZXMoKSl9YDtcbn07XG5cbmNvbnN0IGZvcm1hdE1vbmV5ID0gKHZhbHVlOiBudW1iZXIsIGN1cnJlbmN5ID0gJ1VBSCcpID0+IHtcblx0Y29uc3Qgc2FmZVZhbHVlID0gTnVtYmVyLmlzRmluaXRlKHZhbHVlKSA/IHZhbHVlIDogMDtcblx0dHJ5IHtcblx0XHRyZXR1cm4gbmV3IEludGwuTnVtYmVyRm9ybWF0KHVuZGVmaW5lZCwge1xuXHRcdFx0c3R5bGU6ICdjdXJyZW5jeScsXG5cdFx0XHRjdXJyZW5jeSxcblx0XHRcdG1pbmltdW1GcmFjdGlvbkRpZ2l0czogMixcblx0XHRcdG1heGltdW1GcmFjdGlvbkRpZ2l0czogMixcblx0XHR9KS5mb3JtYXQoc2FmZVZhbHVlKTtcblx0fSBjYXRjaCB7XG5cdFx0cmV0dXJuIHNhZmVWYWx1ZS50b0ZpeGVkKDIpO1xuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBQcm9kdWN0U2NoZWR1bGVEaXNjb3VudEFjdGlvbih7IGFjdGlvbiwgcmVjb3JkLCByZXNvdXJjZSB9OiBBY3Rpb25Qcm9wcykge1xuXHRjb25zdCBhZGROb3RpY2UgPSB1c2VOb3RpY2UoKTtcblx0Y29uc3QgeyB0cmFuc2xhdGVBY3Rpb24sIHRyYW5zbGF0ZU1lc3NhZ2UgfSA9IHVzZVRyYW5zbGF0aW9uKCk7XG5cblx0Y29uc3QgcHJvZHVjdE5hbWUgPSB1c2VNZW1vKCgpID0+IFN0cmluZyhyZWNvcmQ/LnBhcmFtcz8ubmFtZSA/PyAnJyksIFtyZWNvcmQ/LnBhcmFtcz8ubmFtZV0pO1xuXHRjb25zdCBwcm9kdWN0U2x1ZyA9IHVzZU1lbW8oKCkgPT4gU3RyaW5nKHJlY29yZD8ucGFyYW1zPy5zbHVnID8/ICcnKSwgW3JlY29yZD8ucGFyYW1zPy5zbHVnXSk7XG5cdGNvbnN0IHByb2R1Y3RTdGF0dXMgPSB1c2VNZW1vKCgpID0+IFN0cmluZyhyZWNvcmQ/LnBhcmFtcz8uc3RhdHVzID8/ICcnKSwgW3JlY29yZD8ucGFyYW1zPy5zdGF0dXNdKTtcblx0Y29uc3QgYmFzZVByaWNlID0gdXNlTWVtbygoKSA9PiBOdW1iZXIocmVjb3JkPy5wYXJhbXM/LmJhc2VQcmljZSA/PyAwKSwgW3JlY29yZD8ucGFyYW1zPy5iYXNlUHJpY2VdKTtcblx0Y29uc3QgaW5pdGlhbERpc2NvdW50UHJpY2UgPSB1c2VNZW1vKFxuXHRcdCgpID0+IChyZWNvcmQ/LnBhcmFtcz8uZGlzY291bnRQcmljZSAhPSBudWxsID8gU3RyaW5nKHJlY29yZD8ucGFyYW1zPy5kaXNjb3VudFByaWNlKSA6ICcnKSxcblx0XHRbcmVjb3JkPy5wYXJhbXM/LmRpc2NvdW50UHJpY2VdXG5cdCk7XG5cdGNvbnN0IGluaXRpYWxTdGFydCA9IHVzZU1lbW8oXG5cdFx0KCkgPT4gdG9Mb2NhbElucHV0VmFsdWUoKHJlY29yZD8ucGFyYW1zPy5kaXNjb3VudFN0YXJ0QXQgYXMgc3RyaW5nIHwgdW5kZWZpbmVkKSA/PyBudWxsKSxcblx0XHRbcmVjb3JkPy5wYXJhbXM/LmRpc2NvdW50U3RhcnRBdF1cblx0KTtcblx0Y29uc3QgaW5pdGlhbEVuZCA9IHVzZU1lbW8oXG5cdFx0KCkgPT4gdG9Mb2NhbElucHV0VmFsdWUoKHJlY29yZD8ucGFyYW1zPy5kaXNjb3VudEVuZEF0IGFzIHN0cmluZyB8IHVuZGVmaW5lZCkgPz8gbnVsbCksXG5cdFx0W3JlY29yZD8ucGFyYW1zPy5kaXNjb3VudEVuZEF0XVxuXHQpO1xuXG5cdGNvbnN0IFtkaXNjb3VudFByaWNlLCBzZXREaXNjb3VudFByaWNlXSA9IHVzZVN0YXRlKGluaXRpYWxEaXNjb3VudFByaWNlKTtcblx0Y29uc3QgW2Rpc2NvdW50U3RhcnRBdCwgc2V0RGlzY291bnRTdGFydEF0XSA9IHVzZVN0YXRlKGluaXRpYWxTdGFydCk7XG5cdGNvbnN0IFtkaXNjb3VudEVuZEF0LCBzZXREaXNjb3VudEVuZEF0XSA9IHVzZVN0YXRlKGluaXRpYWxFbmQpO1xuXHRjb25zdCBbc2F2aW5nLCBzZXRTYXZpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuXG5cdGNvbnN0IHRpdGxlID0gdHJhbnNsYXRlQWN0aW9uKGFjdGlvbi5uYW1lLCByZXNvdXJjZS5pZCk7XG5cblx0Y29uc3QgY2xpZW50VmFsaWRhdGlvbkVycm9yID0gdXNlTWVtbygoKSA9PiB7XG5cdFx0Y29uc3QgaGFzV2luZG93ID0gQm9vbGVhbihkaXNjb3VudFN0YXJ0QXQgfHwgZGlzY291bnRFbmRBdCk7XG5cdFx0aWYgKGhhc1dpbmRvdyAmJiAoIWRpc2NvdW50U3RhcnRBdCB8fCAhZGlzY291bnRFbmRBdCkpIHtcblx0XHRcdHJldHVybiB0cmFuc2xhdGVNZXNzYWdlKCdkaXNjb3VudC13aW5kb3ctaW52YWxpZCcpO1xuXHRcdH1cblx0XHRpZiAoZGlzY291bnRTdGFydEF0ICYmIGRpc2NvdW50RW5kQXQpIHtcblx0XHRcdGNvbnN0IHN0YXJ0ID0gbmV3IERhdGUoZGlzY291bnRTdGFydEF0KTtcblx0XHRcdGNvbnN0IGVuZCA9IG5ldyBEYXRlKGRpc2NvdW50RW5kQXQpO1xuXHRcdFx0aWYgKCFOdW1iZXIuaXNOYU4oc3RhcnQuZ2V0VGltZSgpKSAmJiAhTnVtYmVyLmlzTmFOKGVuZC5nZXRUaW1lKCkpICYmIHN0YXJ0LmdldFRpbWUoKSA+PSBlbmQuZ2V0VGltZSgpKSB7XG5cdFx0XHRcdHJldHVybiB0cmFuc2xhdGVNZXNzYWdlKCdkaXNjb3VudC13aW5kb3ctaW52YWxpZCcpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoaGFzV2luZG93ICYmICFkaXNjb3VudFByaWNlLnRyaW0oKSkge1xuXHRcdFx0cmV0dXJuIHRyYW5zbGF0ZU1lc3NhZ2UoJ2Rpc2NvdW50LXByaWNlLXJlcXVpcmVkJyk7XG5cdFx0fVxuXHRcdGlmIChkaXNjb3VudFByaWNlLnRyaW0oKSkge1xuXHRcdFx0Y29uc3QgcGFyc2VkID0gTnVtYmVyKGRpc2NvdW50UHJpY2UpO1xuXHRcdFx0aWYgKCFOdW1iZXIuaXNGaW5pdGUocGFyc2VkKSB8fCAhKHBhcnNlZCA+IDApIHx8ICEocGFyc2VkIDwgYmFzZVByaWNlKSkge1xuXHRcdFx0XHRyZXR1cm4gdHJhbnNsYXRlTWVzc2FnZSgnZGlzY291bnQtcHJpY2UtaW52YWxpZCcpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gbnVsbDtcblx0fSwgW2Jhc2VQcmljZSwgZGlzY291bnRFbmRBdCwgZGlzY291bnRQcmljZSwgZGlzY291bnRTdGFydEF0LCB0cmFuc2xhdGVNZXNzYWdlXSk7XG5cblx0Y29uc3QgY3VycmVudFN1bW1hcnkgPSB1c2VNZW1vKCgpID0+IHtcblx0XHRjb25zdCBkcCA9IHJlY29yZD8ucGFyYW1zPy5kaXNjb3VudFByaWNlICE9IG51bGwgPyBOdW1iZXIocmVjb3JkPy5wYXJhbXM/LmRpc2NvdW50UHJpY2UpIDogbnVsbDtcblx0XHRpZiAoIWRwKSByZXR1cm4gdHJhbnNsYXRlTWVzc2FnZSgnZGlzY291bnQtbm9uZScpO1xuXHRcdGNvbnN0IHN0YXJ0ID0gKHJlY29yZD8ucGFyYW1zPy5kaXNjb3VudFN0YXJ0QXQgYXMgc3RyaW5nIHwgdW5kZWZpbmVkKSA/PyBudWxsO1xuXHRcdGNvbnN0IGVuZCA9IChyZWNvcmQ/LnBhcmFtcz8uZGlzY291bnRFbmRBdCBhcyBzdHJpbmcgfCB1bmRlZmluZWQpID8/IG51bGw7XG5cdFx0aWYgKCFzdGFydCAmJiAhZW5kKSByZXR1cm4gdHJhbnNsYXRlTWVzc2FnZSgnZGlzY291bnQtYWx3YXlzJywgeyBwcmljZTogZm9ybWF0TW9uZXkoZHApIH0pO1xuXHRcdHJldHVybiB0cmFuc2xhdGVNZXNzYWdlKCdkaXNjb3VudC13aW5kb3cnLCB7XG5cdFx0XHRwcmljZTogZm9ybWF0TW9uZXkoZHApLFxuXHRcdFx0c3RhcnQ6IHN0YXJ0ID8gbmV3IERhdGUoc3RhcnQpLnRvTG9jYWxlU3RyaW5nKCkgOiAnLScsXG5cdFx0XHRlbmQ6IGVuZCA/IG5ldyBEYXRlKGVuZCkudG9Mb2NhbGVTdHJpbmcoKSA6ICctJyxcblx0XHR9KTtcblx0fSwgW3JlY29yZD8ucGFyYW1zPy5kaXNjb3VudEVuZEF0LCByZWNvcmQ/LnBhcmFtcz8uZGlzY291bnRQcmljZSwgcmVjb3JkPy5wYXJhbXM/LmRpc2NvdW50U3RhcnRBdCwgdHJhbnNsYXRlTWVzc2FnZV0pO1xuXG5cdGNvbnN0IGhhbmRsZVNhdmUgPSBhc3luYyAoKSA9PiB7XG5cdFx0aWYgKCFyZWNvcmQ/LmlkIHx8IHNhdmluZykgcmV0dXJuO1xuXHRcdGlmIChjbGllbnRWYWxpZGF0aW9uRXJyb3IpIHtcblx0XHRcdGFkZE5vdGljZSh7IG1lc3NhZ2U6IGNsaWVudFZhbGlkYXRpb25FcnJvciwgdHlwZTogJ2Vycm9yJyB9KTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0c2V0U2F2aW5nKHRydWUpO1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuXHRcdFx0Zm9ybURhdGEuYXBwZW5kKCdkaXNjb3VudFByaWNlJywgZGlzY291bnRQcmljZSk7XG5cdFx0XHRmb3JtRGF0YS5hcHBlbmQoJ2Rpc2NvdW50U3RhcnRBdCcsIGRpc2NvdW50U3RhcnRBdCA/IG5ldyBEYXRlKGRpc2NvdW50U3RhcnRBdCkudG9JU09TdHJpbmcoKSA6ICcnKTtcblx0XHRcdGZvcm1EYXRhLmFwcGVuZCgnZGlzY291bnRFbmRBdCcsIGRpc2NvdW50RW5kQXQgPyBuZXcgRGF0ZShkaXNjb3VudEVuZEF0KS50b0lTT1N0cmluZygpIDogJycpO1xuXG5cdFx0XHRjb25zdCByZXNwb25zZSA9IGF3YWl0IGFwaS5yZWNvcmRBY3Rpb24oe1xuXHRcdFx0XHRyZXNvdXJjZUlkOiByZXNvdXJjZS5pZCxcblx0XHRcdFx0cmVjb3JkSWQ6IHJlY29yZC5pZCxcblx0XHRcdFx0YWN0aW9uTmFtZTogYWN0aW9uLm5hbWUsXG5cdFx0XHRcdG1ldGhvZDogJ3Bvc3QnLFxuXHRcdFx0XHRkYXRhOiBmb3JtRGF0YSxcblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAocmVzcG9uc2UuZGF0YS5ub3RpY2UpIGFkZE5vdGljZShyZXNwb25zZS5kYXRhLm5vdGljZSk7XG5cdFx0fSBjYXRjaCB7XG5cdFx0XHRhZGROb3RpY2UoeyBtZXNzYWdlOiAnZGlzY291bnQtc2NoZWR1bGUtZmFpbGVkJywgdHlwZTogJ2Vycm9yJyB9KTtcblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0c2V0U2F2aW5nKGZhbHNlKTtcblx0XHR9XG5cdH07XG5cblx0cmV0dXJuIChcblx0XHQ8Qm94XG5cdFx0XHR2YXJpYW50PSd3aGl0ZSdcblx0XHRcdHA9J3h4bCdcblx0XHRcdGJvcmRlclJhZGl1cz0neGwnXG5cdFx0XHRib3hTaGFkb3c9J3NtJ1xuXHRcdFx0bWF4V2lkdGg9JzcyMHB4J1xuXHRcdFx0c3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnIH19XG5cdFx0PlxuXHRcdFx0PFRleHQgZm9udFNpemU9J3hsJyBmb250V2VpZ2h0PSdib2xkJyBtYj0nbWQnPlxuXHRcdFx0XHR7dGl0bGV9XG5cdFx0XHQ8L1RleHQ+XG5cdFx0XHR7cHJvZHVjdE5hbWUgPyAoXG5cdFx0XHRcdDxCb3ggbWI9J2xnJz5cblx0XHRcdFx0XHQ8VGV4dCBmb250V2VpZ2h0PSdib2xkJz57cHJvZHVjdE5hbWV9PC9UZXh0PlxuXHRcdFx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnPlxuXHRcdFx0XHRcdFx0e3Byb2R1Y3RTbHVnID8gYCR7cHJvZHVjdFNsdWd9YCA6IG51bGx9XG5cdFx0XHRcdFx0XHR7cHJvZHVjdFN0YXR1cyA/IGAke3Byb2R1Y3RTbHVnID8gJyDigKIgJyA6ICcnfSR7cHJvZHVjdFN0YXR1c31gIDogbnVsbH1cblx0XHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHRcdDwvQm94PlxuXHRcdFx0KSA6IG51bGx9XG5cdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJyBtYj0nbGcnPlxuXHRcdFx0XHR7dHJhbnNsYXRlTWVzc2FnZSgnZGlzY291bnQtYmFzZS1wcmljZScpfToge2Zvcm1hdE1vbmV5KGJhc2VQcmljZSl9XG5cdFx0XHQ8L1RleHQ+XG5cdFx0XHQ8VGV4dCBtYj0neGwnPntjdXJyZW50U3VtbWFyeX08L1RleHQ+XG5cblx0XHRcdDxCb3ggc3R5bGU9e3sgZGlzcGxheTogJ2dyaWQnLCBncmlkVGVtcGxhdGVDb2x1bW5zOiAnMWZyJywgZ2FwOiAxNiB9fT5cblx0XHRcdFx0PEZvcm1Hcm91cCBsYWJlbD17dHJhbnNsYXRlTWVzc2FnZSgnZGlzY291bnQtcHJpY2UtbGFiZWwnKX0gbWI9JzAnPlxuXHRcdFx0XHRcdDxpbnB1dFxuXHRcdFx0XHRcdFx0dHlwZT0nbnVtYmVyJ1xuXHRcdFx0XHRcdFx0c3RlcD0nMC4wMSdcblx0XHRcdFx0XHRcdHZhbHVlPXtkaXNjb3VudFByaWNlfVxuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyhlKSA9PiBzZXREaXNjb3VudFByaWNlKGUudGFyZ2V0LnZhbHVlKX1cblx0XHRcdFx0XHRcdHBsYWNlaG9sZGVyPScwLjAwJ1xuXHRcdFx0XHRcdFx0c3R5bGU9e3tcblx0XHRcdFx0XHRcdFx0d2lkdGg6ICcxMDAlJyxcblx0XHRcdFx0XHRcdFx0cGFkZGluZzogJzEwcHggMTJweCcsXG5cdFx0XHRcdFx0XHRcdGJvcmRlclJhZGl1czogOCxcblx0XHRcdFx0XHRcdFx0Ym9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnLFxuXHRcdFx0XHRcdFx0XHRmb250U2l6ZTogMTQsXG5cdFx0XHRcdFx0XHR9fVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdDwvRm9ybUdyb3VwPlxuXG5cdFx0XHRcdDxCb3g+XG5cdFx0XHRcdFx0PExhYmVsIGh0bWxGb3I9J2Rpc2NvdW50U3RhcnRBdCc+e3RyYW5zbGF0ZU1lc3NhZ2UoJ2Rpc2NvdW50LXN0YXJ0Jyl9PC9MYWJlbD5cblx0XHRcdFx0XHQ8aW5wdXRcblx0XHRcdFx0XHRcdGlkPSdkaXNjb3VudFN0YXJ0QXQnXG5cdFx0XHRcdFx0XHR0eXBlPSdkYXRldGltZS1sb2NhbCdcblx0XHRcdFx0XHRcdHZhbHVlPXtkaXNjb3VudFN0YXJ0QXR9XG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17KGUpID0+IHNldERpc2NvdW50U3RhcnRBdChlLnRhcmdldC52YWx1ZSl9XG5cdFx0XHRcdFx0XHRzdHlsZT17e1xuXHRcdFx0XHRcdFx0XHR3aWR0aDogJzEwMCUnLFxuXHRcdFx0XHRcdFx0XHRwYWRkaW5nOiAnMTBweCAxMnB4Jyxcblx0XHRcdFx0XHRcdFx0Ym9yZGVyUmFkaXVzOiA4LFxuXHRcdFx0XHRcdFx0XHRib3JkZXI6ICcxcHggc29saWQgI0UyRThGMCcsXG5cdFx0XHRcdFx0XHRcdG1hcmdpblRvcDogMTAsXG5cdFx0XHRcdFx0XHRcdGZvbnRTaXplOiAxNCxcblx0XHRcdFx0XHRcdH19XG5cdFx0XHRcdFx0Lz5cblx0XHRcdFx0PC9Cb3g+XG5cblx0XHRcdFx0PEJveD5cblx0XHRcdFx0XHQ8TGFiZWwgaHRtbEZvcj0nZGlzY291bnRFbmRBdCc+e3RyYW5zbGF0ZU1lc3NhZ2UoJ2Rpc2NvdW50LWVuZCcpfTwvTGFiZWw+XG5cdFx0XHRcdFx0PGlucHV0XG5cdFx0XHRcdFx0XHRpZD0nZGlzY291bnRFbmRBdCdcblx0XHRcdFx0XHRcdHR5cGU9J2RhdGV0aW1lLWxvY2FsJ1xuXHRcdFx0XHRcdFx0dmFsdWU9e2Rpc2NvdW50RW5kQXR9XG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17KGUpID0+IHNldERpc2NvdW50RW5kQXQoZS50YXJnZXQudmFsdWUpfVxuXHRcdFx0XHRcdFx0c3R5bGU9e3tcblx0XHRcdFx0XHRcdFx0d2lkdGg6ICcxMDAlJyxcblx0XHRcdFx0XHRcdFx0cGFkZGluZzogJzEwcHggMTJweCcsXG5cdFx0XHRcdFx0XHRcdGJvcmRlclJhZGl1czogOCxcblx0XHRcdFx0XHRcdFx0Ym9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnLFxuXHRcdFx0XHRcdFx0XHRtYXJnaW5Ub3A6IDEwLFxuXHRcdFx0XHRcdFx0XHRmb250U2l6ZTogMTQsXG5cdFx0XHRcdFx0XHR9fVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdDwvQm94PlxuXHRcdFx0PC9Cb3g+XG5cblx0XHRcdHtjbGllbnRWYWxpZGF0aW9uRXJyb3IgPyAoXG5cdFx0XHRcdDxUZXh0IGNvbG9yPSdyZWQ2MCcgbXQ9J2xnJz5cblx0XHRcdFx0XHR7Y2xpZW50VmFsaWRhdGlvbkVycm9yfVxuXHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHQpIDogbnVsbH1cblxuXHRcdFx0PEJveCBtdD0neGwnPlxuXHRcdFx0XHQ8QnV0dG9uXG5cdFx0XHRcdFx0c3R5bGU9e3sgYm9yZGVyQ29sb3I6ICd3aGl0ZScsIGJhY2tncm91bmQ6ICcjZmFjYzE1JywgY29sb3I6ICdibGFjaycgfX1cblx0XHRcdFx0XHR2YXJpYW50PSdjb250YWluZWQnXG5cdFx0XHRcdFx0Y29sb3I9J3ByaW1hcnknXG5cdFx0XHRcdFx0b25DbGljaz17aGFuZGxlU2F2ZX1cblx0XHRcdFx0XHRkaXNhYmxlZD17c2F2aW5nfVxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0e3NhdmluZyA/IHRyYW5zbGF0ZU1lc3NhZ2UoJ2Rpc2NvdW50LXNhdmluZycpIDogdHJhbnNsYXRlTWVzc2FnZSgnZGlzY291bnQtc2F2ZScpfVxuXHRcdFx0XHQ8L0J1dHRvbj5cblx0XHRcdDwvQm94PlxuXHRcdDwvQm94PlxuXHQpO1xufVxuIiwiaW1wb3J0IHR5cGUgeyBTaG93UHJvcGVydHlQcm9wcyB9IGZyb20gJ2FkbWluanMnO1xuaW1wb3J0IHsgQm94LCBUZXh0IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFByb2R1Y3ROYW1lTGlzdChwcm9wczogU2hvd1Byb3BlcnR5UHJvcHMpIHtcblx0Y29uc3QgeyByZWNvcmQsIHByb3BlcnR5IH0gPSBwcm9wcztcblx0Y29uc3QgbmFtZSA9IFN0cmluZyhyZWNvcmQucGFyYW1zW3Byb3BlcnR5LnBhdGhdID8/ICcnKTtcblx0Y29uc3QgaW1hZ2VVcmwgPSAocmVjb3JkLnBhcmFtcy5pbWFnZVVybCBhcyBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkKSA/PyBudWxsO1xuXG5cdHJldHVybiAoXG5cdFx0PEJveCBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6IDE0LCBtaW5XaWR0aDogMjYwIH19PlxuXHRcdFx0PEJveFxuXHRcdFx0XHRzdHlsZT17e1xuXHRcdFx0XHRcdHdpZHRoOiA2NCxcblx0XHRcdFx0XHRoZWlnaHQ6IDY0LFxuXHRcdFx0XHRcdGJvcmRlclJhZGl1czogMTAsXG5cdFx0XHRcdFx0Ym9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnLFxuXHRcdFx0XHRcdGJhY2tncm91bmQ6ICcjRjhGQUZDJyxcblx0XHRcdFx0XHRcdG92ZXJmbG93OiAnaGlkZGVuJyxcblx0XHRcdFx0XHRcdGZsZXhTaHJpbms6IDAsXG5cdFx0XHRcdFx0fX1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdHtpbWFnZVVybCA/IChcblx0XHRcdFx0XHRcdDxpbWdcblx0XHRcdFx0XHRcdFx0c3JjPXtpbWFnZVVybH1cblx0XHRcdFx0XHRcdFx0YWx0PScnXG5cdFx0XHRcdFx0XHRcdHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIGhlaWdodDogJzEwMCUnLCBvYmplY3RGaXQ6ICdjb3ZlcicsIGRpc3BsYXk6ICdibG9jaycgfX1cblx0XHRcdFx0XHRcdFx0bG9hZGluZz0nbGF6eSdcblx0XHRcdFx0XHRcdC8+XG5cdFx0XHRcdFx0XHQpIDogbnVsbH1cblx0XHRcdDwvQm94PlxuXHRcdFx0PEJveCBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBnYXA6IDQsIG1pbldpZHRoOiAwIH19PlxuXHRcdFx0XHQ8VGV4dCBzdHlsZT17eyBmb250V2VpZ2h0OiA2MDAsIHdoaXRlU3BhY2U6ICdub3dyYXAnLCBvdmVyZmxvdzogJ2hpZGRlbicsIHRleHRPdmVyZmxvdzogJ2VsbGlwc2lzJyB9fT5cblx0XHRcdFx0XHR7bmFtZX1cblx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0PC9Cb3g+XG5cdFx0PC9Cb3g+XG5cdCk7XG59XG4iLCJpbXBvcnQgeyB0eXBlIEFjdGlvblByb3BzLCBPcmlnaW5hbExpc3QsIHVzZVRyYW5zbGF0aW9uIH0gZnJvbSAnYWRtaW5qcyc7XG5pbXBvcnQgeyBCb3gsIEJ1dHRvbiwgVGV4dCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xuXG5jb25zdCBhY3Rpb25CdXR0b25TdHlsZSA9IHtcblx0Ym9yZGVyQ29sb3I6ICd3aGl0ZScsXG5cdGJhY2tncm91bmQ6ICcjZmFjYzE1Jyxcblx0Y29sb3I6ICdibGFjaycsXG59O1xuXG5jb25zdCBnZXRSb290UGF0aCA9ICgpID0+IHtcblx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSByZXR1cm4gJyc7XG5cdGNvbnN0IHBhdGggPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgPz8gJyc7XG5cdGNvbnN0IHBhcnRzID0gcGF0aC5zcGxpdCgnL3Jlc291cmNlcycpO1xuXHRyZXR1cm4gcGFydHNbMF0gPz8gJyc7XG59O1xuXG5jb25zdCBidWlsZExpc3RIcmVmID0gKHJlc291cmNlSWQ6IHN0cmluZywgZmlsdGVyczogUmVjb3JkPHN0cmluZywgc3RyaW5nPikgPT4ge1xuXHRjb25zdCByb290ID0gZ2V0Um9vdFBhdGgoKTtcblx0Y29uc3QgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcygpO1xuXHRmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhmaWx0ZXJzKSkge1xuXHRcdHBhcmFtcy5zZXQoYGZpbHRlcnMuJHtrZXl9YCwgdmFsdWUpO1xuXHR9XG5cdGNvbnN0IHF1ZXJ5ID0gcGFyYW1zLnRvU3RyaW5nKCk7XG5cdHJldHVybiBgJHtyb290fS9yZXNvdXJjZXMvJHtyZXNvdXJjZUlkfSR7cXVlcnkgPyBgPyR7cXVlcnl9YCA6ICcnfWA7XG59O1xuXG5jb25zdCBkYXlzQWdvSXNvID0gKGRheXM6IG51bWJlcikgPT4gbmV3IERhdGUoRGF0ZS5ub3coKSAtIGRheXMgKiAyNCAqIDYwICogNjAgKiAxMDAwKS50b0lTT1N0cmluZygpO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBQcm9kdWN0TGlzdChwcm9wczogQWN0aW9uUHJvcHMpIHtcblx0Y29uc3QgeyByZXNvdXJjZSB9ID0gcHJvcHM7XG5cdGNvbnN0IHsgdHJhbnNsYXRlTWVzc2FnZSB9ID0gdXNlVHJhbnNsYXRpb24oKTtcblxuXHRjb25zdCB2aWV3czogQXJyYXk8eyBrZXk6IHN0cmluZzsgZmlsdGVyczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiB9PiA9IFtcblx0XHR7IGtleTogJ2luLXN0b2NrJywgZmlsdGVyczogeyBpblN0b2NrOiAndHJ1ZScgfSB9LFxuXHRcdHsga2V5OiAnbG93LXN0b2NrJywgZmlsdGVyczogeyBpblN0b2NrOiAndHJ1ZScsIHN0b2NrOiBKU09OLnN0cmluZ2lmeSh7IGx0ZTogNSB9KSB9IH0sXG5cdFx0eyBrZXk6ICdkaXNjb3VudGVkJywgZmlsdGVyczogeyBkaXNjb3VudFByaWNlOiBKU09OLnN0cmluZ2lmeSh7IG5vdDogbnVsbCB9KSB9IH0sXG5cdFx0eyBrZXk6ICduby1pbWFnZScsIGZpbHRlcnM6IHsgaW1hZ2VVcmw6IEpTT04uc3RyaW5naWZ5KHsgZXF1YWxzOiBudWxsIH0pIH0gfSxcblx0XHR7IGtleTogJ3JlY2VudGx5LXVwZGF0ZWQnLCBmaWx0ZXJzOiB7IHVwZGF0ZWRBdDogSlNPTi5zdHJpbmdpZnkoeyBndGU6IGRheXNBZ29Jc28oNykgfSkgfSB9LFxuXHRcdHsga2V5OiAnZHJhZnQnLCBmaWx0ZXJzOiB7IHN0YXR1czogJ0RSQUZUJyB9IH0sXG5cdF07XG5cblx0cmV0dXJuIChcblx0XHQ8Qm94PlxuXHRcdFx0PEJveFxuXHRcdFx0XHR2YXJpYW50PSd3aGl0ZSdcblx0XHRcdFx0cD0nbGcnXG5cdFx0XHRcdGJvcmRlclJhZGl1cz0neGwnXG5cdFx0XHRcdGJveFNoYWRvdz0nc20nXG5cdFx0XHRcdG1iPSd4bCdcblx0XHRcdFx0c3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnLCBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6IDEyLCBmbGV4V3JhcDogJ3dyYXAnIH19XG5cdFx0XHQ+XG5cdFx0XHRcdDxUZXh0IGZvbnRXZWlnaHQ9J2JvbGQnPnt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LXZpZXdzLXRpdGxlJyl9PC9UZXh0PlxuXHRcdFx0XHQ8Qm94IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZ2FwOiAxMCwgZmxleFdyYXA6ICd3cmFwJyB9fT5cblx0XHRcdFx0XHR7dmlld3MubWFwKCh2aWV3KSA9PiAoXG5cdFx0XHRcdFx0XHQ8YSBrZXk9e3ZpZXcua2V5fSBocmVmPXtidWlsZExpc3RIcmVmKHJlc291cmNlLmlkLCB2aWV3LmZpbHRlcnMpfT5cblx0XHRcdFx0XHRcdFx0PEJ1dHRvbiB2YXJpYW50PSdjb250YWluZWQnIGNvbG9yPSdwcmltYXJ5JyBzdHlsZT17YWN0aW9uQnV0dG9uU3R5bGV9PlxuXHRcdFx0XHRcdFx0XHRcdHt0cmFuc2xhdGVNZXNzYWdlKGBwcm9kdWN0LXZpZXdzLSR7dmlldy5rZXl9YCl9XG5cdFx0XHRcdFx0XHRcdDwvQnV0dG9uPlxuXHRcdFx0XHRcdFx0PC9hPlxuXHRcdFx0XHRcdCkpfVxuXHRcdFx0XHRcdDxhIGhyZWY9e2J1aWxkTGlzdEhyZWYocmVzb3VyY2UuaWQsIHt9KX0+XG5cdFx0XHRcdFx0XHQ8QnV0dG9uIHZhcmlhbnQ9J291dGxpbmVkJz57dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC12aWV3cy1jbGVhcicpfTwvQnV0dG9uPlxuXHRcdFx0XHRcdDwvYT5cblx0XHRcdFx0PC9Cb3g+XG5cdFx0XHQ8L0JveD5cblxuXHRcdFx0PE9yaWdpbmFsTGlzdCB7Li4ucHJvcHN9IC8+XG5cdFx0PC9Cb3g+XG5cdCk7XG59XG5cbiIsImV4cG9ydCBjb25zdCBMQU5HVUFHRV9PUFRJT05TID0gW1xuXHR7IHZhbHVlOiAndWsnLCBsYWJlbDogJ9Cj0LrRgCcsIGZsYWc6ICfwn4e68J+HpicgfSxcblx0eyB2YWx1ZTogJ2VuJywgbGFiZWw6ICdFbmcnLCBmbGFnOiAn8J+HuvCfh7gnIH0sXG5dIGFzIGNvbnN0O1xuXG5leHBvcnQgdHlwZSBBcHBMb2NhbGUgPSAodHlwZW9mIExBTkdVQUdFX09QVElPTlMpW251bWJlcl1bJ3ZhbHVlJ107XG5cbmV4cG9ydCBjb25zdCBMT0NBTEVfU1dJVENIRVJfTEFCRUwgPSAnQ2hhbmdlIGxhbmd1YWdlJztcblxuZXhwb3J0IGNvbnN0IExPQ0FMRV9UT19JTlRMX01BUDogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcblx0dWs6ICd1ay1VQScsXG5cdGVuOiAnZW4tVVMnLFxufTtcblxuZXhwb3J0IGNvbnN0IExPQ0FMRV9UT19IVE1MX0xBTkc6IFJlY29yZDwndWsnIHwgJ2VuJywgc3RyaW5nPiA9IHtcblx0dWs6ICd1aycsXG5cdGVuOiAnZW4tVVMnLFxufTtcblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfTE9DQUxFOiBBcHBMb2NhbGUgPSAndWsnO1xuIiwiaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQXBpQ2xpZW50LCB0eXBlIEFjdGlvblByb3BzLCB1c2VOb3RpY2UsIHVzZVRyYW5zbGF0aW9uIH0gZnJvbSAnYWRtaW5qcyc7XG5pbXBvcnQgeyBCYWRnZSwgQm94LCBCdXR0b24sIEljb24sIExhYmVsLCBUZXh0IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSc7XG5cbmNvbnN0IGFwaSA9IG5ldyBBcGlDbGllbnQoKTtcblxudHlwZSBBY3Rpdml0eUVudHJ5ID0ge1xuXHRpZDogc3RyaW5nO1xuXHR0eXBlOiAnRklFTERfQ0hBTkdFJyB8ICdOT1RFJztcblx0ZmllbGQ6IHN0cmluZyB8IG51bGw7XG5cdGZyb21WYWx1ZTogc3RyaW5nIHwgbnVsbDtcblx0dG9WYWx1ZTogc3RyaW5nIHwgbnVsbDtcblx0bm90ZTogc3RyaW5nIHwgbnVsbDtcblx0YWRtaW5FbWFpbDogc3RyaW5nIHwgbnVsbDtcblx0Y3JlYXRlZEF0OiBzdHJpbmc7XG59O1xuXG5jb25zdCBleHRyYWN0UGF5bG9hZCA9IChwYXlsb2FkOiB1bmtub3duKTogeyBlbnRyaWVzOiBBY3Rpdml0eUVudHJ5W107IHVuYXZhaWxhYmxlOiBib29sZWFuIH0gPT4ge1xuXHRpZiAoIXBheWxvYWQgfHwgdHlwZW9mIHBheWxvYWQgIT09ICdvYmplY3QnKSByZXR1cm4geyBlbnRyaWVzOiBbXSwgdW5hdmFpbGFibGU6IGZhbHNlIH07XG5cdGNvbnN0IGVudHJpZXMgPSAocGF5bG9hZCBhcyB7IGVudHJpZXM/OiBBY3Rpdml0eUVudHJ5W10gfSkuZW50cmllcztcblx0Y29uc3QgdW5hdmFpbGFibGUgPSBCb29sZWFuKChwYXlsb2FkIGFzIHsgdW5hdmFpbGFibGU/OiB1bmtub3duIH0pLnVuYXZhaWxhYmxlKTtcblx0cmV0dXJuIHsgZW50cmllczogQXJyYXkuaXNBcnJheShlbnRyaWVzKSA/IGVudHJpZXMgOiBbXSwgdW5hdmFpbGFibGUgfTtcbn07XG5cbnR5cGUgUHJvcHMgPSBBY3Rpb25Qcm9wcyAmIHtcblx0YWN0aW9uTmFtZU92ZXJyaWRlPzogc3RyaW5nO1xuXHR0aXRsZU92ZXJyaWRlPzogc3RyaW5nO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUHJvZHVjdEFjdGl2aXR5VGltZWxpbmUocHJvcHM6IFByb3BzKSB7XG5cdGNvbnN0IHsgYWN0aW9uLCByZWNvcmQsIHJlc291cmNlLCBhY3Rpb25OYW1lT3ZlcnJpZGUsIHRpdGxlT3ZlcnJpZGUgfSA9IHByb3BzO1xuXHRjb25zdCByZWNvcmRJZCA9IHJlY29yZD8uaWQ7XG5cdGNvbnN0IGFjdGlvbk5hbWUgPSBhY3Rpb25OYW1lT3ZlcnJpZGUgPz8gYWN0aW9uPy5uYW1lID8/ICdhY3Rpdml0eVRpbWVsaW5lJztcblx0Y29uc3QgW2VudHJpZXMsIHNldEVudHJpZXNdID0gdXNlU3RhdGU8QWN0aXZpdHlFbnRyeVtdPihbXSk7XG5cdGNvbnN0IFt1bmF2YWlsYWJsZSwgc2V0VW5hdmFpbGFibGVdID0gdXNlU3RhdGUoZmFsc2UpO1xuXHRjb25zdCBbbm90ZSwgc2V0Tm90ZV0gPSB1c2VTdGF0ZSgnJyk7XG5cdGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcblx0Y29uc3QgW3NhdmluZywgc2V0U2F2aW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcblx0Y29uc3QgYWRkTm90aWNlID0gdXNlTm90aWNlKCk7XG5cdGNvbnN0IHsgdHJhbnNsYXRlQWN0aW9uLCB0cmFuc2xhdGVNZXNzYWdlLCB0cmFuc2xhdGVQcm9wZXJ0eSB9ID0gdXNlVHJhbnNsYXRpb24oKTtcblx0Y29uc3QgYWRkTm90aWNlUmVmID0gdXNlUmVmKGFkZE5vdGljZSk7XG5cblx0dXNlRWZmZWN0KCgpID0+IHtcblx0XHRhZGROb3RpY2VSZWYuY3VycmVudCA9IGFkZE5vdGljZTtcblx0fSwgW2FkZE5vdGljZV0pO1xuXG5cdHVzZUVmZmVjdCgoKSA9PiB7XG5cdFx0aWYgKCFyZWNvcmRJZCkgcmV0dXJuO1xuXHRcdGxldCBpc0FjdGl2ZSA9IHRydWU7XG5cdFx0c2V0TG9hZGluZyh0cnVlKTtcblx0XHRhcGkucmVjb3JkQWN0aW9uKHtcblx0XHRcdHJlc291cmNlSWQ6IHJlc291cmNlLmlkLFxuXHRcdFx0cmVjb3JkSWQsXG5cdFx0XHRhY3Rpb25OYW1lLFxuXHRcdFx0bWV0aG9kOiAnZ2V0Jyxcblx0XHR9KVxuXHRcdFx0LnRoZW4oKHJlc3BvbnNlKSA9PiB7XG5cdFx0XHRcdGlmICghaXNBY3RpdmUpIHJldHVybjtcblx0XHRcdFx0Y29uc3QgZXh0cmFjdGVkID0gZXh0cmFjdFBheWxvYWQocmVzcG9uc2UuZGF0YS5wYXlsb2FkKTtcblx0XHRcdFx0c2V0RW50cmllcyhleHRyYWN0ZWQuZW50cmllcyk7XG5cdFx0XHRcdHNldFVuYXZhaWxhYmxlKGV4dHJhY3RlZC51bmF2YWlsYWJsZSk7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKCgpID0+IHtcblx0XHRcdFx0aWYgKCFpc0FjdGl2ZSkgcmV0dXJuO1xuXHRcdFx0XHRhZGROb3RpY2VSZWYuY3VycmVudCh7IG1lc3NhZ2U6ICdwcm9kdWN0LWFjdGl2aXR5LWxvYWQtZmFpbGVkJywgdHlwZTogJ2Vycm9yJyB9KTtcblx0XHRcdH0pXG5cdFx0XHQuZmluYWxseSgoKSA9PiB7XG5cdFx0XHRcdGlmICghaXNBY3RpdmUpIHJldHVybjtcblx0XHRcdFx0c2V0TG9hZGluZyhmYWxzZSk7XG5cdFx0XHR9KTtcblx0XHRyZXR1cm4gKCkgPT4ge1xuXHRcdFx0aXNBY3RpdmUgPSBmYWxzZTtcblx0XHR9O1xuXHR9LCBbYWN0aW9uTmFtZSwgcmVjb3JkSWQsIHJlc291cmNlLmlkXSk7XG5cblx0Y29uc3QgZm9ybWF0VGltZXN0YW1wID0gKHZhbHVlOiBzdHJpbmcpID0+IHtcblx0XHRjb25zdCBwYXJzZWQgPSBEYXRlLnBhcnNlKHZhbHVlKTtcblx0XHRpZiAoTnVtYmVyLmlzTmFOKHBhcnNlZCkpIHJldHVybiB2YWx1ZTtcblx0XHRyZXR1cm4gbmV3IERhdGUocGFyc2VkKS50b0xvY2FsZVN0cmluZygpO1xuXHR9O1xuXG5cdGNvbnN0IHRpdGxlID1cblx0XHR0aXRsZU92ZXJyaWRlID8/IChhY3Rpb24gPyB0cmFuc2xhdGVBY3Rpb24oYWN0aW9uLm5hbWUsIHJlc291cmNlLmlkKSA6IHRyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtYWN0aXZpdHktdGl0bGUnKSk7XG5cblx0Y29uc3QgaGFuZGxlU3VibWl0ID0gYXN5bmMgKCkgPT4ge1xuXHRcdGlmICghcmVjb3JkSWQpIHJldHVybjtcblx0XHRjb25zdCB0cmltbWVkID0gbm90ZS50cmltKCk7XG5cdFx0aWYgKCF0cmltbWVkKSB7XG5cdFx0XHRhZGROb3RpY2UoeyBtZXNzYWdlOiAncHJvZHVjdC1hY3Rpdml0eS1ub3RlLWVtcHR5JywgdHlwZTogJ2Vycm9yJyB9KTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0c2V0U2F2aW5nKHRydWUpO1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuXHRcdFx0Zm9ybURhdGEuYXBwZW5kKCdub3RlJywgdHJpbW1lZCk7XG5cdFx0XHRjb25zdCByZXNwb25zZSA9IGF3YWl0IGFwaS5yZWNvcmRBY3Rpb24oe1xuXHRcdFx0XHRyZXNvdXJjZUlkOiByZXNvdXJjZS5pZCxcblx0XHRcdFx0cmVjb3JkSWQsXG5cdFx0XHRcdGFjdGlvbk5hbWUsXG5cdFx0XHRcdG1ldGhvZDogJ3Bvc3QnLFxuXHRcdFx0XHRkYXRhOiBmb3JtRGF0YSxcblx0XHRcdH0pO1xuXHRcdFx0aWYgKHJlc3BvbnNlLmRhdGEubm90aWNlKSBhZGROb3RpY2UocmVzcG9uc2UuZGF0YS5ub3RpY2UpO1xuXHRcdFx0c2V0Tm90ZSgnJyk7XG5cdFx0XHRjb25zdCBleHRyYWN0ZWQgPSBleHRyYWN0UGF5bG9hZChyZXNwb25zZS5kYXRhLnBheWxvYWQpO1xuXHRcdFx0c2V0RW50cmllcyhleHRyYWN0ZWQuZW50cmllcyk7XG5cdFx0XHRzZXRVbmF2YWlsYWJsZShleHRyYWN0ZWQudW5hdmFpbGFibGUpO1xuXHRcdH0gY2F0Y2gge1xuXHRcdFx0YWRkTm90aWNlKHsgbWVzc2FnZTogJ3Byb2R1Y3QtYWN0aXZpdHktbm90ZS1zYXZlLWZhaWxlZCcsIHR5cGU6ICdlcnJvcicgfSk7XG5cdFx0fSBmaW5hbGx5IHtcblx0XHRcdHNldFNhdmluZyhmYWxzZSk7XG5cdFx0fVxuXHR9O1xuXG5cdGlmICghcmVjb3JkSWQpIHJldHVybiBudWxsO1xuXG5cdGNvbnN0IHJlbmRlckVudHJ5VGl0bGUgPSAoZW50cnk6IEFjdGl2aXR5RW50cnkpID0+IHtcblx0XHRpZiAoZW50cnkudHlwZSA9PT0gJ05PVEUnKSByZXR1cm4gdHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1hY3Rpdml0eS1ub3RlLWVudHJ5Jyk7XG5cdFx0Y29uc3QgZmllbGRMYWJlbCA9IGVudHJ5LmZpZWxkID8gdHJhbnNsYXRlUHJvcGVydHkoZW50cnkuZmllbGQsIHJlc291cmNlLmlkKSA6IHRyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtYWN0aXZpdHktZmllbGQtdW5rbm93bicpO1xuXHRcdHJldHVybiB0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWFjdGl2aXR5LWZpZWxkLWNoYW5nZScsIHsgZmllbGQ6IGZpZWxkTGFiZWwgfSk7XG5cdH07XG5cblx0Y29uc3QgcmVuZGVyRW50cnlCb2R5ID0gKGVudHJ5OiBBY3Rpdml0eUVudHJ5KSA9PiB7XG5cdFx0aWYgKGVudHJ5LnR5cGUgPT09ICdOT1RFJykgcmV0dXJuIGVudHJ5Lm5vdGUgPyA8VGV4dD57ZW50cnkubm90ZX08L1RleHQ+IDogbnVsbDtcblxuXHRcdGNvbnN0IGZyb21WYWx1ZSA9IGVudHJ5LmZyb21WYWx1ZSA/PyAnLSc7XG5cdFx0Y29uc3QgdG9WYWx1ZSA9IGVudHJ5LnRvVmFsdWUgPz8gJy0nO1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8Qm94IGRpc3BsYXk9J2ZsZXgnIGFsaWduSXRlbXM9J2NlbnRlcicgc3R5bGU9e3sgZ2FwOiA4LCBmbGV4V3JhcDogJ3dyYXAnIH19PlxuXHRcdFx0XHQ8QmFkZ2Ugb3V0bGluZT57ZnJvbVZhbHVlfTwvQmFkZ2U+XG5cdFx0XHRcdDxCb3ggZGlzcGxheT0nZmxleCcgYWxpZ25JdGVtcz0nY2VudGVyJyBzdHlsZT17eyBjb2xvcjogJyM3MTgwOTYnIH19PlxuXHRcdFx0XHRcdDxJY29uIGljb249J0NoZXZyb25SaWdodCcgc2l6ZT17MTh9IC8+XG5cdFx0XHRcdDwvQm94PlxuXHRcdFx0XHQ8QmFkZ2Ugb3V0bGluZT57dG9WYWx1ZX08L0JhZGdlPlxuXHRcdFx0PC9Cb3g+XG5cdFx0KTtcblx0fTtcblxuXHRyZXR1cm4gKFxuXHRcdDxCb3ggdmFyaWFudD0nd2hpdGUnIHA9J3h4bCcgYm9yZGVyUmFkaXVzPSd4bCcgYm94U2hhZG93PSdzbScgc3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnIH19PlxuXHRcdFx0PEJveCBkaXNwbGF5PSdmbGV4JyBhbGlnbkl0ZW1zPSdjZW50ZXInIGp1c3RpZnlDb250ZW50PSdzcGFjZS1iZXR3ZWVuJyBtYj0neGwnPlxuXHRcdFx0XHQ8VGV4dCBmb250U2l6ZT0neGwnIGZvbnRXZWlnaHQ9J2JvbGQnPlxuXHRcdFx0XHRcdHt0aXRsZX1cblx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0PC9Cb3g+XG5cblx0XHRcdDxCb3ggc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywgZ2FwOiAyMCB9fT5cblx0XHRcdFx0e3VuYXZhaWxhYmxlID8gKFxuXHRcdFx0XHRcdDxCb3ggc3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkICNGRUNBQ0EnLCBiYWNrZ3JvdW5kOiAnI0ZFRjJGMicsIHBhZGRpbmc6IDEyLCBib3JkZXJSYWRpdXM6IDEyIH19PlxuXHRcdFx0XHRcdFx0PFRleHQ+e3RyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtYWN0aXZpdHktdW5hdmFpbGFibGUnKX08L1RleHQ+XG5cdFx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdCkgOiBudWxsfVxuXHRcdFx0XHQ8Qm94PlxuXHRcdFx0XHRcdDxMYWJlbCBodG1sRm9yPSdwcm9kdWN0LWFjdGl2aXR5LW5vdGUnPnt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWFjdGl2aXR5LW5vdGUtbGFiZWwnKX08L0xhYmVsPlxuXHRcdFx0XHRcdDx0ZXh0YXJlYVxuXHRcdFx0XHRcdFx0aWQ9J3Byb2R1Y3QtYWN0aXZpdHktbm90ZSdcblx0XHRcdFx0XHRcdG5hbWU9J3Byb2R1Y3RBY3Rpdml0eU5vdGUnXG5cdFx0XHRcdFx0XHR2YWx1ZT17bm90ZX1cblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldE5vdGUoZXZlbnQudGFyZ2V0LnZhbHVlKX1cblx0XHRcdFx0XHRcdHBsYWNlaG9sZGVyPXt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWFjdGl2aXR5LW5vdGUtcGxhY2Vob2xkZXInKX1cblx0XHRcdFx0XHRcdHJvd3M9ezN9XG5cdFx0XHRcdFx0XHRzdHlsZT17e1xuXHRcdFx0XHRcdFx0XHR3aWR0aDogJzEwMCUnLFxuXHRcdFx0XHRcdFx0XHRyZXNpemU6ICd2ZXJ0aWNhbCcsXG5cdFx0XHRcdFx0XHRcdHBhZGRpbmc6ICcxMnB4IDE0cHgnLFxuXHRcdFx0XHRcdFx0XHRib3JkZXJSYWRpdXM6IDgsXG5cdFx0XHRcdFx0XHRcdGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJyxcblx0XHRcdFx0XHRcdFx0Zm9udFNpemU6IDE0LFxuXHRcdFx0XHRcdFx0XHRtYXJnaW5Ub3A6IDEyLFxuXHRcdFx0XHRcdFx0fX1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0PEJveD5cblx0XHRcdFx0XHQ8QnV0dG9uXG5cdFx0XHRcdFx0XHRzdHlsZT17eyBib3JkZXJDb2xvcjogJ3doaXRlJywgYmFja2dyb3VuZDogJyNmYWNjMTUnLCBjb2xvcjogJ2JsYWNrJyB9fVxuXHRcdFx0XHRcdFx0dmFyaWFudD0nY29udGFpbmVkJ1xuXHRcdFx0XHRcdFx0Y29sb3I9J3ByaW1hcnknXG5cdFx0XHRcdFx0XHRvbkNsaWNrPXtoYW5kbGVTdWJtaXR9XG5cdFx0XHRcdFx0XHRkaXNhYmxlZD17c2F2aW5nfVxuXHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdHtzYXZpbmcgPyB0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWFjdGl2aXR5LW5vdGUtc2F2aW5nJykgOiB0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWFjdGl2aXR5LW5vdGUtc3VibWl0Jyl9XG5cdFx0XHRcdFx0PC9CdXR0b24+XG5cdFx0XHRcdDwvQm94PlxuXG5cdFx0XHRcdDxCb3g+XG5cdFx0XHRcdFx0PFRleHQgZm9udFNpemU9J2xnJyBmb250V2VpZ2h0PSdib2xkJyBtYj0nbWQnPlxuXHRcdFx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtYWN0aXZpdHktdGltZWxpbmUnKX1cblx0XHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHRcdFx0e2xvYWRpbmcgPyAoXG5cdFx0XHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJz57dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1hY3Rpdml0eS1sb2FkLXByb2dyZXNzJyl9PC9UZXh0PlxuXHRcdFx0XHRcdCkgOiBlbnRyaWVzLmxlbmd0aCA9PT0gMCA/IChcblx0XHRcdFx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnPnt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWFjdGl2aXR5LXRpbWVsaW5lLWVtcHR5Jyl9PC9UZXh0PlxuXHRcdFx0XHRcdCkgOiAoXG5cdFx0XHRcdFx0XHQ8Qm94IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGdhcDogMTYgfX0+XG5cdFx0XHRcdFx0XHRcdHtlbnRyaWVzLm1hcCgoZW50cnkpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBhZG1pbkxhYmVsID0gZW50cnkuYWRtaW5FbWFpbCA/PyB0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWFjdGl2aXR5LXVua25vd24tYWRtaW4nKTtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCB0aW1lc3RhbXAgPSBmb3JtYXRUaW1lc3RhbXAoZW50cnkuY3JlYXRlZEF0KTtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRcdFx0XHRcdFx0PEJveFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRrZXk9e2VudHJ5LmlkfVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRzdHlsZT17e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRib3JkZXJSYWRpdXM6IDEyLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHBhZGRpbmc6IDE2LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJhY2tncm91bmQ6ICcjRjhGQUZDJyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0fX1cblx0XHRcdFx0XHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0PEJveCBkaXNwbGF5PSdmbGV4JyBhbGlnbkl0ZW1zPSdjZW50ZXInIGp1c3RpZnlDb250ZW50PSdzcGFjZS1iZXR3ZWVuJyBtYj0nc20nPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxUZXh0IGZvbnRXZWlnaHQ9JzYwMCc+e3JlbmRlckVudHJ5VGl0bGUoZW50cnkpfTwvVGV4dD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJyBmb250U2l6ZT0nc20nPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0e3RpbWVzdGFtcH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdDwvQm94PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHR7cmVuZGVyRW50cnlCb2R5KGVudHJ5KX1cblx0XHRcdFx0XHRcdFx0XHRcdFx0PFRleHQgY29sb3I9J2dyZXk2MCcgZm9udFNpemU9J3NtJyBtdD0nc20nPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWFjdGl2aXR5LWFkbWluLWxhYmVsJyl9OiB7YWRtaW5MYWJlbH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0XHRcdFx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0fSl9XG5cdFx0XHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0XHQpfVxuXHRcdFx0XHQ8L0JveD5cblx0XHRcdDwvQm94PlxuXHRcdDwvQm94PlxuXHQpO1xufVxuIiwiaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VNZW1vLCB1c2VTdGF0ZSwgdHlwZSBNb3VzZUV2ZW50IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQXBpQ2xpZW50LCB0eXBlIEFjdGlvblByb3BzLCBPcmlnaW5hbFNob3csIHVzZU5vdGljZSwgdXNlVHJhbnNsYXRpb24gfSBmcm9tICdhZG1pbmpzJztcbmltcG9ydCB7IEJveCwgQnV0dG9uLCBJY29uLCBNb2RhbCwgVGFibGUsIFRhYmxlQm9keSwgVGFibGVDZWxsLCBUYWJsZUhlYWQsIFRhYmxlUm93LCBUZXh0IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSc7XG5pbXBvcnQgeyBERUZBVUxUX0xPQ0FMRSB9IGZyb20gJy4uLy4uL2NvbnN0YW50cy9sb2NhbGVzJztcbmltcG9ydCBQcm9kdWN0QWN0aXZpdHlUaW1lbGluZSBmcm9tICcuL1Byb2R1Y3RBY3Rpdml0eVRpbWVsaW5lJztcblxuY29uc3QgYXBpID0gbmV3IEFwaUNsaWVudCgpO1xuXG50eXBlIFByb2R1Y3RLcGlzUGF5bG9hZCA9IHtcblx0d2lzaGxpc3RDb3VudDogbnVtYmVyO1xuXHRyZWNlbnRseVZpZXdlZENvdW50OiBudW1iZXI7XG5cdGl0ZW1zU29sZDogbnVtYmVyO1xuXHRyZXZlbnVlOiBudW1iZXI7XG5cdHBhaWRPcmRlckNvdW50OiBudW1iZXI7XG5cdGNvbnZlcnNpb25Qcm94eTogbnVtYmVyO1xufTtcblxudHlwZSBQcm9kdWN0UmVsYXRlZFBheWxvYWQgPSB7XG5cdG9yZGVySXRlbXM6IHtcblx0XHRpZDogc3RyaW5nO1xuXHRcdG9yZGVySWQ6IHN0cmluZztcblx0XHRvcmRlclN0YXR1czogc3RyaW5nO1xuXHRcdHF1YW50aXR5OiBudW1iZXI7XG5cdFx0dW5pdFByaWNlOiBudW1iZXI7XG5cdFx0bGluZVRvdGFsOiBudW1iZXI7XG5cdFx0Y3JlYXRlZEF0OiBzdHJpbmcgfCBudWxsO1xuXHR9W107XG5cdHJldmlld3M6IHtcblx0XHRpZDogc3RyaW5nO1xuXHRcdHJhdGluZzogbnVtYmVyO1xuXHRcdGNvbW1lbnQ6IHN0cmluZztcblx0XHRjcmVhdGVkQXQ6IHN0cmluZyB8IG51bGw7XG5cdFx0dXNlcklkOiBzdHJpbmc7XG5cdFx0dXNlck5hbWU6IHN0cmluZztcblx0fVtdO1xufTtcblxuY29uc3QgZm9ybWF0TW9uZXkgPSAodmFsdWU6IG51bWJlciwgY3VycmVuY3kgPSAnVUFIJykgPT4ge1xuXHRjb25zdCBzYWZlVmFsdWUgPSBOdW1iZXIuaXNGaW5pdGUodmFsdWUpID8gdmFsdWUgOiAwO1xuXHR0cnkge1xuXHRcdHJldHVybiBuZXcgSW50bC5OdW1iZXJGb3JtYXQodW5kZWZpbmVkLCB7XG5cdFx0XHRzdHlsZTogJ2N1cnJlbmN5Jyxcblx0XHRcdGN1cnJlbmN5LFxuXHRcdFx0bWluaW11bUZyYWN0aW9uRGlnaXRzOiAyLFxuXHRcdFx0bWF4aW11bUZyYWN0aW9uRGlnaXRzOiAyLFxuXHRcdH0pLmZvcm1hdChzYWZlVmFsdWUpO1xuXHR9IGNhdGNoIHtcblx0XHRyZXR1cm4gc2FmZVZhbHVlLnRvRml4ZWQoMik7XG5cdH1cbn07XG5cbmNvbnN0IGZvcm1hdERhdGUgPSAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+IHtcblx0aWYgKCF2YWx1ZSkgcmV0dXJuICctJztcblx0Y29uc3QgcGFyc2VkID0gRGF0ZS5wYXJzZSh2YWx1ZSk7XG5cdHJldHVybiBOdW1iZXIuaXNOYU4ocGFyc2VkKSA/IHZhbHVlIDogbmV3IERhdGUocGFyc2VkKS50b0xvY2FsZVN0cmluZygpO1xufTtcblxuY29uc3Qgbm9ybWFsaXplTnVtYmVyUGFyYW0gPSAodmFsdWU6IHVua25vd24pID0+IHtcblx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHJldHVybiBOdW1iZXIuaXNGaW5pdGUodmFsdWUpID8gdmFsdWUgOiAwO1xuXHRpZiAodHlwZW9mIHZhbHVlID09PSAnYmlnaW50JykgcmV0dXJuIE51bWJlcih2YWx1ZSk7XG5cdGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmICd0b051bWJlcicgaW4gdmFsdWUgJiYgdHlwZW9mICh2YWx1ZSBhcyBhbnkpLnRvTnVtYmVyID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0Y29uc3QgbnVtZXJpYyA9ICh2YWx1ZSBhcyBhbnkpLnRvTnVtYmVyKCk7XG5cdFx0cmV0dXJuIE51bWJlci5pc0Zpbml0ZShudW1lcmljKSA/IG51bWVyaWMgOiAwO1xuXHR9XG5cdGNvbnN0IG51bWVyaWMgPSBOdW1iZXIodmFsdWUpO1xuXHRyZXR1cm4gTnVtYmVyLmlzRmluaXRlKG51bWVyaWMpID8gbnVtZXJpYyA6IDA7XG59O1xuXG5jb25zdCBnZXRSb290UGF0aCA9ICgpID0+IHtcblx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSByZXR1cm4gJyc7XG5cdGNvbnN0IHBhdGggPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgPz8gJyc7XG5cdGNvbnN0IHBhcnRzID0gcGF0aC5zcGxpdCgnL3Jlc291cmNlcycpO1xuXHRyZXR1cm4gcGFydHNbMF0gPz8gJyc7XG59O1xuXG5jb25zdCBidWlsZFJlY29yZFNob3dIcmVmID0gKHJlc291cmNlSWQ6IHN0cmluZywgcmVjb3JkSWQ6IHN0cmluZykgPT5cblx0YCR7Z2V0Um9vdFBhdGgoKX0vcmVzb3VyY2VzLyR7cmVzb3VyY2VJZH0vcmVjb3Jkcy8ke3JlY29yZElkfS9zaG93YDtcblxuY29uc3QgcmVzb2x2ZVN0b3JlZnJvbnRMb2NhbGUgPSAoYWRtaW5Mb2NhbGU/OiBzdHJpbmcpID0+IHtcblx0Y29uc3Qgbm9ybWFsaXplZCA9IGFkbWluTG9jYWxlPy5zcGxpdCgnLScpWzBdO1xuXHRpZiAobm9ybWFsaXplZCA9PT0gJ3VhJykgcmV0dXJuICd1ayc7XG5cdGlmIChub3JtYWxpemVkID09PSAnZW4nKSByZXR1cm4gJ2VuJztcblx0cmV0dXJuIERFRkFVTFRfTE9DQUxFO1xufTtcblxuY29uc3QgYnVpbGRQcmV2aWV3UGF0aCA9IChsb2NhbGU6IHN0cmluZywgZnVsbFNsdWc6IHN0cmluZykgPT4ge1xuXHRjb25zdCBiYXNlUGF0aCA9IGAvcHJvZHVjdHMvJHtmdWxsU2x1Z31gO1xuXHRyZXR1cm4gbG9jYWxlID09PSBERUZBVUxUX0xPQ0FMRSA/IGJhc2VQYXRoIDogYC8ke2xvY2FsZX0ke2Jhc2VQYXRofWA7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBQcm9kdWN0U2hvdyhwcm9wczogQWN0aW9uUHJvcHMpIHtcblx0Y29uc3QgeyByZWNvcmQsIHJlc291cmNlLCBhY3Rpb24gfSA9IHByb3BzO1xuXHRjb25zdCB7IHRyYW5zbGF0ZUFjdGlvbiwgdHJhbnNsYXRlTWVzc2FnZSwgaTE4biB9ID0gdXNlVHJhbnNsYXRpb24oKTtcblx0Y29uc3QgYWRkTm90aWNlID0gdXNlTm90aWNlKCk7XG5cdGNvbnN0IHJlY29yZElkID0gcmVjb3JkPy5pZDtcblx0Y29uc3QgbmFtZSA9IFN0cmluZyhyZWNvcmQ/LnBhcmFtcz8ubmFtZSA/PyAnJyk7XG5cdGNvbnN0IGltYWdlVXJsID0gKHJlY29yZD8ucGFyYW1zPy5pbWFnZVVybCBhcyBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkKSA/PyBudWxsO1xuXHRjb25zdCBzdGF0dXMgPSBTdHJpbmcocmVjb3JkPy5wYXJhbXM/LnN0YXR1cyA/PyAnJyk7XG5cdGNvbnN0IGZ1bGxTbHVnID0gU3RyaW5nKHJlY29yZD8ucGFyYW1zPy5mdWxsU2x1ZyA/PyAnJykudHJpbSgpO1xuXHRjb25zdCBzdG9yZWZyb250TG9jYWxlID0gcmVzb2x2ZVN0b3JlZnJvbnRMb2NhbGUoaTE4bj8ubGFuZ3VhZ2UpO1xuXHRjb25zdCBwcmV2aWV3UGF0aCA9IGZ1bGxTbHVnID8gYnVpbGRQcmV2aWV3UGF0aChzdG9yZWZyb250TG9jYWxlLCBmdWxsU2x1ZykgOiAnJztcblx0Y29uc3QgcHJldmlld0Jhc2VVcmwgPVxuXHRcdHR5cGVvZiBhY3Rpb24/LmN1c3RvbT8ucHJldmlld0Jhc2VVcmwgPT09ICdzdHJpbmcnID8gYWN0aW9uLmN1c3RvbS5wcmV2aWV3QmFzZVVybC50cmltKCkgOiAnJztcblx0Y29uc3QgZmFsbGJhY2tCYXNlVXJsID0gdHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcgPyAnJyA6IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW47XG5cdGNvbnN0IHJlc29sdmVkQmFzZVVybCA9IHByZXZpZXdCYXNlVXJsIHx8IGZhbGxiYWNrQmFzZVVybDtcblx0Y29uc3QgcHJldmlld1VybCA9XG5cdFx0IXByZXZpZXdQYXRoIHx8ICFyZXNvbHZlZEJhc2VVcmwgPyAnJyA6IG5ldyBVUkwocHJldmlld1BhdGgsIHJlc29sdmVkQmFzZVVybCkudG9TdHJpbmcoKTtcblx0Y29uc3QgW2lzT3Blbiwgc2V0SXNPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKTtcblx0Y29uc3QgW3BheWxvYWQsIHNldFBheWxvYWRdID0gdXNlU3RhdGU8UHJvZHVjdEtwaXNQYXlsb2FkIHwgbnVsbD4obnVsbCk7XG5cdGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcblx0Y29uc3QgW3JlbGF0ZWQsIHNldFJlbGF0ZWRdID0gdXNlU3RhdGU8UHJvZHVjdFJlbGF0ZWRQYXlsb2FkIHwgbnVsbD4obnVsbCk7XG5cdGNvbnN0IFtyZWxhdGVkTG9hZGluZywgc2V0UmVsYXRlZExvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuXHRjb25zdCBzYW5pdGl6ZWRSZWNvcmQgPSB1c2VNZW1vKCgpID0+IHtcblx0XHRpZiAoIXJlY29yZCkgcmV0dXJuIHJlY29yZDtcblx0XHRjb25zdCBwYXJhbXMgPSB7IC4uLnJlY29yZC5wYXJhbXMgfTtcblx0XHRjb25zdCBiYXNlUHJpY2UgPSBub3JtYWxpemVOdW1iZXJQYXJhbShwYXJhbXMuYmFzZVByaWNlKTtcblx0XHRjb25zdCBkaXNjb3VudFJhdyA9IHBhcmFtcy5kaXNjb3VudFByaWNlO1xuXHRcdGNvbnN0IG5vcm1hbGl6ZWREaXNjb3VudCA9IG5vcm1hbGl6ZU51bWJlclBhcmFtKGRpc2NvdW50UmF3KTtcblx0XHRjb25zdCBudW1lcmljS2V5cyA9IFsnc3RvY2snLCAnYXZlcmFnZVJhdGluZycsICdyZXZpZXdDb3VudCddO1xuXHRcdHBhcmFtcy5iYXNlUHJpY2UgPSBiYXNlUHJpY2U7XG5cdFx0cGFyYW1zLmRpc2NvdW50UHJpY2UgPSBkaXNjb3VudFJhdyA9PSBudWxsID8gYmFzZVByaWNlIDogbm9ybWFsaXplZERpc2NvdW50O1xuXHRcdG51bWVyaWNLZXlzLmZvckVhY2goKGtleSkgPT4ge1xuXHRcdFx0cGFyYW1zW2tleV0gPSBub3JtYWxpemVOdW1iZXJQYXJhbShwYXJhbXNba2V5XSk7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIHsgLi4ucmVjb3JkLCBwYXJhbXMgfTtcblx0fSwgW3JlY29yZF0pO1xuXG5cdGNvbnN0IG9wZW5JbWFnZSA9IChlPzogTW91c2VFdmVudCkgPT4ge1xuXHRcdGlmIChlKSBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdGlmICghaW1hZ2VVcmwpIHJldHVybjtcblx0XHRzZXRJc09wZW4odHJ1ZSk7XG5cdH07XG5cblx0Y29uc3Qgb3BlblByZXZpZXcgPSAoKSA9PiB7XG5cdFx0aWYgKCFwcmV2aWV3VXJsKSB7XG5cdFx0XHRhZGROb3RpY2UoeyBtZXNzYWdlOiAncHJvZHVjdC1wcmV2aWV3LW1pc3Npbmctc2x1ZycsIHR5cGU6ICdlcnJvcicgfSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdHdpbmRvdy5vcGVuKHByZXZpZXdVcmwsICdfYmxhbmsnLCAnbm9vcGVuZXIsbm9yZWZlcnJlcicpO1xuXHR9O1xuXG5cdHVzZUVmZmVjdCgoKSA9PiB7XG5cdFx0aWYgKCFyZWNvcmRJZCkgcmV0dXJuO1xuXHRcdGxldCBpc0FjdGl2ZSA9IHRydWU7XG5cdFx0c2V0TG9hZGluZyh0cnVlKTtcblx0XHRhcGkucmVjb3JkQWN0aW9uKHtcblx0XHRcdHJlc291cmNlSWQ6IHJlc291cmNlLmlkLFxuXHRcdFx0cmVjb3JkSWQsXG5cdFx0XHRhY3Rpb25OYW1lOiAncHJvZHVjdEtwaXMnLFxuXHRcdFx0bWV0aG9kOiAnZ2V0Jyxcblx0XHR9KVxuXHRcdFx0LnRoZW4oKHJlc3BvbnNlKSA9PiB7XG5cdFx0XHRcdGlmICghaXNBY3RpdmUpIHJldHVybjtcblx0XHRcdFx0c2V0UGF5bG9hZCgocmVzcG9uc2UuZGF0YS5wYXlsb2FkID8/IG51bGwpIGFzIFByb2R1Y3RLcGlzUGF5bG9hZCB8IG51bGwpO1xuXHRcdFx0fSlcblx0XHRcdC5maW5hbGx5KCgpID0+IHtcblx0XHRcdFx0aWYgKCFpc0FjdGl2ZSkgcmV0dXJuO1xuXHRcdFx0XHRzZXRMb2FkaW5nKGZhbHNlKTtcblx0XHRcdH0pO1xuXHRcdHJldHVybiAoKSA9PiB7XG5cdFx0XHRpc0FjdGl2ZSA9IGZhbHNlO1xuXHRcdH07XG5cdH0sIFtyZWNvcmRJZCwgcmVzb3VyY2UuaWRdKTtcblxuXHR1c2VFZmZlY3QoKCkgPT4ge1xuXHRcdGlmICghcmVjb3JkSWQpIHJldHVybjtcblx0XHRsZXQgaXNBY3RpdmUgPSB0cnVlO1xuXHRcdHNldFJlbGF0ZWRMb2FkaW5nKHRydWUpO1xuXHRcdGFwaS5yZWNvcmRBY3Rpb24oe1xuXHRcdFx0cmVzb3VyY2VJZDogcmVzb3VyY2UuaWQsXG5cdFx0XHRyZWNvcmRJZCxcblx0XHRcdGFjdGlvbk5hbWU6ICdwcm9kdWN0UmVsYXRlZERhdGEnLFxuXHRcdFx0bWV0aG9kOiAnZ2V0Jyxcblx0XHR9KVxuXHRcdFx0LnRoZW4oKHJlc3BvbnNlKSA9PiB7XG5cdFx0XHRcdGlmICghaXNBY3RpdmUpIHJldHVybjtcblx0XHRcdFx0c2V0UmVsYXRlZCgocmVzcG9uc2UuZGF0YS5wYXlsb2FkID8/IG51bGwpIGFzIFByb2R1Y3RSZWxhdGVkUGF5bG9hZCB8IG51bGwpO1xuXHRcdFx0fSlcblx0XHRcdC5maW5hbGx5KCgpID0+IHtcblx0XHRcdFx0aWYgKCFpc0FjdGl2ZSkgcmV0dXJuO1xuXHRcdFx0XHRzZXRSZWxhdGVkTG9hZGluZyhmYWxzZSk7XG5cdFx0XHR9KTtcblx0XHRyZXR1cm4gKCkgPT4ge1xuXHRcdFx0aXNBY3RpdmUgPSBmYWxzZTtcblx0XHR9O1xuXHR9LCBbcmVjb3JkSWQsIHJlc291cmNlLmlkXSk7XG5cblx0Y29uc3QgY29udmVyc2lvblRleHQgPSB1c2VNZW1vKCgpID0+IHtcblx0XHRpZiAoIXBheWxvYWQgfHwgcGF5bG9hZC5yZWNlbnRseVZpZXdlZENvdW50IDw9IDAgfHwgIU51bWJlci5pc0Zpbml0ZShwYXlsb2FkLmNvbnZlcnNpb25Qcm94eSkpIHtcblx0XHRcdHJldHVybiAnMC4wMCUnO1xuXHRcdH1cblx0XHRyZXR1cm4gYCR7KHBheWxvYWQuY29udmVyc2lvblByb3h5ICogMTAwKS50b0ZpeGVkKDIpfSVgO1xuXHR9LCBbcGF5bG9hZF0pO1xuXG5cdHJldHVybiAoXG5cdFx0PEJveD5cblx0XHRcdHtpc09wZW4gJiYgaW1hZ2VVcmwgPyAoXG5cdFx0XHRcdDxNb2RhbFxuXHRcdFx0XHRcdG9uQ2xvc2U9eygpID0+IHNldElzT3BlbihmYWxzZSl9XG5cdFx0XHRcdFx0b25PdmVybGF5Q2xpY2s9eygpID0+IHNldElzT3BlbihmYWxzZSl9XG5cdFx0XHRcdFx0c3R5bGU9e3tcblx0XHRcdFx0XHRcdHdpZHRoOiAnOTJ2dycsXG5cdFx0XHRcdFx0XHRtYXhXaWR0aDogOTgwLFxuXHRcdFx0XHRcdFx0cGFkZGluZzogMjQsXG5cdFx0XHRcdFx0XHRwYWRkaW5nVG9wOiA0OCxcblx0XHRcdFx0XHR9fVxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0PGltZ1xuXHRcdFx0XHRcdFx0c3JjPXtpbWFnZVVybH1cblx0XHRcdFx0XHRcdGFsdD17dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1pbWFnZS1tb2RhbC1hbHQnKX1cblx0XHRcdFx0XHRcdHN0eWxlPXt7XG5cdFx0XHRcdFx0XHRcdHdpZHRoOiAnMTAwJScsXG5cdFx0XHRcdFx0XHRcdGhlaWdodDogJ2F1dG8nLFxuXHRcdFx0XHRcdFx0XHRtYXhIZWlnaHQ6ICc3OHZoJyxcblx0XHRcdFx0XHRcdFx0b2JqZWN0Rml0OiAnY29udGFpbicsXG5cdFx0XHRcdFx0XHRcdGJvcmRlclJhZGl1czogMTIsXG5cdFx0XHRcdFx0XHRcdGJhY2tncm91bmQ6ICcjRjhGQUZDJyxcblx0XHRcdFx0XHRcdFx0ZGlzcGxheTogJ2Jsb2NrJyxcblx0XHRcdFx0XHRcdH19XG5cdFx0XHRcdFx0Lz5cblx0XHRcdFx0PC9Nb2RhbD5cblx0XHRcdCkgOiBudWxsfVxuXG5cdFx0XHQ8Qm94XG5cdFx0XHRcdHZhcmlhbnQ9J3doaXRlJ1xuXHRcdFx0XHRwPSd4eGwnXG5cdFx0XHRcdGJvcmRlclJhZGl1cz0neGwnXG5cdFx0XHRcdGJveFNoYWRvdz0nc20nXG5cdFx0XHRcdG1iPSd4bCdcblx0XHRcdFx0c3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnLCBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6IDE2IH19XG5cdFx0XHQ+XG5cdFx0XHRcdDxCb3hcblx0XHRcdFx0XHRzdHlsZT17e1xuXHRcdFx0XHRcdFx0d2lkdGg6IDE2MCxcblx0XHRcdFx0XHRcdGhlaWdodDogMTYwLFxuXHRcdFx0XHRcdFx0Ym9yZGVyUmFkaXVzOiAxOCxcblx0XHRcdFx0XHRcdGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJyxcblx0XHRcdFx0XHRcdGJhY2tncm91bmQ6ICcjRjhGQUZDJyxcblx0XHRcdFx0XHRcdG92ZXJmbG93OiAnaGlkZGVuJyxcblx0XHRcdFx0XHRcdGZsZXhTaHJpbms6IDAsXG5cdFx0XHRcdFx0fX1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdHtpbWFnZVVybCA/IChcblx0XHRcdFx0XHRcdDxidXR0b25cblx0XHRcdFx0XHRcdFx0dHlwZT0nYnV0dG9uJ1xuXHRcdFx0XHRcdFx0XHRvbkNsaWNrPXtvcGVuSW1hZ2V9XG5cdFx0XHRcdFx0XHRcdHN0eWxlPXt7XG5cdFx0XHRcdFx0XHRcdFx0YWxsOiAndW5zZXQnLFxuXHRcdFx0XHRcdFx0XHRcdGN1cnNvcjogJ3BvaW50ZXInLFxuXHRcdFx0XHRcdFx0XHRcdGRpc3BsYXk6ICdibG9jaycsXG5cdFx0XHRcdFx0XHRcdFx0d2lkdGg6ICcxMDAlJyxcblx0XHRcdFx0XHRcdFx0XHRoZWlnaHQ6ICcxMDAlJyxcblx0XHRcdFx0XHRcdFx0fX1cblx0XHRcdFx0XHRcdFx0YXJpYS1sYWJlbD17dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1pbWFnZS1tb2RhbC1vcGVuJyl9XG5cdFx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHRcdDxpbWdcblx0XHRcdFx0XHRcdFx0XHRzcmM9e2ltYWdlVXJsfVxuXHRcdFx0XHRcdFx0XHRcdGFsdD0nJ1xuXHRcdFx0XHRcdFx0XHRcdHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIGhlaWdodDogJzEwMCUnLCBvYmplY3RGaXQ6ICdjb3ZlcicsIGRpc3BsYXk6ICdibG9jaycgfX1cblx0XHRcdFx0XHRcdFx0XHRsb2FkaW5nPSdsYXp5J1xuXHRcdFx0XHRcdFx0XHQvPlxuXHRcdFx0XHRcdFx0PC9idXR0b24+XG5cdFx0XHRcdFx0KSA6IG51bGx9XG5cdFx0XHRcdDwvQm94PlxuXHRcdFx0XHQ8Qm94IHN0eWxlPXt7IG1pbldpZHRoOiAwLCBmbGV4OiAxLCBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6IDE2IH19PlxuXHRcdFx0XHRcdDxCb3ggc3R5bGU9e3sgbWluV2lkdGg6IDAsIGZsZXg6IDEgfX0+XG5cdFx0XHRcdFx0XHQ8VGV4dFxuXHRcdFx0XHRcdFx0XHRmb250V2VpZ2h0PSdib2xkJ1xuXHRcdFx0XHRcdFx0XHRmb250U2l6ZT0neGwnXG5cdFx0XHRcdFx0XHRcdHN0eWxlPXt7IHdoaXRlU3BhY2U6ICdub3dyYXAnLCBvdmVyZmxvdzogJ2hpZGRlbicsIHRleHRPdmVyZmxvdzogJ2VsbGlwc2lzJyB9fVxuXHRcdFx0XHRcdFx0PlxuXHRcdFx0XHRcdFx0XHR7bmFtZSB8fCAnUHJvZHVjdCd9XG5cdFx0XHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHRcdFx0XHR7c3RhdHVzID8gPFRleHQgY29sb3I9J2dyZXk2MCc+e3N0YXR1c308L1RleHQ+IDogbnVsbH1cblx0XHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0XHQ8QnV0dG9uXG5cdFx0XHRcdFx0XHR2YXJpYW50PSdvdXRsaW5lZCdcblx0XHRcdFx0XHRcdGNvbG9yPSdwcmltYXJ5J1xuXHRcdFx0XHRcdFx0b25DbGljaz17b3BlblByZXZpZXd9XG5cdFx0XHRcdFx0XHRkaXNhYmxlZD17IXByZXZpZXdVcmx9XG5cdFx0XHRcdFx0XHRzdHlsZT17eyB3aGl0ZVNwYWNlOiAnbm93cmFwJyB9fVxuXHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdDxJY29uIGljb249J0V4dGVybmFsTGluaycgLz5cblx0XHRcdFx0XHRcdHt0cmFuc2xhdGVBY3Rpb24oJ3ByZXZpZXdQcm9kdWN0JywgcmVzb3VyY2UuaWQpfVxuXHRcdFx0XHRcdDwvQnV0dG9uPlxuXHRcdFx0XHQ8L0JveD5cblx0XHRcdDwvQm94PlxuXG5cdFx0XHQ8Qm94XG5cdFx0XHRcdHZhcmlhbnQ9J3doaXRlJ1xuXHRcdFx0XHRwPSd4eGwnXG5cdFx0XHRcdGJvcmRlclJhZGl1cz0neGwnXG5cdFx0XHRcdGJveFNoYWRvdz0nc20nXG5cdFx0XHRcdG1iPSd4bCdcblx0XHRcdFx0Y2xhc3NOYW1lPSdhZG1pbi1jYXJkLS1rcGlzJ1xuXHRcdFx0XHRzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQgI0UyRThGMCcgfX1cblx0XHRcdD5cblx0XHRcdFx0PFRleHQgZm9udFdlaWdodD0nYm9sZCcgbWI9J2xnJz5cblx0XHRcdFx0XHR7dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1rcGlzJyl9XG5cdFx0XHRcdDwvVGV4dD5cblx0XHRcdFx0e2xvYWRpbmcgfHwgIXBheWxvYWQgPyAoXG5cdFx0XHRcdFx0PFRleHQgY29sb3I9J2dyZXk2MCc+e3RyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3Qta3Bpcy1sb2FkaW5nJyl9PC9UZXh0PlxuXHRcdFx0XHQpIDogKFxuXHRcdFx0XHRcdDxCb3hcblx0XHRcdFx0XHRcdHN0eWxlPXt7XG5cdFx0XHRcdFx0XHRcdGRpc3BsYXk6ICdncmlkJyxcblx0XHRcdFx0XHRcdFx0Z3JpZFRlbXBsYXRlQ29sdW1uczogJ3JlcGVhdChhdXRvLWZpdCwgbWlubWF4KDIyMHB4LCAxZnIpKScsXG5cdFx0XHRcdFx0XHRcdGdhcDogMTYsXG5cdFx0XHRcdFx0XHR9fVxuXHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdDxCb3ggc3R5bGU9e3sgcGFkZGluZzogMTQsIGJvcmRlclJhZGl1czogMTIsIGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJyB9fT5cblx0XHRcdFx0XHRcdFx0PFRleHQgY29sb3I9J2dyZXk2MCc+e3RyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3Qta3Bpcy13aXNobGlzdCcpfTwvVGV4dD5cblx0XHRcdFx0XHRcdFx0PFRleHQgZm9udFdlaWdodD0nYm9sZCc+e3BheWxvYWQud2lzaGxpc3RDb3VudH08L1RleHQ+XG5cdFx0XHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0XHRcdDxCb3ggc3R5bGU9e3sgcGFkZGluZzogMTQsIGJvcmRlclJhZGl1czogMTIsIGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJyB9fT5cblx0XHRcdFx0XHRcdFx0PFRleHQgY29sb3I9J2dyZXk2MCc+e3RyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3Qta3Bpcy1yZWNlbnRseS12aWV3ZWQnKX08L1RleHQ+XG5cdFx0XHRcdFx0XHRcdDxUZXh0IGZvbnRXZWlnaHQ9J2JvbGQnPntwYXlsb2FkLnJlY2VudGx5Vmlld2VkQ291bnR9PC9UZXh0PlxuXHRcdFx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdFx0XHQ8Qm94IHN0eWxlPXt7IHBhZGRpbmc6IDE0LCBib3JkZXJSYWRpdXM6IDEyLCBib3JkZXI6ICcxcHggc29saWQgI0UyRThGMCcgfX0+XG5cdFx0XHRcdFx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnPnt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWtwaXMtaXRlbXMtc29sZCcpfTwvVGV4dD5cblx0XHRcdFx0XHRcdFx0PFRleHQgZm9udFdlaWdodD0nYm9sZCc+e3BheWxvYWQuaXRlbXNTb2xkfTwvVGV4dD5cblx0XHRcdFx0XHRcdDwvQm94PlxuXHRcdFx0XHRcdFx0PEJveCBzdHlsZT17eyBwYWRkaW5nOiAxNCwgYm9yZGVyUmFkaXVzOiAxMiwgYm9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnIH19PlxuXHRcdFx0XHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJz57dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1rcGlzLXJldmVudWUnKX08L1RleHQ+XG5cdFx0XHRcdFx0XHRcdDxUZXh0IGZvbnRXZWlnaHQ9J2JvbGQnPntmb3JtYXRNb25leShwYXlsb2FkLnJldmVudWUpfTwvVGV4dD5cblx0XHRcdFx0XHRcdDwvQm94PlxuXHRcdFx0XHRcdFx0PEJveCBzdHlsZT17eyBwYWRkaW5nOiAxNCwgYm9yZGVyUmFkaXVzOiAxMiwgYm9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnIH19PlxuXHRcdFx0XHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJz57dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1rcGlzLWNvbnZlcnNpb24tcHJveHknKX08L1RleHQ+XG5cdFx0XHRcdFx0XHRcdDxUZXh0IGZvbnRXZWlnaHQ9J2JvbGQnPntjb252ZXJzaW9uVGV4dH08L1RleHQ+XG5cdFx0XHRcdFx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnIHN0eWxlPXt7IGZvbnRTaXplOiAxMyB9fT5cblx0XHRcdFx0XHRcdFx0XHR7cGF5bG9hZC5wYWlkT3JkZXJDb3VudH0gLyB7cGF5bG9hZC5yZWNlbnRseVZpZXdlZENvdW50IHx8IDB9XG5cdFx0XHRcdFx0XHRcdDwvVGV4dD5cblx0XHRcdFx0XHRcdDwvQm94PlxuXHRcdFx0XHRcdDwvQm94PlxuXHRcdFx0XHQpfVxuXHRcdFx0PC9Cb3g+XG5cblx0XHRcdDxCb3hcblx0XHRcdFx0dmFyaWFudD0nd2hpdGUnXG5cdFx0XHRcdHA9J3h4bCdcblx0XHRcdFx0Ym9yZGVyUmFkaXVzPSd4bCdcblx0XHRcdFx0Ym94U2hhZG93PSdzbSdcblx0XHRcdFx0bWI9J3hsJ1xuXHRcdFx0XHRzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQgI0UyRThGMCcgfX1cblx0XHRcdD5cblx0XHRcdFx0PFRleHQgZm9udFdlaWdodD0nYm9sZCcgbWI9J2xnJz5cblx0XHRcdFx0XHR7dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1yZWxhdGVkJyl9XG5cdFx0XHRcdDwvVGV4dD5cblx0XHRcdFx0e3JlbGF0ZWRMb2FkaW5nIHx8ICFyZWxhdGVkID8gKFxuXHRcdFx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnPnt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LXJlbGF0ZWQtbG9hZGluZycpfTwvVGV4dD5cblx0XHRcdFx0KSA6IChcblx0XHRcdFx0XHQ8Qm94IHN0eWxlPXt7IGRpc3BsYXk6ICdncmlkJywgZ3JpZFRlbXBsYXRlQ29sdW1uczogJzFmcicsIGdhcDogMTggfX0+XG5cdFx0XHRcdFx0XHQ8Qm94PlxuXHRcdFx0XHRcdFx0XHQ8VGV4dCBmb250V2VpZ2h0PSdib2xkJyBtYj0nc20nPlxuXHRcdFx0XHRcdFx0XHRcdHt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LXJlbGF0ZWQtb3JkZXItaXRlbXMnKX1cblx0XHRcdFx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0XHRcdFx0XHR7cmVsYXRlZC5vcmRlckl0ZW1zLmxlbmd0aCA/IChcblx0XHRcdFx0XHRcdFx0XHQ8VGFibGU+XG5cdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVIZWFkPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVSb3c+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlQ2VsbD57dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1yZWxhdGVkLW9yZGVyLWlkJyl9PC9UYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlQ2VsbD57dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1yZWxhdGVkLW9yZGVyLXN0YXR1cycpfTwvVGFibGVDZWxsPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZUNlbGw+e3RyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtcmVsYXRlZC1vcmRlci1xdWFudGl0eScpfTwvVGFibGVDZWxsPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZUNlbGw+e3RyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtcmVsYXRlZC1vcmRlci11bml0LXByaWNlJyl9PC9UYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlQ2VsbD57dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1yZWxhdGVkLW9yZGVyLXRvdGFsJyl9PC9UYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlQ2VsbD57dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1yZWxhdGVkLW9yZGVyLWNyZWF0ZWQnKX08L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0PC9UYWJsZVJvdz5cblx0XHRcdFx0XHRcdFx0XHRcdDwvVGFibGVIZWFkPlxuXHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlQm9keT5cblx0XHRcdFx0XHRcdFx0XHRcdFx0e3JlbGF0ZWQub3JkZXJJdGVtcy5tYXAoKGl0ZW0pID0+IChcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVSb3cga2V5PXtpdGVtLmlkfT5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHtpdGVtLm9yZGVySWQgJiYgaXRlbS5vcmRlcklkICE9PSAnLScgPyAoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PGEgaHJlZj17YnVpbGRSZWNvcmRTaG93SHJlZignT3JkZXInLCBpdGVtLm9yZGVySWQpfSBzdHlsZT17eyBmb250V2VpZ2h0OiA2MDAgfX0+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR7aXRlbS5vcmRlcklkfVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDwvYT5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0KSA6IChcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQnLSdcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0KX1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDwvVGFibGVDZWxsPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlQ2VsbD57aXRlbS5vcmRlclN0YXR1c308L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZUNlbGw+e2l0ZW0ucXVhbnRpdHl9PC9UYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVDZWxsPntmb3JtYXRNb25leShpdGVtLnVuaXRQcmljZSl9PC9UYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVDZWxsPntmb3JtYXRNb25leShpdGVtLmxpbmVUb3RhbCl9PC9UYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVDZWxsPntmb3JtYXREYXRlKGl0ZW0uY3JlYXRlZEF0KX08L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8L1RhYmxlUm93PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQpKX1cblx0XHRcdFx0XHRcdFx0XHRcdDwvVGFibGVCb2R5PlxuXHRcdFx0XHRcdFx0XHRcdDwvVGFibGU+XG5cdFx0XHRcdFx0XHRcdCkgOiAoXG5cdFx0XHRcdFx0XHRcdFx0PFRleHQgY29sb3I9J2dyZXk2MCc+e3RyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtcmVsYXRlZC1lbXB0eScpfTwvVGV4dD5cblx0XHRcdFx0XHRcdFx0KX1cblx0XHRcdFx0XHRcdDwvQm94PlxuXG5cdFx0XHRcdFx0XHQ8Qm94PlxuXHRcdFx0XHRcdFx0XHQ8VGV4dCBmb250V2VpZ2h0PSdib2xkJyBtYj0nc20nPlxuXHRcdFx0XHRcdFx0XHRcdHt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LXJlbGF0ZWQtcmV2aWV3cycpfVxuXHRcdFx0XHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHRcdFx0XHRcdHtyZWxhdGVkLnJldmlld3MubGVuZ3RoID8gKFxuXHRcdFx0XHRcdFx0XHRcdDxUYWJsZT5cblx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZUhlYWQ+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZVJvdz5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVDZWxsPnt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LXJlbGF0ZWQtcmV2aWV3LXVzZXInKX08L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVDZWxsPnt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LXJlbGF0ZWQtcmV2aWV3LXJhdGluZycpfTwvVGFibGVDZWxsPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZUNlbGw+e3RyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtcmVsYXRlZC1yZXZpZXctY29tbWVudCcpfTwvVGFibGVDZWxsPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZUNlbGw+e3RyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtcmVsYXRlZC1yZXZpZXctY3JlYXRlZCcpfTwvVGFibGVDZWxsPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8L1RhYmxlUm93PlxuXHRcdFx0XHRcdFx0XHRcdFx0PC9UYWJsZUhlYWQ+XG5cdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVCb2R5PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHR7cmVsYXRlZC5yZXZpZXdzLm1hcCgocmV2aWV3KSA9PiAoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlUm93IGtleT17cmV2aWV3LmlkfT5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxhIGhyZWY9e2J1aWxkUmVjb3JkU2hvd0hyZWYoJ1VzZXInLCByZXZpZXcudXNlcklkKX0gc3R5bGU9e3sgZm9udFdlaWdodDogNjAwIH19PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHtyZXZpZXcudXNlck5hbWV9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDwvYT5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDwvVGFibGVDZWxsPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlQ2VsbD57cmV2aWV3LnJhdGluZ308L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxUZXh0XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0c3R5bGU9e3tcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdG1heFdpZHRoOiA0MjAsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR3aGl0ZVNwYWNlOiAnbm93cmFwJyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdG92ZXJmbG93OiAnaGlkZGVuJyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHRleHRPdmVyZmxvdzogJ2VsbGlwc2lzJyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0e3Jldmlldy5jb21tZW50fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZUNlbGw+e2Zvcm1hdERhdGUocmV2aWV3LmNyZWF0ZWRBdCl9PC9UYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0PC9UYWJsZVJvdz5cblx0XHRcdFx0XHRcdFx0XHRcdFx0KSl9XG5cdFx0XHRcdFx0XHRcdFx0XHQ8L1RhYmxlQm9keT5cblx0XHRcdFx0XHRcdFx0XHQ8L1RhYmxlPlxuXHRcdFx0XHRcdFx0XHQpIDogKFxuXHRcdFx0XHRcdFx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnPnt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LXJlbGF0ZWQtZW1wdHknKX08L1RleHQ+XG5cdFx0XHRcdFx0XHRcdCl9XG5cdFx0XHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0KX1cblx0XHRcdDwvQm94PlxuXG5cdFx0XHQ8UHJvZHVjdEFjdGl2aXR5VGltZWxpbmVcblx0XHRcdFx0ey4uLnByb3BzfVxuXHRcdFx0XHRhY3Rpb25OYW1lT3ZlcnJpZGU9J2FjdGl2aXR5VGltZWxpbmUnXG5cdFx0XHRcdHRpdGxlT3ZlcnJpZGU9e3RyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtYWN0aXZpdHktdGl0bGUnKX1cblx0XHRcdC8+XG5cblx0XHRcdDxPcmlnaW5hbFNob3cgey4uLnByb3BzfSByZWNvcmQ9e3Nhbml0aXplZFJlY29yZCA/PyByZWNvcmR9IC8+XG5cdFx0PC9Cb3g+XG5cdCk7XG59XG4iLCJpbXBvcnQgeyB1c2VFZmZlY3QsIHVzZU1lbW8sIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBBcGlDbGllbnQsIHR5cGUgQWN0aW9uUHJvcHMsIHVzZU5vdGljZSwgdXNlVHJhbnNsYXRpb24gfSBmcm9tICdhZG1pbmpzJztcbmltcG9ydCB7XG5cdEJveCxcblx0QnV0dG9uLFxuXHRGb3JtR3JvdXAsXG5cdElucHV0LFxuXHRMYWJlbCxcblx0VGFibGUsXG5cdFRhYmxlQm9keSxcblx0VGFibGVDZWxsLFxuXHRUYWJsZUhlYWQsXG5cdFRhYmxlUm93LFxuXHRUZXh0LFxufSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcblxudHlwZSBBdHRyaWJ1dGUgPSB7IGlkOiBzdHJpbmc7IG5hbWU6IHN0cmluZzsgdW5pdD86IHN0cmluZyB8IG51bGwgfTtcbnR5cGUgQXR0cmlidXRlVmFsdWUgPSB7IGF0dHJpYnV0ZUlkOiBzdHJpbmc7IHZhbHVlOiBzdHJpbmcgfTtcbnR5cGUgVmFyaWFudFBheWxvYWQgPSB7XG5cdGlkOiBzdHJpbmc7XG5cdHNrdTogc3RyaW5nO1xuXHRwcmljZTogbnVtYmVyO1xuXHRzdG9jazogbnVtYmVyO1xuXHRvcHRpb25zOiBBdHRyaWJ1dGVWYWx1ZVtdO1xufTtcbnR5cGUgUHJvZHVjdFBheWxvYWQgPSB7XG5cdGJhc2VQcmljZTogbnVtYmVyO1xuXHRjdXJyZW5jeTogc3RyaW5nO1xuXHRwcm9kdWN0Q29kZTogc3RyaW5nIHwgbnVsbDtcbn07XG50eXBlIFZhcmlhbnRNYXRyaXhQYXlsb2FkID0ge1xuXHRwcm9kdWN0OiBQcm9kdWN0UGF5bG9hZCB8IG51bGw7XG5cdGF0dHJpYnV0ZXM6IEF0dHJpYnV0ZVtdO1xuXHRhdHRyaWJ1dGVWYWx1ZXM6IEF0dHJpYnV0ZVZhbHVlW107XG5cdHZhcmlhbnRzOiBWYXJpYW50UGF5bG9hZFtdO1xufTtcblxudHlwZSBBdHRyaWJ1dGVTdGF0ZSA9IEF0dHJpYnV0ZSAmIHtcblx0ZW5hYmxlZDogYm9vbGVhbjtcblx0dmFsdWVUZXh0OiBzdHJpbmc7XG59O1xuXG50eXBlIFZhcmlhbnRSb3cgPSB7XG5cdHNpZ25hdHVyZTogc3RyaW5nO1xuXHRvcHRpb25zOiBBdHRyaWJ1dGVWYWx1ZVtdO1xuXHRza3U6IHN0cmluZztcblx0cHJpY2U6IHN0cmluZztcblx0c3RvY2s6IHN0cmluZztcbn07XG5cbmNvbnN0IGFwaSA9IG5ldyBBcGlDbGllbnQoKTtcblxuY29uc3QgYWN0aW9uQnV0dG9uU3R5bGUgPSB7XG5cdGJvcmRlckNvbG9yOiAnd2hpdGUnLFxuXHRiYWNrZ3JvdW5kOiAnI2ZhY2MxNScsXG5cdGNvbG9yOiAnYmxhY2snLFxufTtcblxuY29uc3QgcGFyc2VWYWx1ZXMgPSAodmFsdWVUZXh0OiBzdHJpbmcpID0+XG5cdEFycmF5LmZyb20oXG5cdFx0bmV3IFNldChcblx0XHRcdHZhbHVlVGV4dFxuXHRcdFx0XHQuc3BsaXQoJywnKVxuXHRcdFx0XHQubWFwKChlbnRyeSkgPT4gZW50cnkudHJpbSgpKVxuXHRcdFx0XHQuZmlsdGVyKEJvb2xlYW4pXG5cdFx0KVxuXHQpO1xuXG5jb25zdCBidWlsZFNpZ25hdHVyZSA9IChvcHRpb25zOiBBdHRyaWJ1dGVWYWx1ZVtdKSA9PlxuXHRvcHRpb25zXG5cdFx0LnNsaWNlKClcblx0XHQuc29ydCgoYSwgYikgPT4gYS5hdHRyaWJ1dGVJZC5sb2NhbGVDb21wYXJlKGIuYXR0cmlidXRlSWQpKVxuXHRcdC5tYXAoKG9wdGlvbikgPT4gYCR7b3B0aW9uLmF0dHJpYnV0ZUlkfToke29wdGlvbi52YWx1ZX1gKVxuXHRcdC5qb2luKCd8Jyk7XG5cbmNvbnN0IHNhbml0aXplU2t1UGFydCA9ICh2YWx1ZTogc3RyaW5nKSA9PlxuXHR2YWx1ZVxuXHRcdC50cmltKClcblx0XHQucmVwbGFjZSgvXFxzKy9nLCAnLScpXG5cdFx0LnJlcGxhY2UoL1teQS1aYS16MC05Xy1dL2csICcnKVxuXHRcdC50b1VwcGVyQ2FzZSgpO1xuXG5jb25zdCBidWlsZFNrdSA9IChiYXNlU2t1OiBzdHJpbmcsIG9wdGlvbnM6IEF0dHJpYnV0ZVZhbHVlW10pID0+IHtcblx0Y29uc3QgYmFzZSA9IHNhbml0aXplU2t1UGFydChiYXNlU2t1IHx8ICdTS1UnKSB8fCAnU0tVJztcblx0Y29uc3Qgc3VmZml4ID0gb3B0aW9uc1xuXHRcdC5tYXAoKG9wdGlvbikgPT4gc2FuaXRpemVTa3VQYXJ0KG9wdGlvbi52YWx1ZSkpXG5cdFx0LmZpbHRlcihCb29sZWFuKVxuXHRcdC5qb2luKCctJyk7XG5cdHJldHVybiBzdWZmaXggPyBgJHtiYXNlfS0ke3N1ZmZpeH1gIDogYmFzZTtcbn07XG5cbmNvbnN0IGJ1aWxkQ29tYmluYXRpb25zID0gKGF0dHJpYnV0ZXM6IEF0dHJpYnV0ZVN0YXRlW10pID0+IHtcblx0Y29uc3Qgc2VsZWN0ZWQgPSBhdHRyaWJ1dGVzLmZpbHRlcigoYXR0cikgPT4gYXR0ci5lbmFibGVkKTtcblx0aWYgKHNlbGVjdGVkLmxlbmd0aCA9PT0gMCkgcmV0dXJuIFtdO1xuXHRsZXQgY29tYm9zOiBBdHRyaWJ1dGVWYWx1ZVtdW10gPSBbW11dO1xuXHRmb3IgKGNvbnN0IGF0dHIgb2Ygc2VsZWN0ZWQpIHtcblx0XHRjb25zdCB2YWx1ZXMgPSBwYXJzZVZhbHVlcyhhdHRyLnZhbHVlVGV4dCk7XG5cdFx0aWYgKHZhbHVlcy5sZW5ndGggPT09IDApIHJldHVybiBbXTtcblx0XHRjb21ib3MgPSBjb21ib3MuZmxhdE1hcCgoY29tYm8pID0+XG5cdFx0XHR2YWx1ZXMubWFwKCh2YWx1ZSkgPT4gWy4uLmNvbWJvLCB7IGF0dHJpYnV0ZUlkOiBhdHRyLmlkLCB2YWx1ZSB9XSlcblx0XHQpO1xuXHR9XG5cdHJldHVybiBjb21ib3M7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBQcm9kdWN0VmFyaWFudE1hdHJpeChwcm9wczogQWN0aW9uUHJvcHMpIHtcblx0Y29uc3QgeyBhY3Rpb24sIHJlY29yZCwgcmVzb3VyY2UgfSA9IHByb3BzO1xuXHRjb25zdCB7IHRyYW5zbGF0ZUFjdGlvbiwgdHJhbnNsYXRlTWVzc2FnZSB9ID0gdXNlVHJhbnNsYXRpb24oKTtcblx0Y29uc3QgYWRkTm90aWNlID0gdXNlTm90aWNlKCk7XG5cdGNvbnN0IGFkZE5vdGljZVJlZiA9IHVzZVJlZihhZGROb3RpY2UpO1xuXHRjb25zdCByZWNvcmRJZCA9XG5cdFx0cmVjb3JkPy5pZCA/PyAocmVjb3JkPy5wYXJhbXM/LmlkICE9IG51bGwgPyBTdHJpbmcocmVjb3JkLnBhcmFtcy5pZCkgOiB1bmRlZmluZWQpO1xuXHRjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZSh0cnVlKTtcblx0Y29uc3QgW3NhdmluZywgc2V0U2F2aW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcblx0Y29uc3QgW2xvYWRFcnJvciwgc2V0TG9hZEVycm9yXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpO1xuXHRjb25zdCBbYXR0cmlidXRlcywgc2V0QXR0cmlidXRlc10gPSB1c2VTdGF0ZTxBdHRyaWJ1dGVTdGF0ZVtdPihbXSk7XG5cdGNvbnN0IFt2YXJpYW50cywgc2V0VmFyaWFudHNdID0gdXNlU3RhdGU8VmFyaWFudFJvd1tdPihbXSk7XG5cdGNvbnN0IFtwcm9kdWN0LCBzZXRQcm9kdWN0XSA9IHVzZVN0YXRlPFByb2R1Y3RQYXlsb2FkIHwgbnVsbD4obnVsbCk7XG5cblx0dXNlRWZmZWN0KCgpID0+IHtcblx0XHRhZGROb3RpY2VSZWYuY3VycmVudCA9IGFkZE5vdGljZTtcblx0fSwgW2FkZE5vdGljZV0pO1xuXG5cdHVzZUVmZmVjdCgoKSA9PiB7XG5cdFx0aWYgKCFyZWNvcmRJZCkge1xuXHRcdFx0c2V0TG9hZEVycm9yKCdwcm9kdWN0LXZhcmlhbnQtbWlzc2luZy1yZWNvcmQnKTtcblx0XHRcdHNldExvYWRpbmcoZmFsc2UpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRsZXQgaXNBY3RpdmUgPSB0cnVlO1xuXHRcdHNldExvYWRpbmcodHJ1ZSk7XG5cdFx0c2V0TG9hZEVycm9yKG51bGwpO1xuXHRcdGFwaS5yZWNvcmRBY3Rpb24oe1xuXHRcdFx0cmVzb3VyY2VJZDogcmVzb3VyY2UuaWQsXG5cdFx0XHRyZWNvcmRJZCxcblx0XHRcdGFjdGlvbk5hbWU6IGFjdGlvbi5uYW1lLFxuXHRcdFx0bWV0aG9kOiAnZ2V0Jyxcblx0XHR9KVxuXHRcdFx0LnRoZW4oKHJlc3BvbnNlKSA9PiB7XG5cdFx0XHRcdGlmICghaXNBY3RpdmUpIHJldHVybjtcblx0XHRcdFx0Y29uc3QgcGF5bG9hZCA9IChyZXNwb25zZS5kYXRhLnBheWxvYWQgPz8gbnVsbCkgYXMgVmFyaWFudE1hdHJpeFBheWxvYWQgfCBudWxsO1xuXHRcdFx0XHRpZiAoIXBheWxvYWQpIHJldHVybjtcblx0XHRcdFx0Y29uc3QgdmFsdWVzQnlBdHRyaWJ1dGUgPSBwYXlsb2FkLmF0dHJpYnV0ZVZhbHVlcy5yZWR1Y2UoKGFjYywgZW50cnkpID0+IHtcblx0XHRcdFx0XHRpZiAoIWFjYy5oYXMoZW50cnkuYXR0cmlidXRlSWQpKSBhY2Muc2V0KGVudHJ5LmF0dHJpYnV0ZUlkLCBbXSk7XG5cdFx0XHRcdFx0YWNjLmdldChlbnRyeS5hdHRyaWJ1dGVJZCkhLnB1c2goZW50cnkudmFsdWUpO1xuXHRcdFx0XHRcdHJldHVybiBhY2M7XG5cdFx0XHRcdH0sIG5ldyBNYXA8c3RyaW5nLCBzdHJpbmdbXT4oKSk7XG5cblx0XHRcdFx0Y29uc3QgbmV4dEF0dHJpYnV0ZXMgPSBwYXlsb2FkLmF0dHJpYnV0ZXMubWFwKChhdHRyKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgdmFsdWVzID0gdmFsdWVzQnlBdHRyaWJ1dGUuZ2V0KGF0dHIuaWQpID8/IFtdO1xuXHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHQuLi5hdHRyLFxuXHRcdFx0XHRcdFx0ZW5hYmxlZDogdmFsdWVzLmxlbmd0aCA+IDAsXG5cdFx0XHRcdFx0XHR2YWx1ZVRleHQ6IHZhbHVlcy5qb2luKCcsICcpLFxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGNvbnN0IG9yZGVyID0gbmV3IE1hcChuZXh0QXR0cmlidXRlcy5tYXAoKGF0dHIsIGlkeCkgPT4gW2F0dHIuaWQsIGlkeF0pKTtcblx0XHRcdFx0Y29uc3Qgc29ydE9wdGlvbnMgPSAob3B0aW9uczogQXR0cmlidXRlVmFsdWVbXSkgPT5cblx0XHRcdFx0XHRvcHRpb25zXG5cdFx0XHRcdFx0XHQuc2xpY2UoKVxuXHRcdFx0XHRcdFx0LnNvcnQoKGEsIGIpID0+IChvcmRlci5nZXQoYS5hdHRyaWJ1dGVJZCkgPz8gMCkgLSAob3JkZXIuZ2V0KGIuYXR0cmlidXRlSWQpID8/IDApKTtcblxuXHRcdFx0XHRjb25zdCBuZXh0VmFyaWFudHMgPSBwYXlsb2FkLnZhcmlhbnRzLm1hcCgodmFyaWFudCkgPT4gKHtcblx0XHRcdFx0XHRzaWduYXR1cmU6IGJ1aWxkU2lnbmF0dXJlKHZhcmlhbnQub3B0aW9ucyksXG5cdFx0XHRcdFx0b3B0aW9uczogc29ydE9wdGlvbnModmFyaWFudC5vcHRpb25zKSxcblx0XHRcdFx0XHRza3U6IHZhcmlhbnQuc2t1LFxuXHRcdFx0XHRcdHByaWNlOiBTdHJpbmcodmFyaWFudC5wcmljZSA/PyAnJyksXG5cdFx0XHRcdFx0c3RvY2s6IFN0cmluZyh2YXJpYW50LnN0b2NrID8/ICcnKSxcblx0XHRcdFx0fSkpO1xuXG5cdFx0XHRcdHNldFByb2R1Y3QocGF5bG9hZC5wcm9kdWN0KTtcblx0XHRcdFx0c2V0QXR0cmlidXRlcyhuZXh0QXR0cmlidXRlcyk7XG5cdFx0XHRcdHNldFZhcmlhbnRzKG5leHRWYXJpYW50cyk7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKCgpID0+IHtcblx0XHRcdFx0aWYgKCFpc0FjdGl2ZSkgcmV0dXJuO1xuXHRcdFx0XHRzZXRMb2FkRXJyb3IoJ3Byb2R1Y3QtdmFyaWFudC1sb2FkLWZhaWxlZCcpO1xuXHRcdFx0XHRhZGROb3RpY2VSZWYuY3VycmVudCh7IG1lc3NhZ2U6ICdwcm9kdWN0LXZhcmlhbnQtbG9hZC1mYWlsZWQnLCB0eXBlOiAnZXJyb3InIH0pO1xuXHRcdFx0fSlcblx0XHRcdC5maW5hbGx5KCgpID0+IHtcblx0XHRcdFx0aWYgKCFpc0FjdGl2ZSkgcmV0dXJuO1xuXHRcdFx0XHRzZXRMb2FkaW5nKGZhbHNlKTtcblx0XHRcdH0pO1xuXHRcdHJldHVybiAoKSA9PiB7XG5cdFx0XHRpc0FjdGl2ZSA9IGZhbHNlO1xuXHRcdH07XG5cdH0sIFthY3Rpb24ubmFtZSwgcmVjb3JkSWQsIHJlc291cmNlLmlkXSk7XG5cblx0Y29uc3QgYXR0cmlidXRlT3JkZXIgPSB1c2VNZW1vKFxuXHRcdCgpID0+IG5ldyBNYXAoYXR0cmlidXRlcy5tYXAoKGF0dHIsIGlkeCkgPT4gW2F0dHIuaWQsIGlkeF0pKSxcblx0XHRbYXR0cmlidXRlc11cblx0KTtcblxuXHRjb25zdCBvcmRlcmVkQXR0cmlidXRlcyA9IHVzZU1lbW8oXG5cdFx0KCkgPT4gYXR0cmlidXRlcy5zbGljZSgpLnNvcnQoKGEsIGIpID0+IChhdHRyaWJ1dGVPcmRlci5nZXQoYS5pZCkgPz8gMCkgLSAoYXR0cmlidXRlT3JkZXIuZ2V0KGIuaWQpID8/IDApKSxcblx0XHRbYXR0cmlidXRlT3JkZXIsIGF0dHJpYnV0ZXNdXG5cdCk7XG5cblx0Y29uc3QgdmFyaWFudHNCeVNpZ25hdHVyZSA9IHVzZU1lbW8oKCkgPT4ge1xuXHRcdGNvbnN0IG1hcCA9IG5ldyBNYXA8c3RyaW5nLCBWYXJpYW50Um93PigpO1xuXHRcdHZhcmlhbnRzLmZvckVhY2goKHZhcmlhbnQpID0+IG1hcC5zZXQodmFyaWFudC5zaWduYXR1cmUsIHZhcmlhbnQpKTtcblx0XHRyZXR1cm4gbWFwO1xuXHR9LCBbdmFyaWFudHNdKTtcblxuXHRjb25zdCBoYW5kbGVUb2dnbGVBdHRyaWJ1dGUgPSAoYXR0cmlidXRlSWQ6IHN0cmluZykgPT4ge1xuXHRcdHNldEF0dHJpYnV0ZXMoKHByZXYpID0+XG5cdFx0XHRwcmV2Lm1hcCgoYXR0cikgPT5cblx0XHRcdFx0YXR0ci5pZCA9PT0gYXR0cmlidXRlSWQgPyB7IC4uLmF0dHIsIGVuYWJsZWQ6ICFhdHRyLmVuYWJsZWQgfSA6IGF0dHJcblx0XHRcdClcblx0XHQpO1xuXHR9O1xuXG5cdGNvbnN0IGhhbmRsZUF0dHJpYnV0ZVZhbHVlc0NoYW5nZSA9IChhdHRyaWJ1dGVJZDogc3RyaW5nLCB2YWx1ZVRleHQ6IHN0cmluZykgPT4ge1xuXHRcdHNldEF0dHJpYnV0ZXMoKHByZXYpID0+XG5cdFx0XHRwcmV2Lm1hcCgoYXR0cikgPT4gKGF0dHIuaWQgPT09IGF0dHJpYnV0ZUlkID8geyAuLi5hdHRyLCB2YWx1ZVRleHQgfSA6IGF0dHIpKVxuXHRcdCk7XG5cdH07XG5cblx0Y29uc3QgaGFuZGxlR2VuZXJhdGUgPSAoKSA9PiB7XG5cdFx0Y29uc3QgY29tYm9zID0gYnVpbGRDb21iaW5hdGlvbnMoYXR0cmlidXRlcyk7XG5cdFx0aWYgKGNvbWJvcy5sZW5ndGggPT09IDApIHtcblx0XHRcdGFkZE5vdGljZVJlZi5jdXJyZW50KHsgbWVzc2FnZTogJ3Byb2R1Y3QtdmFyaWFudC1uby1hdHRyaWJ1dGVzJywgdHlwZTogJ2Vycm9yJyB9KTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y29uc3QgYmFzZVNrdSA9IHByb2R1Y3Q/LnByb2R1Y3RDb2RlID8/ICcnO1xuXHRcdGNvbnN0IGJhc2VQcmljZSA9IHByb2R1Y3Q/LmJhc2VQcmljZSAhPSBudWxsID8gU3RyaW5nKHByb2R1Y3QuYmFzZVByaWNlKSA6ICcnO1xuXHRcdGNvbnN0IG5leHRWYXJpYW50cyA9IGNvbWJvcy5tYXAoKG9wdGlvbnMpID0+IHtcblx0XHRcdGNvbnN0IHNpZ25hdHVyZSA9IGJ1aWxkU2lnbmF0dXJlKG9wdGlvbnMpO1xuXHRcdFx0Y29uc3QgZXhpc3RpbmcgPSB2YXJpYW50c0J5U2lnbmF0dXJlLmdldChzaWduYXR1cmUpO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0c2lnbmF0dXJlLFxuXHRcdFx0XHRvcHRpb25zOiBvcHRpb25zXG5cdFx0XHRcdFx0LnNsaWNlKClcblx0XHRcdFx0XHQuc29ydChcblx0XHRcdFx0XHRcdChhLCBiKSA9PiAoYXR0cmlidXRlT3JkZXIuZ2V0KGEuYXR0cmlidXRlSWQpID8/IDApIC0gKGF0dHJpYnV0ZU9yZGVyLmdldChiLmF0dHJpYnV0ZUlkKSA/PyAwKVxuXHRcdFx0XHRcdCksXG5cdFx0XHRcdHNrdTogZXhpc3Rpbmc/LnNrdSA/PyBidWlsZFNrdShiYXNlU2t1LCBvcHRpb25zKSxcblx0XHRcdFx0cHJpY2U6IGV4aXN0aW5nPy5wcmljZSA/PyBiYXNlUHJpY2UsXG5cdFx0XHRcdHN0b2NrOiBleGlzdGluZz8uc3RvY2sgPz8gJzAnLFxuXHRcdFx0fTtcblx0XHR9KTtcblx0XHRzZXRWYXJpYW50cyhuZXh0VmFyaWFudHMpO1xuXHR9O1xuXG5cdGNvbnN0IGhhbmRsZVZhcmlhbnRDaGFuZ2UgPSAoaW5kZXg6IG51bWJlciwgZmllbGQ6ICdza3UnIHwgJ3ByaWNlJyB8ICdzdG9jaycsIHZhbHVlOiBzdHJpbmcpID0+IHtcblx0XHRzZXRWYXJpYW50cygocHJldikgPT5cblx0XHRcdHByZXYubWFwKCh2YXJpYW50LCBpZHgpID0+IChpZHggPT09IGluZGV4ID8geyAuLi52YXJpYW50LCBbZmllbGRdOiB2YWx1ZSB9IDogdmFyaWFudCkpXG5cdFx0KTtcblx0fTtcblxuXHRjb25zdCBoYW5kbGVTYXZlID0gYXN5bmMgKCkgPT4ge1xuXHRcdGlmICghcmVjb3JkSWQgfHwgc2F2aW5nKSByZXR1cm47XG5cdFx0c2V0U2F2aW5nKHRydWUpO1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBwYXlsb2FkQXR0cmlidXRlcyA9IGF0dHJpYnV0ZXNcblx0XHRcdFx0LmZpbHRlcigoYXR0cikgPT4gYXR0ci5lbmFibGVkKVxuXHRcdFx0XHQubWFwKChhdHRyKSA9PiAoe1xuXHRcdFx0XHRcdGlkOiBhdHRyLmlkLFxuXHRcdFx0XHRcdHZhbHVlczogcGFyc2VWYWx1ZXMoYXR0ci52YWx1ZVRleHQpLFxuXHRcdFx0XHR9KSk7XG5cblx0XHRcdGNvbnN0IHBheWxvYWRWYXJpYW50cyA9IHZhcmlhbnRzLm1hcCgodmFyaWFudCkgPT4gKHtcblx0XHRcdFx0c2t1OiB2YXJpYW50LnNrdSxcblx0XHRcdFx0cHJpY2U6IHZhcmlhbnQucHJpY2UsXG5cdFx0XHRcdHN0b2NrOiB2YXJpYW50LnN0b2NrLFxuXHRcdFx0XHRvcHRpb25zOiB2YXJpYW50Lm9wdGlvbnMsXG5cdFx0XHR9KSk7XG5cblx0XHRcdGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG5cdFx0XHRmb3JtRGF0YS5hcHBlbmQoJ2F0dHJpYnV0ZXMnLCBKU09OLnN0cmluZ2lmeShwYXlsb2FkQXR0cmlidXRlcykpO1xuXHRcdFx0Zm9ybURhdGEuYXBwZW5kKCd2YXJpYW50cycsIEpTT04uc3RyaW5naWZ5KHBheWxvYWRWYXJpYW50cykpO1xuXG5cdFx0XHRjb25zdCByZXNwb25zZSA9IGF3YWl0IGFwaS5yZWNvcmRBY3Rpb24oe1xuXHRcdFx0XHRyZXNvdXJjZUlkOiByZXNvdXJjZS5pZCxcblx0XHRcdFx0cmVjb3JkSWQsXG5cdFx0XHRcdGFjdGlvbk5hbWU6IGFjdGlvbi5uYW1lLFxuXHRcdFx0XHRtZXRob2Q6ICdwb3N0Jyxcblx0XHRcdFx0ZGF0YTogZm9ybURhdGEsXG5cdFx0XHR9KTtcblxuXHRcdFx0aWYgKHJlc3BvbnNlLmRhdGEubm90aWNlKSBhZGROb3RpY2VSZWYuY3VycmVudChyZXNwb25zZS5kYXRhLm5vdGljZSk7XG5cdFx0fSBjYXRjaCB7XG5cdFx0XHRhZGROb3RpY2VSZWYuY3VycmVudCh7IG1lc3NhZ2U6ICdwcm9kdWN0LXZhcmlhbnQtc2F2ZS1mYWlsZWQnLCB0eXBlOiAnZXJyb3InIH0pO1xuXHRcdH0gZmluYWxseSB7XG5cdFx0XHRzZXRTYXZpbmcoZmFsc2UpO1xuXHRcdH1cblx0fTtcblxuXHRjb25zdCB0aXRsZSA9IHRyYW5zbGF0ZUFjdGlvbihhY3Rpb24ubmFtZSwgcmVzb3VyY2UuaWQpO1xuXHRjb25zdCBoYXNWYXJpYW50cyA9IHZhcmlhbnRzLmxlbmd0aCA+IDA7XG5cblx0cmV0dXJuIChcblx0XHQ8Qm94XG5cdFx0XHR2YXJpYW50PSd3aGl0ZSdcblx0XHRcdHA9J3h4bCdcblx0XHRcdGJvcmRlclJhZGl1cz0neGwnXG5cdFx0XHRib3hTaGFkb3c9J3NtJ1xuXHRcdFx0c3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnIH19XG5cdFx0PlxuXHRcdFx0PEJveCBkaXNwbGF5PSdmbGV4JyBhbGlnbkl0ZW1zPSdjZW50ZXInIGp1c3RpZnlDb250ZW50PSdzcGFjZS1iZXR3ZWVuJyBtYj0neGwnPlxuXHRcdFx0XHQ8VGV4dCBmb250U2l6ZT0neGwnIGZvbnRXZWlnaHQ9J2JvbGQnPlxuXHRcdFx0XHRcdHt0aXRsZX1cblx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0PC9Cb3g+XG5cblx0XHRcdHtsb2FkaW5nID8gKFxuXHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJz57dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC12YXJpYW50LWxvYWRpbmcnKX08L1RleHQ+XG5cdFx0XHQpIDogbG9hZEVycm9yID8gKFxuXHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJz57dHJhbnNsYXRlTWVzc2FnZShsb2FkRXJyb3IpfTwvVGV4dD5cblx0XHRcdCkgOiAoXG5cdFx0XHRcdDw+XG5cdFx0XHRcdFx0PFRleHQgbWI9J2xnJyBjb2xvcj0nZ3JleTYwJz5cblx0XHRcdFx0XHRcdHt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LXZhcmlhbnQtZGVzY3JpcHRpb24nKX1cblx0XHRcdFx0XHQ8L1RleHQ+XG5cblx0XHRcdFx0XHQ8Qm94XG5cdFx0XHRcdFx0XHR2YXJpYW50PSd3aGl0ZSdcblx0XHRcdFx0XHRcdHA9J3hsJ1xuXHRcdFx0XHRcdFx0Ym9yZGVyUmFkaXVzPSdsZydcblx0XHRcdFx0XHRcdG1iPSd4bCdcblx0XHRcdFx0XHRcdHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJywgYmFja2dyb3VuZDogJyNGOEZBRkMnIH19XG5cdFx0XHRcdFx0PlxuXHRcdFx0XHRcdFx0PFRleHQgZm9udFdlaWdodD0nYm9sZCcgbWI9J21kJz5cblx0XHRcdFx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtdmFyaWFudC1hdHRyaWJ1dGVzLXRpdGxlJyl9XG5cdFx0XHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHRcdFx0XHQ8Qm94IHN0eWxlPXt7IGRpc3BsYXk6ICdncmlkJywgZ2FwOiAxNiB9fT5cblx0XHRcdFx0XHRcdFx0e29yZGVyZWRBdHRyaWJ1dGVzLm1hcCgoYXR0cikgPT4gKFxuXHRcdFx0XHRcdFx0XHRcdDxCb3hcblx0XHRcdFx0XHRcdFx0XHRcdGtleT17YXR0ci5pZH1cblx0XHRcdFx0XHRcdFx0XHRcdHN0eWxlPXt7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGRpc3BsYXk6ICdncmlkJyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0Z3JpZFRlbXBsYXRlQ29sdW1uczogJ21pbm1heCgxODBweCwgMjIwcHgpIDFmcicsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGdhcDogMTYsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGFsaWduSXRlbXM6ICdjZW50ZXInLFxuXHRcdFx0XHRcdFx0XHRcdFx0fX1cblx0XHRcdFx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHRcdFx0XHQ8bGFiZWwgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZ2FwOiA4IH19PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8aW5wdXRcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR0eXBlPSdjaGVja2JveCdcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjaGVja2VkPXthdHRyLmVuYWJsZWR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0b25DaGFuZ2U9eygpID0+IGhhbmRsZVRvZ2dsZUF0dHJpYnV0ZShhdHRyLmlkKX1cblx0XHRcdFx0XHRcdFx0XHRcdFx0Lz5cblx0XHRcdFx0XHRcdFx0XHRcdFx0PHNwYW4+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0e2F0dHIubmFtZX1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR7YXR0ci51bml0ID8gYCAoJHthdHRyLnVuaXR9KWAgOiAnJ31cblx0XHRcdFx0XHRcdFx0XHRcdFx0PC9zcGFuPlxuXHRcdFx0XHRcdFx0XHRcdFx0PC9sYWJlbD5cblx0XHRcdFx0XHRcdFx0XHRcdDxGb3JtR3JvdXA+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdDxMYWJlbD57dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC12YXJpYW50LXZhbHVlcy1sYWJlbCcpfTwvTGFiZWw+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdDxJbnB1dFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHBsYWNlaG9sZGVyPXt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LXZhcmlhbnQtdmFsdWVzLXBsYWNlaG9sZGVyJyl9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0dmFsdWU9e2F0dHIudmFsdWVUZXh0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRpc2FibGVkPXshYXR0ci5lbmFibGVkfVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsoZXZlbnQpID0+IGhhbmRsZUF0dHJpYnV0ZVZhbHVlc0NoYW5nZShhdHRyLmlkLCBldmVudC50YXJnZXQudmFsdWUpfVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQvPlxuXHRcdFx0XHRcdFx0XHRcdFx0PC9Gb3JtR3JvdXA+XG5cdFx0XHRcdFx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdFx0XHRcdCkpfVxuXHRcdFx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdFx0XHQ8Qm94IG10PSdsZycgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBnYXA6IDIwIH19PlxuXHRcdFx0XHRcdFx0XHQ8QnV0dG9uIHZhcmlhbnQ9J291dGxpbmVkJyBvbkNsaWNrPXtoYW5kbGVHZW5lcmF0ZX0+XG5cdFx0XHRcdFx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtdmFyaWFudC1nZW5lcmF0ZScpfVxuXHRcdFx0XHRcdFx0XHQ8L0J1dHRvbj5cblx0XHRcdFx0XHRcdFx0PEJ1dHRvblxuXHRcdFx0XHRcdFx0XHRcdHZhcmlhbnQ9J2NvbnRhaW5lZCdcblx0XHRcdFx0XHRcdFx0XHRjb2xvcj0ncHJpbWFyeSdcblx0XHRcdFx0XHRcdFx0XHRvbkNsaWNrPXtoYW5kbGVTYXZlfVxuXHRcdFx0XHRcdFx0XHRcdGRpc2FibGVkPXtzYXZpbmd9XG5cdFx0XHRcdFx0XHRcdFx0c3R5bGU9e2FjdGlvbkJ1dHRvblN0eWxlfVxuXHRcdFx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHRcdFx0e3NhdmluZyA/IHRyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtdmFyaWFudC1zYXZpbmcnKSA6IHRyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtdmFyaWFudC1zYXZlJyl9XG5cdFx0XHRcdFx0XHRcdDwvQnV0dG9uPlxuXHRcdFx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdFx0PC9Cb3g+XG5cblx0XHRcdFx0XHQ8Qm94PlxuXHRcdFx0XHRcdFx0PFRleHQgZm9udFdlaWdodD0nYm9sZCcgbWI9J21kJz5cblx0XHRcdFx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtdmFyaWFudC1tYXRyaXgtdGl0bGUnKX1cblx0XHRcdFx0XHRcdDwvVGV4dD5cblx0XHRcdFx0XHRcdHtoYXNWYXJpYW50cyA/IChcblx0XHRcdFx0XHRcdFx0PFRhYmxlPlxuXHRcdFx0XHRcdFx0XHRcdDxUYWJsZUhlYWQ+XG5cdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVSb3c+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHtvcmRlcmVkQXR0cmlidXRlc1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdC5maWx0ZXIoKGF0dHIpID0+IGF0dHIuZW5hYmxlZClcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQubWFwKChhdHRyKSA9PiAoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVDZWxsIGtleT17YXR0ci5pZH0+e2F0dHIubmFtZX08L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQpKX1cblx0XHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlQ2VsbD57dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC12YXJpYW50LXNrdS1sYWJlbCcpfTwvVGFibGVDZWxsPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVDZWxsPnt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LXZhcmlhbnQtcHJpY2UtbGFiZWwnKX08L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlQ2VsbD57dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC12YXJpYW50LXN0b2NrLWxhYmVsJyl9PC9UYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHRcdFx0XHQ8L1RhYmxlUm93PlxuXHRcdFx0XHRcdFx0XHRcdDwvVGFibGVIZWFkPlxuXHRcdFx0XHRcdFx0XHRcdDxUYWJsZUJvZHk+XG5cdFx0XHRcdFx0XHRcdFx0XHR7dmFyaWFudHMubWFwKCh2YXJpYW50LCBpbmRleCkgPT4gKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVSb3cga2V5PXt2YXJpYW50LnNpZ25hdHVyZX0+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0e29yZGVyZWRBdHRyaWJ1dGVzXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQuZmlsdGVyKChhdHRyKSA9PiBhdHRyLmVuYWJsZWQpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQubWFwKChhdHRyKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IHZhbHVlID1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR2YXJpYW50Lm9wdGlvbnMuZmluZCgob3B0KSA9PiBvcHQuYXR0cmlidXRlSWQgPT09IGF0dHIuaWQpPy52YWx1ZSA/P1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCctJztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIDxUYWJsZUNlbGwga2V5PXthdHRyLmlkfT57dmFsdWV9PC9UYWJsZUNlbGw+O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSl9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxJbnB1dFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR2YWx1ZT17dmFyaWFudC5za3V9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsoZXZlbnQpID0+IGhhbmRsZVZhcmlhbnRDaGFuZ2UoaW5kZXgsICdza3UnLCBldmVudC50YXJnZXQudmFsdWUpfVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Lz5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGFibGVDZWxsPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PElucHV0XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHR5cGU9J251bWJlcidcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0dmFsdWU9e3ZhcmlhbnQucHJpY2V9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsoZXZlbnQpID0+IGhhbmRsZVZhcmlhbnRDaGFuZ2UoaW5kZXgsICdwcmljZScsIGV2ZW50LnRhcmdldC52YWx1ZSl9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDwvVGFibGVDZWxsPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8SW5wdXRcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0dHlwZT0nbnVtYmVyJ1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR2YWx1ZT17dmFyaWFudC5zdG9ja31cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0b25DaGFuZ2U9eyhldmVudCkgPT4gaGFuZGxlVmFyaWFudENoYW5nZShpbmRleCwgJ3N0b2NrJywgZXZlbnQudGFyZ2V0LnZhbHVlKX1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0PC9UYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdDwvVGFibGVSb3c+XG5cdFx0XHRcdFx0XHRcdFx0XHQpKX1cblx0XHRcdFx0XHRcdFx0XHQ8L1RhYmxlQm9keT5cblx0XHRcdFx0XHRcdFx0PC9UYWJsZT5cblx0XHRcdFx0XHRcdCkgOiAoXG5cdFx0XHRcdFx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnPnt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LXZhcmlhbnQtbm8tdmFyaWFudHMnKX08L1RleHQ+XG5cdFx0XHRcdFx0XHQpfVxuXHRcdFx0XHRcdDwvQm94PlxuXHRcdFx0XHQ8Lz5cblx0XHRcdCl9XG5cdFx0PC9Cb3g+XG5cdCk7XG59XG4iLCJpbXBvcnQgeyB1c2VNZW1vLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEFwaUNsaWVudCwgdHlwZSBBY3Rpb25Qcm9wcywgdXNlTm90aWNlLCB1c2VUcmFuc2xhdGlvbiB9IGZyb20gJ2FkbWluanMnO1xuaW1wb3J0IHtcblx0Qm94LFxuXHRCdXR0b24sXG5cdElucHV0LFxuXHRMYWJlbCxcblx0VGFibGUsXG5cdFRhYmxlQm9keSxcblx0VGFibGVDZWxsLFxuXHRUYWJsZUhlYWQsXG5cdFRhYmxlUm93LFxuXHRUZXh0LFxufSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcblxudHlwZSBDc3ZSZXN1bHQgPSB7XG5cdHJvdzogbnVtYmVyO1xuXHRzdGF0dXM6ICdjcmVhdGVkJyB8ICd1cGRhdGVkJyB8ICdza2lwcGVkJyB8ICdlcnJvcic7XG5cdG1lc3NhZ2U/OiBzdHJpbmc7XG59O1xuXG5jb25zdCBhcGkgPSBuZXcgQXBpQ2xpZW50KCk7XG5cbmNvbnN0IGFjdGlvbkJ1dHRvblN0eWxlID0ge1xuXHRib3JkZXJDb2xvcjogJ3doaXRlJyxcblx0YmFja2dyb3VuZDogJyNmYWNjMTUnLFxuXHRjb2xvcjogJ2JsYWNrJyxcbn07XG5cbmNvbnN0IGRvd25sb2FkVGV4dCA9IChjb250ZW50OiBzdHJpbmcsIGZpbGVuYW1lOiBzdHJpbmcpID0+IHtcblx0Y29uc3QgYmxvYiA9IG5ldyBCbG9iKFtjb250ZW50XSwgeyB0eXBlOiAndGV4dC9jc3Y7Y2hhcnNldD11dGYtOCcgfSk7XG5cdGNvbnN0IHVybCA9IHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuXHRjb25zdCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuXHRsaW5rLmhyZWYgPSB1cmw7XG5cdGxpbmsuZG93bmxvYWQgPSBmaWxlbmFtZTtcblx0ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChsaW5rKTtcblx0bGluay5jbGljaygpO1xuXHRsaW5rLnJlbW92ZSgpO1xuXHR3aW5kb3cuVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUHJvZHVjdENzdkltcG9ydEV4cG9ydEFjdGlvbihwcm9wczogQWN0aW9uUHJvcHMpIHtcblx0Y29uc3QgeyBhY3Rpb24sIHJlc291cmNlIH0gPSBwcm9wcztcblx0Y29uc3QgeyB0cmFuc2xhdGVBY3Rpb24sIHRyYW5zbGF0ZU1lc3NhZ2UgfSA9IHVzZVRyYW5zbGF0aW9uKCk7XG5cdGNvbnN0IGFkZE5vdGljZSA9IHVzZU5vdGljZSgpO1xuXHRjb25zdCBbY3N2VGV4dCwgc2V0Q3N2VGV4dF0gPSB1c2VTdGF0ZSgnJyk7XG5cdGNvbnN0IFtkcnlSdW4sIHNldERyeVJ1bl0gPSB1c2VTdGF0ZSh0cnVlKTtcblx0Y29uc3QgW3Jlc3VsdHMsIHNldFJlc3VsdHNdID0gdXNlU3RhdGU8Q3N2UmVzdWx0W10+KFtdKTtcblx0Y29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuXG5cdGNvbnN0IHN1bW1hcnkgPSB1c2VNZW1vKCgpID0+IHtcblx0XHRjb25zdCBjcmVhdGVkID0gcmVzdWx0cy5maWx0ZXIoKHIpID0+IHIuc3RhdHVzID09PSAnY3JlYXRlZCcpLmxlbmd0aDtcblx0XHRjb25zdCB1cGRhdGVkID0gcmVzdWx0cy5maWx0ZXIoKHIpID0+IHIuc3RhdHVzID09PSAndXBkYXRlZCcpLmxlbmd0aDtcblx0XHRjb25zdCBlcnJvcnMgPSByZXN1bHRzLmZpbHRlcigocikgPT4gci5zdGF0dXMgPT09ICdlcnJvcicpLmxlbmd0aDtcblx0XHRyZXR1cm4geyBjcmVhdGVkLCB1cGRhdGVkLCBlcnJvcnMgfTtcblx0fSwgW3Jlc3VsdHNdKTtcblxuXHRjb25zdCBmb3JtYXRTdGF0dXMgPSAoc3RhdHVzOiBDc3ZSZXN1bHRbJ3N0YXR1cyddKSA9PlxuXHRcdHRyYW5zbGF0ZU1lc3NhZ2UoYHByb2R1Y3QtY3N2LXN0YXR1cy0ke3N0YXR1c31gLCB7IGRlZmF1bHRWYWx1ZTogc3RhdHVzIH0pO1xuXG5cdGNvbnN0IGhhbmRsZUZpbGUgPSAoZmlsZTogRmlsZSB8IG51bGwpID0+IHtcblx0XHRpZiAoIWZpbGUpIHJldHVybjtcblx0XHRjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuXHRcdHJlYWRlci5vbmxvYWQgPSAoKSA9PiB7XG5cdFx0XHRzZXRDc3ZUZXh0KFN0cmluZyhyZWFkZXIucmVzdWx0ID8/ICcnKSk7XG5cdFx0fTtcblx0XHRyZWFkZXIucmVhZEFzVGV4dChmaWxlKTtcblx0fTtcblxuXHRjb25zdCBoYW5kbGVFeHBvcnQgPSBhc3luYyAoKSA9PiB7XG5cdFx0c2V0TG9hZGluZyh0cnVlKTtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhcGkucmVzb3VyY2VBY3Rpb24oe1xuXHRcdFx0XHRyZXNvdXJjZUlkOiByZXNvdXJjZS5pZCxcblx0XHRcdFx0YWN0aW9uTmFtZTogJ2V4cG9ydFByb2R1Y3RzQ3N2Jyxcblx0XHRcdFx0bWV0aG9kOiAnZ2V0Jyxcblx0XHRcdH0pO1xuXHRcdFx0Y29uc3QgcGF5bG9hZCA9IHJlc3BvbnNlLmRhdGEucGF5bG9hZCBhcyB7IGNzdj86IHN0cmluZzsgZmlsZW5hbWU/OiBzdHJpbmcgfSB8IHVuZGVmaW5lZDtcblx0XHRcdGNvbnN0IGNzdiA9IHBheWxvYWQ/LmNzdiA/PyAnJztcblx0XHRcdGlmICghY3N2KSB7XG5cdFx0XHRcdGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdwcm9kdWN0LWNzdi1leHBvcnQtZW1wdHknLCB0eXBlOiAnZXJyb3InIH0pO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRkb3dubG9hZFRleHQoY3N2LCBwYXlsb2FkPy5maWxlbmFtZSA/PyAncHJvZHVjdHMuY3N2Jyk7XG5cdFx0fSBjYXRjaCB7XG5cdFx0XHRhZGROb3RpY2UoeyBtZXNzYWdlOiAncHJvZHVjdC1jc3YtZXhwb3J0LWZhaWxlZCcsIHR5cGU6ICdlcnJvcicgfSk7XG5cdFx0fSBmaW5hbGx5IHtcblx0XHRcdHNldExvYWRpbmcoZmFsc2UpO1xuXHRcdH1cblx0fTtcblxuXHRjb25zdCBoYW5kbGVJbXBvcnQgPSBhc3luYyAoKSA9PiB7XG5cdFx0aWYgKCFjc3ZUZXh0LnRyaW0oKSkge1xuXHRcdFx0YWRkTm90aWNlKHsgbWVzc2FnZTogJ3Byb2R1Y3QtY3N2LWVtcHR5JywgdHlwZTogJ2Vycm9yJyB9KTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0c2V0TG9hZGluZyh0cnVlKTtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcblx0XHRcdGZvcm1EYXRhLmFwcGVuZCgnY3N2JywgY3N2VGV4dCk7XG5cdFx0XHRmb3JtRGF0YS5hcHBlbmQoJ2RyeVJ1bicsIFN0cmluZyhkcnlSdW4pKTtcblx0XHRcdGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXBpLnJlc291cmNlQWN0aW9uKHtcblx0XHRcdFx0cmVzb3VyY2VJZDogcmVzb3VyY2UuaWQsXG5cdFx0XHRcdGFjdGlvbk5hbWU6IGFjdGlvbi5uYW1lLFxuXHRcdFx0XHRtZXRob2Q6ICdwb3N0Jyxcblx0XHRcdFx0ZGF0YTogZm9ybURhdGEsXG5cdFx0XHR9KTtcblx0XHRcdGlmIChyZXNwb25zZS5kYXRhLm5vdGljZSkgYWRkTm90aWNlKHJlc3BvbnNlLmRhdGEubm90aWNlKTtcblx0XHRcdHNldFJlc3VsdHMoKHJlc3BvbnNlLmRhdGEucGF5bG9hZD8ucmVzdWx0cyA/PyBbXSkgYXMgQ3N2UmVzdWx0W10pO1xuXHRcdH0gY2F0Y2gge1xuXHRcdFx0YWRkTm90aWNlKHsgbWVzc2FnZTogJ3Byb2R1Y3QtY3N2LWltcG9ydC1mYWlsZWQnLCB0eXBlOiAnZXJyb3InIH0pO1xuXHRcdH0gZmluYWxseSB7XG5cdFx0XHRzZXRMb2FkaW5nKGZhbHNlKTtcblx0XHR9XG5cdH07XG5cblx0cmV0dXJuIChcblx0XHQ8Qm94XG5cdFx0XHR2YXJpYW50PSd3aGl0ZSdcblx0XHRcdHA9J3h4bCdcblx0XHRcdGJvcmRlclJhZGl1cz0neGwnXG5cdFx0XHRib3hTaGFkb3c9J3NtJ1xuXHRcdFx0c3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnIH19XG5cdFx0PlxuXHRcdFx0PFRleHQgZm9udFNpemU9J3hsJyBmb250V2VpZ2h0PSdib2xkJyBtYj0nc20nPlxuXHRcdFx0XHR7dHJhbnNsYXRlQWN0aW9uKGFjdGlvbi5uYW1lLCByZXNvdXJjZS5pZCl9XG5cdFx0XHQ8L1RleHQ+XG5cdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJyBtYj0neGwnPlxuXHRcdFx0XHR7dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1jc3YtZGVzY3JpcHRpb24nKX1cblx0XHRcdDwvVGV4dD5cblxuXHRcdFx0PEJveCBtYj0neGwnIHN0eWxlPXt7IGRpc3BsYXk6ICdncmlkJywgZ2FwOiAxMiB9fT5cblx0XHRcdFx0PExhYmVsPnt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWNzdi1maWxlLWxhYmVsJyl9PC9MYWJlbD5cblx0XHRcdFx0PElucHV0XG5cdFx0XHRcdFx0dHlwZT0nZmlsZSdcblx0XHRcdFx0XHRhY2NlcHQ9Jy5jc3YsdGV4dC9jc3YnXG5cdFx0XHRcdFx0b25DaGFuZ2U9eyhldmVudCkgPT4gaGFuZGxlRmlsZShldmVudC50YXJnZXQuZmlsZXM/LlswXSA/PyBudWxsKX1cblx0XHRcdFx0Lz5cblx0XHRcdFx0PEJveCBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6IDggfX0+XG5cdFx0XHRcdFx0PGlucHV0XG5cdFx0XHRcdFx0XHR0eXBlPSdjaGVja2JveCdcblx0XHRcdFx0XHRcdGNoZWNrZWQ9e2RyeVJ1bn1cblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldERyeVJ1bihldmVudC50YXJnZXQuY2hlY2tlZCl9XG5cdFx0XHRcdFx0Lz5cblx0XHRcdFx0XHQ8VGV4dD57dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1jc3YtZHJ5LXJ1bicpfTwvVGV4dD5cblx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdDxCb3ggc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBnYXA6IDEyIH19PlxuXHRcdFx0XHRcdDxCdXR0b24gdmFyaWFudD0nb3V0bGluZWQnIG9uQ2xpY2s9e2hhbmRsZUV4cG9ydH0gZGlzYWJsZWQ9e2xvYWRpbmd9PlxuXHRcdFx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtY3N2LWV4cG9ydCcpfVxuXHRcdFx0XHRcdDwvQnV0dG9uPlxuXHRcdFx0XHRcdDxCdXR0b24gdmFyaWFudD0nY29udGFpbmVkJyBjb2xvcj0ncHJpbWFyeScgc3R5bGU9e2FjdGlvbkJ1dHRvblN0eWxlfSBvbkNsaWNrPXtoYW5kbGVJbXBvcnR9IGRpc2FibGVkPXtsb2FkaW5nfT5cblx0XHRcdFx0XHRcdHtsb2FkaW5nID8gdHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1jc3YtaW1wb3J0aW5nJykgOiB0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWNzdi1pbXBvcnQnKX1cblx0XHRcdFx0XHQ8L0J1dHRvbj5cblx0XHRcdFx0PC9Cb3g+XG5cdFx0XHQ8L0JveD5cblxuXHRcdFx0e3Jlc3VsdHMubGVuZ3RoID4gMCA/IChcblx0XHRcdFx0PEJveD5cblx0XHRcdFx0XHQ8VGV4dCBmb250V2VpZ2h0PSdib2xkJyBtYj0nbWQnPlxuXHRcdFx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtY3N2LXN1bW1hcnknLCB7XG5cdFx0XHRcdFx0XHRcdGNyZWF0ZWQ6IFN0cmluZyhzdW1tYXJ5LmNyZWF0ZWQpLFxuXHRcdFx0XHRcdFx0XHR1cGRhdGVkOiBTdHJpbmcoc3VtbWFyeS51cGRhdGVkKSxcblx0XHRcdFx0XHRcdFx0ZXJyb3JzOiBTdHJpbmcoc3VtbWFyeS5lcnJvcnMpLFxuXHRcdFx0XHRcdFx0fSl9XG5cdFx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0XHRcdDxUYWJsZT5cblx0XHRcdFx0XHRcdDxUYWJsZUhlYWQ+XG5cdFx0XHRcdFx0XHRcdDxUYWJsZVJvdz5cblx0XHRcdFx0XHRcdFx0XHQ8VGFibGVDZWxsPnt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWNzdi1yb3cnKX08L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHQ8VGFibGVDZWxsPnt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWNzdi1zdGF0dXMnKX08L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHQ8VGFibGVDZWxsPnt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWNzdi1tZXNzYWdlJyl9PC9UYWJsZUNlbGw+XG5cdFx0XHRcdFx0XHRcdDwvVGFibGVSb3c+XG5cdFx0XHRcdFx0XHQ8L1RhYmxlSGVhZD5cblx0XHRcdFx0XHRcdDxUYWJsZUJvZHk+XG5cdFx0XHRcdFx0XHRcdHtyZXN1bHRzLm1hcCgocmVzdWx0KSA9PiAoXG5cdFx0XHRcdFx0XHRcdFx0PFRhYmxlUm93IGtleT17YCR7cmVzdWx0LnJvd30tJHtyZXN1bHQuc3RhdHVzfWB9PlxuXHRcdFx0XHRcdFx0XHRcdFx0PFRhYmxlQ2VsbD57cmVzdWx0LnJvd308L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZUNlbGw+e2Zvcm1hdFN0YXR1cyhyZXN1bHQuc3RhdHVzKX08L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHRcdDxUYWJsZUNlbGw+e3Jlc3VsdC5tZXNzYWdlID8/ICctJ308L1RhYmxlQ2VsbD5cblx0XHRcdFx0XHRcdFx0XHQ8L1RhYmxlUm93PlxuXHRcdFx0XHRcdFx0XHQpKX1cblx0XHRcdFx0XHRcdDwvVGFibGVCb2R5PlxuXHRcdFx0XHRcdDwvVGFibGU+XG5cdFx0XHRcdDwvQm94PlxuXHRcdFx0KSA6IG51bGx9XG5cdFx0PC9Cb3g+XG5cdCk7XG59XG4iLCJpbXBvcnQgeyB1c2VFZmZlY3QsIHVzZU1lbW8sIHVzZVN0YXRlLCB0eXBlIENoYW5nZUV2ZW50IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgZmxhdCwgdHlwZSBFZGl0UHJvcGVydHlQcm9wcyB9IGZyb20gJ2FkbWluanMnO1xuaW1wb3J0IHsgRm9ybUdyb3VwLCBJbnB1dCwgTGFiZWwgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcbmltcG9ydCB7IHVzZVRyYW5zbGF0aW9uIH0gZnJvbSAnYWRtaW5qcyc7XG5cbmNvbnN0IHBhcnNlQ3N2VGFncyA9ICh2YWx1ZTogc3RyaW5nKTogc3RyaW5nW10gPT4ge1xuXHRjb25zdCBwYXJzZWQgPSB2YWx1ZVxuXHRcdC5zcGxpdCgnLCcpXG5cdFx0Lm1hcCgodGFnKSA9PiB0YWcudHJpbSgpKVxuXHRcdC5maWx0ZXIoQm9vbGVhbilcblx0XHQubWFwKCh0YWcpID0+IHRhZy50b0xvd2VyQ2FzZSgpKTtcblx0cmV0dXJuIEFycmF5LmZyb20obmV3IFNldChwYXJzZWQpKTtcbn07XG5cbmNvbnN0IHRvQ3N2ID0gKHZhbHVlOiB1bmtub3duKTogc3RyaW5nID0+IHtcblx0aWYgKCF2YWx1ZSkgcmV0dXJuICcnO1xuXHRpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpXG5cdFx0cmV0dXJuIHZhbHVlXG5cdFx0XHQubWFwKCh2KSA9PiBTdHJpbmcodikpXG5cdFx0XHQuZmlsdGVyKEJvb2xlYW4pXG5cdFx0XHQuam9pbignLCAnKTtcblx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHJldHVybiB2YWx1ZTtcblx0cmV0dXJuICcnO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUHJvZHVjdFRhZ3NFZGl0KHByb3BzOiBFZGl0UHJvcGVydHlQcm9wcykge1xuXHRjb25zdCB7IHByb3BlcnR5LCByZWNvcmQsIG9uQ2hhbmdlIH0gPSBwcm9wcztcblx0Y29uc3QgeyB0cmFuc2xhdGVQcm9wZXJ0eSB9ID0gdXNlVHJhbnNsYXRpb24oKTtcblxuXHRjb25zdCB2YWx1ZSA9IHVzZU1lbW8oXG5cdFx0KCkgPT4gZmxhdC5nZXQocmVjb3JkLnBhcmFtcywgcHJvcGVydHkucGF0aCksXG5cdFx0W3JlY29yZC5wYXJhbXMsIHByb3BlcnR5LnBhdGhdXG5cdCk7XG5cdGNvbnN0IGluaXRpYWwgPSB1c2VNZW1vKCgpID0+IHRvQ3N2KHZhbHVlKSwgW3ZhbHVlXSk7XG5cdGNvbnN0IFt0ZXh0LCBzZXRUZXh0XSA9IHVzZVN0YXRlKGluaXRpYWwpO1xuXG5cdHVzZUVmZmVjdCgoKSA9PiB7XG5cdFx0c2V0VGV4dChpbml0aWFsKTtcblx0fSwgW2luaXRpYWxdKTtcblxuXHR1c2VFZmZlY3QoKCkgPT4ge1xuXHRcdGlmIChyZWNvcmQuaWQpIHJldHVybjtcblx0XHRpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkgb25DaGFuZ2UocHJvcGVydHkucGF0aCwgW10pO1xuXHR9LCBbb25DaGFuZ2UsIHByb3BlcnR5LnBhdGgsIHJlY29yZC5pZCwgdmFsdWVdKTtcblxuXHRyZXR1cm4gKFxuXHRcdDxGb3JtR3JvdXAgbWI9J3hsJz5cblx0XHRcdDxMYWJlbD57dHJhbnNsYXRlUHJvcGVydHkocHJvcGVydHkubGFiZWwsIHByb3BlcnR5LnJlc291cmNlSWQpfTwvTGFiZWw+XG5cdFx0XHQ8SW5wdXRcblx0XHRcdFx0bmFtZT17cHJvcGVydHkucGF0aH1cblx0XHRcdFx0cGxhY2Vob2xkZXI9J3BvcHVsYXIsIGRpc2NvdW50J1xuXHRcdFx0XHR2YWx1ZT17dGV4dH1cblx0XHRcdFx0b25DaGFuZ2U9eyhlOiBDaGFuZ2VFdmVudDxIVE1MSW5wdXRFbGVtZW50PikgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IG5leHRUZXh0ID0gZS50YXJnZXQudmFsdWU7XG5cdFx0XHRcdFx0c2V0VGV4dChuZXh0VGV4dCk7XG5cdFx0XHRcdFx0b25DaGFuZ2UocHJvcGVydHkucGF0aCwgcGFyc2VDc3ZUYWdzKG5leHRUZXh0KSk7XG5cdFx0XHRcdH19XG5cdFx0XHQvPlxuXHRcdDwvRm9ybUdyb3VwPlxuXHQpO1xufVxuIiwiaW1wb3J0IHR5cGUgeyBBY3Rpb25Qcm9wcyB9IGZyb20gJ2FkbWluanMnO1xuaW1wb3J0IHsgdXNlVHJhbnNsYXRpb24gfSBmcm9tICdhZG1pbmpzJztcbmltcG9ydCB7IEJveCwgVGV4dCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xuXG5jb25zdCBoaW50S2V5QnlQcm9wZXJ0eTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcblx0bmFtZTogJ3Byb2R1Y3QtaGludC1uYW1lJyxcblx0bWV0YVRpdGxlOiAncHJvZHVjdC1oaW50LW1ldGFUaXRsZScsXG5cdG1ldGFEZXNjcmlwdGlvbjogJ3Byb2R1Y3QtaGludC1tZXRhRGVzY3JpcHRpb24nLFxuXHRjYW5vbmljYWxVcmw6ICdwcm9kdWN0LWhpbnQtY2Fub25pY2FsVXJsJyxcblx0b3BlbkdyYXBoSW1hZ2U6ICdwcm9kdWN0LWhpbnQtb3BlbkdyYXBoSW1hZ2UnLFxuXHRzbHVnOiAncHJvZHVjdC1oaW50LXNsdWcnLFxuXHRmdWxsU2x1ZzogJ3Byb2R1Y3QtaGludC1mdWxsU2x1ZycsXG5cdGNhdGVnb3J5TmFtZTogJ3Byb2R1Y3QtaGludC1jYXRlZ29yeU5hbWUnLFxuXHRzdWJjYXRlZ29yeU5hbWU6ICdwcm9kdWN0LWhpbnQtc3ViY2F0ZWdvcnlOYW1lJyxcblx0cHJvZHVjdENvZGU6ICdwcm9kdWN0LWhpbnQtcHJvZHVjdENvZGUnLFxuXHRiYXNlUHJpY2U6ICdwcm9kdWN0LWhpbnQtYmFzZVByaWNlJyxcblx0ZGlzY291bnRQcmljZTogJ3Byb2R1Y3QtaGludC1kaXNjb3VudFByaWNlJyxcblx0ZGlzY291bnRTdGFydEF0OiAncHJvZHVjdC1oaW50LWRpc2NvdW50U3RhcnRBdCcsXG5cdGRpc2NvdW50RW5kQXQ6ICdwcm9kdWN0LWhpbnQtZGlzY291bnRFbmRBdCcsXG5cdGN1cnJlbmN5OiAncHJvZHVjdC1oaW50LWN1cnJlbmN5Jyxcblx0c3RvY2s6ICdwcm9kdWN0LWhpbnQtc3RvY2snLFxuXHRpblN0b2NrOiAncHJvZHVjdC1oaW50LWluU3RvY2snLFxuXHRpbWFnZVVybDogJ3Byb2R1Y3QtaGludC1pbWFnZVVybCcsXG5cdGJyYW5kOiAncHJvZHVjdC1oaW50LWJyYW5kJyxcblx0Y2F0ZWdvcnk6ICdwcm9kdWN0LWhpbnQtY2F0ZWdvcnknLFxuXHR0YWdzOiAncHJvZHVjdC1oaW50LXRhZ3MnLFxufTtcblxuY29uc3QgbG9va3NMaWtlVHJhbnNsYXRpb25LZXkgPSAodmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBzdHJpbmcgPT5cblx0dHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiAodmFsdWUuc3RhcnRzV2l0aCgncHJvZHVjdC0nKSB8fCB2YWx1ZS5zdGFydHNXaXRoKCdidWxrLScpKTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUHJvZHVjdFZhbGlkYXRpb25FcnJvclN1bW1hcnkocHJvcHM6IEFjdGlvblByb3BzKSB7XG5cdGNvbnN0IHsgcmVjb3JkLCByZXNvdXJjZSB9ID0gcHJvcHM7XG5cdGNvbnN0IHsgdHJhbnNsYXRlTWVzc2FnZSwgdHJhbnNsYXRlUHJvcGVydHkgfSA9IHVzZVRyYW5zbGF0aW9uKCk7XG5cblx0Y29uc3QgZXJyb3JzID0gKHJlY29yZD8uZXJyb3JzID8/IHt9KSBhcyBSZWNvcmQ8c3RyaW5nLCB7IG1lc3NhZ2U/OiB1bmtub3duOyB0eXBlPzogdW5rbm93biB9Pjtcblx0Y29uc3QgaXRlbXMgPSBPYmplY3QuZW50cmllcyhlcnJvcnMpLmZpbHRlcigoWywgZXJyXSkgPT4gZXJyICYmIHR5cGVvZiBlcnIgPT09ICdvYmplY3QnICYmIGVyci5tZXNzYWdlICE9IG51bGwpO1xuXHRpZiAoaXRlbXMubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcblxuXHRyZXR1cm4gKFxuXHRcdDxCb3hcblx0XHRcdHZhcmlhbnQ9J3doaXRlJ1xuXHRcdFx0cD0neGwnXG5cdFx0XHRib3JkZXJSYWRpdXM9J3hsJ1xuXHRcdFx0Ym94U2hhZG93PSdzbSdcblx0XHRcdG1iPSd4bCdcblx0XHRcdHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCAjRkNBNUE1JywgYmFja2dyb3VuZDogJyNGRUYyRjInIH19XG5cdFx0PlxuXHRcdFx0PFRleHQgZm9udFdlaWdodD0nYm9sZCcgbWI9J3NtJz5cblx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtdmFsaWRhdGlvbi1zdW1tYXJ5LXRpdGxlJywgcmVzb3VyY2UuaWQsIHsgY291bnQ6IGl0ZW1zLmxlbmd0aCB9KX1cblx0XHRcdDwvVGV4dD5cblx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnIG1iPSdsZyc+XG5cdFx0XHRcdHt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LXZhbGlkYXRpb24tc3VtbWFyeS1zdWJ0aXRsZScpfVxuXHRcdFx0PC9UZXh0PlxuXG5cdFx0XHQ8Qm94IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGdhcDogMTIgfX0+XG5cdFx0XHRcdHtpdGVtcy5tYXAoKFtwcm9wZXJ0eVBhdGgsIGVycl0pID0+IHtcblx0XHRcdFx0XHRjb25zdCBtZXNzYWdlID0gZXJyLm1lc3NhZ2U7XG5cdFx0XHRcdFx0Y29uc3QgbWVzc2FnZVRleHQgPSBsb29rc0xpa2VUcmFuc2xhdGlvbktleShtZXNzYWdlKVxuXHRcdFx0XHRcdFx0PyB0cmFuc2xhdGVNZXNzYWdlKG1lc3NhZ2UpXG5cdFx0XHRcdFx0XHQ6IFN0cmluZyhtZXNzYWdlID8/ICcnKTtcblx0XHRcdFx0XHRjb25zdCBoaW50S2V5ID0gaGludEtleUJ5UHJvcGVydHlbcHJvcGVydHlQYXRoXTtcblxuXHRcdFx0XHRcdHJldHVybiAoXG5cdFx0XHRcdFx0XHQ8Qm94IGtleT17cHJvcGVydHlQYXRofSBzdHlsZT17eyBwYWRkaW5nOiAxMiwgYm9yZGVyUmFkaXVzOiAxMiwgYm9yZGVyOiAnMXB4IHNvbGlkICNGRUNBQ0EnIH19PlxuXHRcdFx0XHRcdFx0XHQ8VGV4dCBmb250V2VpZ2h0PSdib2xkJz57dHJhbnNsYXRlUHJvcGVydHkocHJvcGVydHlQYXRoLCByZXNvdXJjZS5pZCl9PC9UZXh0PlxuXHRcdFx0XHRcdFx0XHQ8VGV4dD57bWVzc2FnZVRleHR9PC9UZXh0PlxuXHRcdFx0XHRcdFx0XHR7aGludEtleSA/IChcblx0XHRcdFx0XHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJyBzdHlsZT17eyBmb250U2l6ZTogMTMsIG1hcmdpblRvcDogNiB9fT5cblx0XHRcdFx0XHRcdFx0XHRcdHt0cmFuc2xhdGVNZXNzYWdlKGhpbnRLZXkpfVxuXHRcdFx0XHRcdFx0XHRcdDwvVGV4dD5cblx0XHRcdFx0XHRcdFx0KSA6IG51bGx9XG5cdFx0XHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9KX1cblx0XHRcdDwvQm94PlxuXHRcdDwvQm94PlxuXHQpO1xufVxuIiwiaW1wb3J0IHR5cGUgeyBBY3Rpb25Qcm9wcyB9IGZyb20gJ2FkbWluanMnO1xuaW1wb3J0IHsgT3JpZ2luYWxOZXcgfSBmcm9tICdhZG1pbmpzJztcbmltcG9ydCB7IEJveCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xuaW1wb3J0IFByb2R1Y3RWYWxpZGF0aW9uRXJyb3JTdW1tYXJ5IGZyb20gJy4vUHJvZHVjdFZhbGlkYXRpb25FcnJvclN1bW1hcnknO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBQcm9kdWN0TmV3KHByb3BzOiBBY3Rpb25Qcm9wcykge1xuXHRyZXR1cm4gKFxuXHRcdDxCb3g+XG5cdFx0XHQ8UHJvZHVjdFZhbGlkYXRpb25FcnJvclN1bW1hcnkgey4uLnByb3BzfSAvPlxuXHRcdFx0PE9yaWdpbmFsTmV3IHsuLi5wcm9wc30gLz5cblx0XHQ8L0JveD5cblx0KTtcbn1cblxuIiwiaW1wb3J0IHR5cGUgeyBBY3Rpb25Qcm9wcyB9IGZyb20gJ2FkbWluanMnO1xuaW1wb3J0IHsgT3JpZ2luYWxFZGl0IH0gZnJvbSAnYWRtaW5qcyc7XG5pbXBvcnQgeyBCb3ggfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcbmltcG9ydCBQcm9kdWN0VmFsaWRhdGlvbkVycm9yU3VtbWFyeSBmcm9tICcuL1Byb2R1Y3RWYWxpZGF0aW9uRXJyb3JTdW1tYXJ5JztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUHJvZHVjdEVkaXQocHJvcHM6IEFjdGlvblByb3BzKSB7XG5cdHJldHVybiAoXG5cdFx0PEJveD5cblx0XHRcdDxQcm9kdWN0VmFsaWRhdGlvbkVycm9yU3VtbWFyeSB7Li4ucHJvcHN9IC8+XG5cdFx0XHQ8T3JpZ2luYWxFZGl0IHsuLi5wcm9wc30gLz5cblx0XHQ8L0JveD5cblx0KTtcbn1cblxuIiwiaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VNZW1vLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEFwaUNsaWVudCwgdHlwZSBBY3Rpb25Qcm9wcywgdXNlTm90aWNlLCB1c2VUcmFuc2xhdGlvbiB9IGZyb20gJ2FkbWluanMnO1xuaW1wb3J0IHsgQm94LCBCdXR0b24sIEZvcm1Hcm91cCwgTGFiZWwsIFNlbGVjdCwgVGV4dCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xuXG5jb25zdCBhcGkgPSBuZXcgQXBpQ2xpZW50KCk7XG5cbnR5cGUgT3B0aW9uID0geyBpZDogc3RyaW5nOyBsYWJlbDogc3RyaW5nIH07XG5cbmNvbnN0IGFjdGlvbkJ1dHRvblN0eWxlID0ge1xuXHRib3JkZXJDb2xvcjogJ3doaXRlJyxcblx0YmFja2dyb3VuZDogJyNmYWNjMTUnLFxuXHRjb2xvcjogJ2JsYWNrJyxcbn07XG5cbmNvbnN0IHJlc29sdmVSZWNvcmRJZHMgPSAocmVjb3JkczogQWN0aW9uUHJvcHNbJ3JlY29yZHMnXSkgPT4ge1xuXHRjb25zdCBmcm9tUHJvcHMgPSAocmVjb3JkcyA/PyBbXSkubWFwKChyKSA9PiByLmlkKS5maWx0ZXIoQm9vbGVhbikgYXMgc3RyaW5nW107XG5cdGlmIChmcm9tUHJvcHMubGVuZ3RoKSByZXR1cm4gZnJvbVByb3BzO1xuXHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybiBbXTtcblx0Y29uc3QgcmF3ID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKS5nZXQoJ3JlY29yZElkcycpID8/ICcnO1xuXHRyZXR1cm4gcmF3XG5cdFx0LnNwbGl0KCcsJylcblx0XHQubWFwKChpZCkgPT4gaWQudHJpbSgpKVxuXHRcdC5maWx0ZXIoQm9vbGVhbik7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBQcm9kdWN0QnVsa1NldENhdGVnb3J5QWN0aW9uKHsgYWN0aW9uLCByZXNvdXJjZSwgcmVjb3JkcyB9OiBBY3Rpb25Qcm9wcykge1xuXHRjb25zdCBhZGROb3RpY2UgPSB1c2VOb3RpY2UoKTtcblx0Y29uc3QgeyB0cmFuc2xhdGVBY3Rpb24sIHRyYW5zbGF0ZU1lc3NhZ2UgfSA9IHVzZVRyYW5zbGF0aW9uKCk7XG5cblx0Y29uc3QgcmVjb3JkSWRzID0gdXNlTWVtbygoKSA9PiByZXNvbHZlUmVjb3JkSWRzKHJlY29yZHMpLCBbcmVjb3Jkc10pO1xuXHRjb25zdCBbb3B0aW9ucywgc2V0T3B0aW9uc10gPSB1c2VTdGF0ZTxPcHRpb25bXT4oW10pO1xuXHRjb25zdCBbY2F0ZWdvcnlJZCwgc2V0Q2F0ZWdvcnlJZF0gPSB1c2VTdGF0ZSgnJyk7XG5cdGNvbnN0IFtzYXZpbmcsIHNldFNhdmluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG5cdGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuXHR1c2VFZmZlY3QoKCkgPT4ge1xuXHRcdGlmICghcmVjb3JkSWRzLmxlbmd0aCkgcmV0dXJuO1xuXHRcdHNldExvYWRpbmcodHJ1ZSk7XG5cdFx0YXBpLmJ1bGtBY3Rpb24oeyByZXNvdXJjZUlkOiByZXNvdXJjZS5pZCwgcmVjb3JkSWRzLCBhY3Rpb25OYW1lOiBhY3Rpb24ubmFtZSwgbWV0aG9kOiAnZ2V0JyB9KVxuXHRcdFx0LnRoZW4oKHJlcykgPT4gc2V0T3B0aW9ucygoKHJlcy5kYXRhIGFzIGFueSkucGF5bG9hZD8ub3B0aW9ucyA/PyBbXSkgYXMgT3B0aW9uW10pKVxuXHRcdFx0LmNhdGNoKCgpID0+IHNldE9wdGlvbnMoW10pKVxuXHRcdFx0LmZpbmFsbHkoKCkgPT4gc2V0TG9hZGluZyhmYWxzZSkpO1xuXHR9LCBbYWN0aW9uLm5hbWUsIHJlY29yZElkcywgcmVzb3VyY2UuaWRdKTtcblxuXHRjb25zdCB0aXRsZSA9IHRyYW5zbGF0ZUFjdGlvbihhY3Rpb24ubmFtZSwgcmVzb3VyY2UuaWQpO1xuXG5cdGNvbnN0IGhhc09wdGlvbnMgPSBvcHRpb25zLmxlbmd0aCA+IDA7XG5cdGNvbnN0IGNhblNhdmUgPSAhbG9hZGluZyAmJiBoYXNPcHRpb25zICYmIGNhdGVnb3J5SWQudHJpbSgpLmxlbmd0aCA+IDAgJiYgcmVjb3JkSWRzLmxlbmd0aCA+IDA7XG5cblx0Y29uc3QgaGFuZGxlU2F2ZSA9IGFzeW5jICgpID0+IHtcblx0XHRpZiAoIWNhblNhdmUgfHwgc2F2aW5nKSByZXR1cm47XG5cdFx0c2V0U2F2aW5nKHRydWUpO1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuXHRcdFx0Zm9ybURhdGEuYXBwZW5kKCdjYXRlZ29yeUlkJywgY2F0ZWdvcnlJZCk7XG5cdFx0XHRjb25zdCByZXNwb25zZSA9IGF3YWl0IGFwaS5idWxrQWN0aW9uKHtcblx0XHRcdFx0cmVzb3VyY2VJZDogcmVzb3VyY2UuaWQsXG5cdFx0XHRcdHJlY29yZElkcyxcblx0XHRcdFx0YWN0aW9uTmFtZTogYWN0aW9uLm5hbWUsXG5cdFx0XHRcdG1ldGhvZDogJ3Bvc3QnLFxuXHRcdFx0XHRkYXRhOiBmb3JtRGF0YSxcblx0XHRcdH0pO1xuXHRcdFx0aWYgKHJlc3BvbnNlLmRhdGEubm90aWNlKSBhZGROb3RpY2UocmVzcG9uc2UuZGF0YS5ub3RpY2UpO1xuXHRcdH0gY2F0Y2gge1xuXHRcdFx0YWRkTm90aWNlKHsgbWVzc2FnZTogJ3Byb2R1Y3QtYnVsay1mYWlsZWQnLCB0eXBlOiAnZXJyb3InIH0pO1xuXHRcdH0gZmluYWxseSB7XG5cdFx0XHRzZXRTYXZpbmcoZmFsc2UpO1xuXHRcdH1cblx0fTtcblxuXHRyZXR1cm4gKFxuXHRcdDxCb3ggdmFyaWFudD0nd2hpdGUnIHA9J3h4bCcgYm9yZGVyUmFkaXVzPSd4bCcgYm94U2hhZG93PSdzbScgc3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnIH19PlxuXHRcdFx0PFRleHQgZm9udFNpemU9J3hsJyBmb250V2VpZ2h0PSdib2xkJyBtYj0nbWQnPlxuXHRcdFx0XHR7dGl0bGV9XG5cdFx0XHQ8L1RleHQ+XG5cdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJyBtYj0neGwnPlxuXHRcdFx0XHR7dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1idWxrLXNlbGVjdGVkJywgeyBjb3VudDogcmVjb3JkSWRzLmxlbmd0aCB9KX1cblx0XHRcdDwvVGV4dD5cblxuXHRcdFx0e2xvYWRpbmcgPyAoXG5cdFx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnIG1iPSd4bCc+XG5cdFx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtYnVsay1vcHRpb25zLWxvYWRpbmcnKX1cblx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0KSA6IGhhc09wdGlvbnMgPyAoXG5cdFx0XHRcdDxGb3JtR3JvdXA+XG5cdFx0XHRcdFx0PExhYmVsPnt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWJ1bGstY2F0ZWdvcnknKX08L0xhYmVsPlxuXHRcdFx0XHRcdDxTZWxlY3QgdmFsdWU9e2NhdGVnb3J5SWR9IG9uQ2hhbmdlPXsoZTogYW55KSA9PiBzZXRDYXRlZ29yeUlkKFN0cmluZyhlPy50YXJnZXQ/LnZhbHVlID8/ICcnKSl9PlxuXHRcdFx0XHRcdFx0PG9wdGlvbiB2YWx1ZT0nJz57dHJhbnNsYXRlTWVzc2FnZSgnc2VsZWN0LXBsYWNlaG9sZGVyJyl9PC9vcHRpb24+XG5cdFx0XHRcdFx0XHR7b3B0aW9ucy5tYXAoKG8pID0+IChcblx0XHRcdFx0XHRcdFx0PG9wdGlvbiBrZXk9e28uaWR9IHZhbHVlPXtvLmlkfT5cblx0XHRcdFx0XHRcdFx0XHR7by5sYWJlbH1cblx0XHRcdFx0XHRcdFx0PC9vcHRpb24+XG5cdFx0XHRcdFx0XHQpKX1cblx0XHRcdFx0XHQ8L1NlbGVjdD5cblx0XHRcdFx0PC9Gb3JtR3JvdXA+XG5cdFx0XHQpIDogKFxuXHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJyBtYj0neGwnPlxuXHRcdFx0XHRcdHt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWJ1bGstbm8tb3B0aW9ucycpfVxuXHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHQpfVxuXG5cdFx0XHR7aGFzT3B0aW9ucyA/IChcblx0XHRcdFx0PEJveCBtdD0neGwnPlxuXHRcdFx0XHRcdDxCdXR0b25cblx0XHRcdFx0XHRcdHZhcmlhbnQ9J2NvbnRhaW5lZCdcblx0XHRcdFx0XHRcdGNvbG9yPSdwcmltYXJ5J1xuXHRcdFx0XHRcdFx0c3R5bGU9e2FjdGlvbkJ1dHRvblN0eWxlfVxuXHRcdFx0XHRcdFx0ZGlzYWJsZWQ9eyFjYW5TYXZlIHx8IHNhdmluZ31cblx0XHRcdFx0XHRcdG9uQ2xpY2s9e2hhbmRsZVNhdmV9XG5cdFx0XHRcdFx0PlxuXHRcdFx0XHRcdFx0e3NhdmluZyA/IHRyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtYnVsay1zYXZpbmcnKSA6IHRyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtYnVsay1hcHBseScpfVxuXHRcdFx0XHRcdDwvQnV0dG9uPlxuXHRcdFx0XHQ8L0JveD5cblx0XHRcdCkgOiBudWxsfVxuXHRcdDwvQm94PlxuXHQpO1xufVxuIiwiaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VNZW1vLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEFwaUNsaWVudCwgdHlwZSBBY3Rpb25Qcm9wcywgdXNlTm90aWNlLCB1c2VUcmFuc2xhdGlvbiB9IGZyb20gJ2FkbWluanMnO1xuaW1wb3J0IHsgQm94LCBCdXR0b24sIEZvcm1Hcm91cCwgTGFiZWwsIFNlbGVjdCwgVGV4dCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xuXG5jb25zdCBhcGkgPSBuZXcgQXBpQ2xpZW50KCk7XG5cbnR5cGUgT3B0aW9uID0geyBpZDogc3RyaW5nOyBsYWJlbDogc3RyaW5nIH07XG5cbmNvbnN0IGFjdGlvbkJ1dHRvblN0eWxlID0ge1xuXHRib3JkZXJDb2xvcjogJ3doaXRlJyxcblx0YmFja2dyb3VuZDogJyNmYWNjMTUnLFxuXHRjb2xvcjogJ2JsYWNrJyxcbn07XG5cbmNvbnN0IHJlc29sdmVSZWNvcmRJZHMgPSAocmVjb3JkczogQWN0aW9uUHJvcHNbJ3JlY29yZHMnXSkgPT4ge1xuXHRjb25zdCBmcm9tUHJvcHMgPSAocmVjb3JkcyA/PyBbXSkubWFwKChyKSA9PiByLmlkKS5maWx0ZXIoQm9vbGVhbikgYXMgc3RyaW5nW107XG5cdGlmIChmcm9tUHJvcHMubGVuZ3RoKSByZXR1cm4gZnJvbVByb3BzO1xuXHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybiBbXTtcblx0Y29uc3QgcmF3ID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKS5nZXQoJ3JlY29yZElkcycpID8/ICcnO1xuXHRyZXR1cm4gcmF3XG5cdFx0LnNwbGl0KCcsJylcblx0XHQubWFwKChpZCkgPT4gaWQudHJpbSgpKVxuXHRcdC5maWx0ZXIoQm9vbGVhbik7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBQcm9kdWN0QnVsa1NldEJyYW5kQWN0aW9uKHsgYWN0aW9uLCByZXNvdXJjZSwgcmVjb3JkcyB9OiBBY3Rpb25Qcm9wcykge1xuXHRjb25zdCBhZGROb3RpY2UgPSB1c2VOb3RpY2UoKTtcblx0Y29uc3QgeyB0cmFuc2xhdGVBY3Rpb24sIHRyYW5zbGF0ZU1lc3NhZ2UgfSA9IHVzZVRyYW5zbGF0aW9uKCk7XG5cblx0Y29uc3QgcmVjb3JkSWRzID0gdXNlTWVtbygoKSA9PiByZXNvbHZlUmVjb3JkSWRzKHJlY29yZHMpLCBbcmVjb3Jkc10pO1xuXHRjb25zdCBbb3B0aW9ucywgc2V0T3B0aW9uc10gPSB1c2VTdGF0ZTxPcHRpb25bXT4oW10pO1xuXHRjb25zdCBbYnJhbmRJZCwgc2V0QnJhbmRJZF0gPSB1c2VTdGF0ZSgnJyk7XG5cdGNvbnN0IFtzYXZpbmcsIHNldFNhdmluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG5cdGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuXHR1c2VFZmZlY3QoKCkgPT4ge1xuXHRcdGlmICghcmVjb3JkSWRzLmxlbmd0aCkgcmV0dXJuO1xuXHRcdHNldExvYWRpbmcodHJ1ZSk7XG5cdFx0YXBpLmJ1bGtBY3Rpb24oeyByZXNvdXJjZUlkOiByZXNvdXJjZS5pZCwgcmVjb3JkSWRzLCBhY3Rpb25OYW1lOiBhY3Rpb24ubmFtZSwgbWV0aG9kOiAnZ2V0JyB9KVxuXHRcdFx0LnRoZW4oKHJlcykgPT4gc2V0T3B0aW9ucygoKHJlcy5kYXRhIGFzIGFueSkucGF5bG9hZD8ub3B0aW9ucyA/PyBbXSkgYXMgT3B0aW9uW10pKVxuXHRcdFx0LmNhdGNoKCgpID0+IHNldE9wdGlvbnMoW10pKVxuXHRcdFx0LmZpbmFsbHkoKCkgPT4gc2V0TG9hZGluZyhmYWxzZSkpO1xuXHR9LCBbYWN0aW9uLm5hbWUsIHJlY29yZElkcywgcmVzb3VyY2UuaWRdKTtcblxuXHRjb25zdCB0aXRsZSA9IHRyYW5zbGF0ZUFjdGlvbihhY3Rpb24ubmFtZSwgcmVzb3VyY2UuaWQpO1xuXHRjb25zdCBoYXNPcHRpb25zID0gb3B0aW9ucy5sZW5ndGggPiAwO1xuXHRjb25zdCBjYW5TYXZlID0gIWxvYWRpbmcgJiYgaGFzT3B0aW9ucyAmJiBicmFuZElkLnRyaW0oKS5sZW5ndGggPiAwICYmIHJlY29yZElkcy5sZW5ndGggPiAwO1xuXG5cdGNvbnN0IGhhbmRsZVNhdmUgPSBhc3luYyAoKSA9PiB7XG5cdFx0aWYgKCFjYW5TYXZlIHx8IHNhdmluZykgcmV0dXJuO1xuXHRcdHNldFNhdmluZyh0cnVlKTtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcblx0XHRcdGZvcm1EYXRhLmFwcGVuZCgnYnJhbmRJZCcsIGJyYW5kSWQpO1xuXHRcdFx0Y29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhcGkuYnVsa0FjdGlvbih7XG5cdFx0XHRcdHJlc291cmNlSWQ6IHJlc291cmNlLmlkLFxuXHRcdFx0XHRyZWNvcmRJZHMsXG5cdFx0XHRcdGFjdGlvbk5hbWU6IGFjdGlvbi5uYW1lLFxuXHRcdFx0XHRtZXRob2Q6ICdwb3N0Jyxcblx0XHRcdFx0ZGF0YTogZm9ybURhdGEsXG5cdFx0XHR9KTtcblx0XHRcdGlmIChyZXNwb25zZS5kYXRhLm5vdGljZSkgYWRkTm90aWNlKHJlc3BvbnNlLmRhdGEubm90aWNlKTtcblx0XHR9IGNhdGNoIHtcblx0XHRcdGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdwcm9kdWN0LWJ1bGstZmFpbGVkJywgdHlwZTogJ2Vycm9yJyB9KTtcblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0c2V0U2F2aW5nKGZhbHNlKTtcblx0XHR9XG5cdH07XG5cblx0cmV0dXJuIChcblx0XHQ8Qm94IHZhcmlhbnQ9J3doaXRlJyBwPSd4eGwnIGJvcmRlclJhZGl1cz0neGwnIGJveFNoYWRvdz0nc20nIHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJyB9fT5cblx0XHRcdDxUZXh0IGZvbnRTaXplPSd4bCcgZm9udFdlaWdodD0nYm9sZCcgbWI9J21kJz5cblx0XHRcdFx0e3RpdGxlfVxuXHRcdFx0PC9UZXh0PlxuXHRcdFx0PFRleHQgY29sb3I9J2dyZXk2MCcgbWI9J3hsJz5cblx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtYnVsay1zZWxlY3RlZCcsIHsgY291bnQ6IHJlY29yZElkcy5sZW5ndGggfSl9XG5cdFx0XHQ8L1RleHQ+XG5cblx0XHRcdHtsb2FkaW5nID8gKFxuXHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJyBtYj0neGwnPlxuXHRcdFx0XHRcdHt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWJ1bGstb3B0aW9ucy1sb2FkaW5nJyl9XG5cdFx0XHRcdDwvVGV4dD5cblx0XHRcdCkgOiBoYXNPcHRpb25zID8gKFxuXHRcdFx0XHQ8Rm9ybUdyb3VwPlxuXHRcdFx0XHRcdDxMYWJlbD57dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1idWxrLWJyYW5kJyl9PC9MYWJlbD5cblx0XHRcdFx0XHQ8U2VsZWN0IHZhbHVlPXticmFuZElkfSBvbkNoYW5nZT17KGU6IGFueSkgPT4gc2V0QnJhbmRJZChTdHJpbmcoZT8udGFyZ2V0Py52YWx1ZSA/PyAnJykpfT5cblx0XHRcdFx0XHRcdDxvcHRpb24gdmFsdWU9Jyc+e3RyYW5zbGF0ZU1lc3NhZ2UoJ3NlbGVjdC1wbGFjZWhvbGRlcicpfTwvb3B0aW9uPlxuXHRcdFx0XHRcdFx0e29wdGlvbnMubWFwKChvKSA9PiAoXG5cdFx0XHRcdFx0XHRcdDxvcHRpb24ga2V5PXtvLmlkfSB2YWx1ZT17by5pZH0+XG5cdFx0XHRcdFx0XHRcdFx0e28ubGFiZWx9XG5cdFx0XHRcdFx0XHRcdDwvb3B0aW9uPlxuXHRcdFx0XHRcdFx0KSl9XG5cdFx0XHRcdFx0PC9TZWxlY3Q+XG5cdFx0XHRcdDwvRm9ybUdyb3VwPlxuXHRcdFx0KSA6IChcblx0XHRcdFx0PFRleHQgY29sb3I9J2dyZXk2MCcgbWI9J3hsJz5cblx0XHRcdFx0XHR7dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1idWxrLW5vLW9wdGlvbnMnKX1cblx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0KX1cblxuXHRcdFx0e2hhc09wdGlvbnMgPyAoXG5cdFx0XHRcdDxCb3ggbXQ9J3hsJz5cblx0XHRcdFx0XHQ8QnV0dG9uXG5cdFx0XHRcdFx0XHR2YXJpYW50PSdjb250YWluZWQnXG5cdFx0XHRcdFx0XHRjb2xvcj0ncHJpbWFyeSdcblx0XHRcdFx0XHRcdHN0eWxlPXthY3Rpb25CdXR0b25TdHlsZX1cblx0XHRcdFx0XHRcdGRpc2FibGVkPXshY2FuU2F2ZSB8fCBzYXZpbmd9XG5cdFx0XHRcdFx0XHRvbkNsaWNrPXtoYW5kbGVTYXZlfVxuXHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdHtzYXZpbmcgPyB0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWJ1bGstc2F2aW5nJykgOiB0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWJ1bGstYXBwbHknKX1cblx0XHRcdFx0XHQ8L0J1dHRvbj5cblx0XHRcdFx0PC9Cb3g+XG5cdFx0XHQpIDogbnVsbH1cblx0XHQ8L0JveD5cblx0KTtcbn1cbiIsImltcG9ydCB7IHVzZU1lbW8sIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQXBpQ2xpZW50LCB0eXBlIEFjdGlvblByb3BzLCB1c2VOb3RpY2UsIHVzZVRyYW5zbGF0aW9uIH0gZnJvbSAnYWRtaW5qcyc7XG5pbXBvcnQgeyBCb3gsIEJ1dHRvbiwgRm9ybUdyb3VwLCBMYWJlbCwgU2VsZWN0LCBUZXh0IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSc7XG5cbmNvbnN0IGFwaSA9IG5ldyBBcGlDbGllbnQoKTtcblxuY29uc3QgYWN0aW9uQnV0dG9uU3R5bGUgPSB7XG5cdGJvcmRlckNvbG9yOiAnd2hpdGUnLFxuXHRiYWNrZ3JvdW5kOiAnI2ZhY2MxNScsXG5cdGNvbG9yOiAnYmxhY2snLFxufTtcblxuY29uc3QgcmVzb2x2ZVJlY29yZElkcyA9IChyZWNvcmRzOiBBY3Rpb25Qcm9wc1sncmVjb3JkcyddKSA9PiB7XG5cdGNvbnN0IGZyb21Qcm9wcyA9IChyZWNvcmRzID8/IFtdKS5tYXAoKHIpID0+IHIuaWQpLmZpbHRlcihCb29sZWFuKSBhcyBzdHJpbmdbXTtcblx0aWYgKGZyb21Qcm9wcy5sZW5ndGgpIHJldHVybiBmcm9tUHJvcHM7XG5cdGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykgcmV0dXJuIFtdO1xuXHRjb25zdCByYXcgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpLmdldCgncmVjb3JkSWRzJykgPz8gJyc7XG5cdHJldHVybiByYXdcblx0XHQuc3BsaXQoJywnKVxuXHRcdC5tYXAoKGlkKSA9PiBpZC50cmltKCkpXG5cdFx0LmZpbHRlcihCb29sZWFuKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFByb2R1Y3RCdWxrRWRpdFRhZ3NBY3Rpb24oeyBhY3Rpb24sIHJlc291cmNlLCByZWNvcmRzIH06IEFjdGlvblByb3BzKSB7XG5cdGNvbnN0IGFkZE5vdGljZSA9IHVzZU5vdGljZSgpO1xuXHRjb25zdCB7IHRyYW5zbGF0ZUFjdGlvbiwgdHJhbnNsYXRlTWVzc2FnZSB9ID0gdXNlVHJhbnNsYXRpb24oKTtcblxuXHRjb25zdCByZWNvcmRJZHMgPSB1c2VNZW1vKCgpID0+IHJlc29sdmVSZWNvcmRJZHMocmVjb3JkcyksIFtyZWNvcmRzXSk7XG5cdGNvbnN0IFttb2RlLCBzZXRNb2RlXSA9IHVzZVN0YXRlPCdhZGQnIHwgJ3JlbW92ZScgfCAncmVwbGFjZSc+KCdhZGQnKTtcblx0Y29uc3QgW3RhZ3MsIHNldFRhZ3NdID0gdXNlU3RhdGUoJycpO1xuXHRjb25zdCBbc2F2aW5nLCBzZXRTYXZpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuXG5cdGNvbnN0IHRpdGxlID0gdHJhbnNsYXRlQWN0aW9uKGFjdGlvbi5uYW1lLCByZXNvdXJjZS5pZCk7XG5cdGNvbnN0IGNhblNhdmUgPSByZWNvcmRJZHMubGVuZ3RoID4gMCAmJiB0YWdzLnRyaW0oKS5sZW5ndGggPiAwO1xuXG5cdGNvbnN0IGhhbmRsZVNhdmUgPSBhc3luYyAoKSA9PiB7XG5cdFx0aWYgKCFjYW5TYXZlIHx8IHNhdmluZykgcmV0dXJuO1xuXHRcdHNldFNhdmluZyh0cnVlKTtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcblx0XHRcdGZvcm1EYXRhLmFwcGVuZCgnbW9kZScsIG1vZGUpO1xuXHRcdFx0Zm9ybURhdGEuYXBwZW5kKCd0YWdzJywgdGFncyk7XG5cdFx0XHRjb25zdCByZXNwb25zZSA9IGF3YWl0IGFwaS5idWxrQWN0aW9uKHtcblx0XHRcdFx0cmVzb3VyY2VJZDogcmVzb3VyY2UuaWQsXG5cdFx0XHRcdHJlY29yZElkcyxcblx0XHRcdFx0YWN0aW9uTmFtZTogYWN0aW9uLm5hbWUsXG5cdFx0XHRcdG1ldGhvZDogJ3Bvc3QnLFxuXHRcdFx0XHRkYXRhOiBmb3JtRGF0YSxcblx0XHRcdH0pO1xuXHRcdFx0aWYgKHJlc3BvbnNlLmRhdGEubm90aWNlKSBhZGROb3RpY2UocmVzcG9uc2UuZGF0YS5ub3RpY2UpO1xuXHRcdH0gY2F0Y2gge1xuXHRcdFx0YWRkTm90aWNlKHsgbWVzc2FnZTogJ3Byb2R1Y3QtYnVsay1mYWlsZWQnLCB0eXBlOiAnZXJyb3InIH0pO1xuXHRcdH0gZmluYWxseSB7XG5cdFx0XHRzZXRTYXZpbmcoZmFsc2UpO1xuXHRcdH1cblx0fTtcblxuXHRyZXR1cm4gKFxuXHRcdDxCb3ggdmFyaWFudD0nd2hpdGUnIHA9J3h4bCcgYm9yZGVyUmFkaXVzPSd4bCcgYm94U2hhZG93PSdzbScgc3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnIH19PlxuXHRcdFx0PFRleHQgZm9udFNpemU9J3hsJyBmb250V2VpZ2h0PSdib2xkJyBtYj0nbWQnPlxuXHRcdFx0XHR7dGl0bGV9XG5cdFx0XHQ8L1RleHQ+XG5cdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJyBtYj0neGwnPlxuXHRcdFx0XHR7dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1idWxrLXNlbGVjdGVkJywgeyBjb3VudDogcmVjb3JkSWRzLmxlbmd0aCB9KX1cblx0XHRcdDwvVGV4dD5cblxuXHRcdFx0PEZvcm1Hcm91cD5cblx0XHRcdFx0PExhYmVsPnt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWJ1bGstdGFncy1tb2RlJyl9PC9MYWJlbD5cblx0XHRcdFx0PFNlbGVjdCB2YWx1ZT17bW9kZX0gb25DaGFuZ2U9eyhlOiBhbnkpID0+IHNldE1vZGUoU3RyaW5nKGU/LnRhcmdldD8udmFsdWUgPz8gJ2FkZCcpIGFzIGFueSl9PlxuXHRcdFx0XHRcdDxvcHRpb24gdmFsdWU9J2FkZCc+e3RyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtYnVsay10YWdzLWFkZCcpfTwvb3B0aW9uPlxuXHRcdFx0XHRcdDxvcHRpb24gdmFsdWU9J3JlbW92ZSc+e3RyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtYnVsay10YWdzLXJlbW92ZScpfTwvb3B0aW9uPlxuXHRcdFx0XHRcdDxvcHRpb24gdmFsdWU9J3JlcGxhY2UnPnt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWJ1bGstdGFncy1yZXBsYWNlJyl9PC9vcHRpb24+XG5cdFx0XHRcdDwvU2VsZWN0PlxuXHRcdFx0PC9Gb3JtR3JvdXA+XG5cblx0XHRcdDxGb3JtR3JvdXA+XG5cdFx0XHRcdDxMYWJlbD57dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1idWxrLXRhZ3MnKX08L0xhYmVsPlxuXHRcdFx0XHQ8aW5wdXRcblx0XHRcdFx0XHR2YWx1ZT17dGFnc31cblx0XHRcdFx0XHRvbkNoYW5nZT17KGUpID0+IHNldFRhZ3MoZS50YXJnZXQudmFsdWUpfVxuXHRcdFx0XHRcdHBsYWNlaG9sZGVyPSdwb3B1bGFyLG5ldydcblx0XHRcdFx0XHRzdHlsZT17e1xuXHRcdFx0XHRcdFx0d2lkdGg6ICcxMDAlJyxcblx0XHRcdFx0XHRcdHBhZGRpbmc6ICcxMHB4IDEycHgnLFxuXHRcdFx0XHRcdFx0Ym9yZGVyUmFkaXVzOiA4LFxuXHRcdFx0XHRcdFx0Ym9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnLFxuXHRcdFx0XHRcdFx0Zm9udFNpemU6IDE0LFxuXHRcdFx0XHRcdH19XG5cdFx0XHRcdC8+XG5cdFx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnIG10PSdkZWZhdWx0Jz5cblx0XHRcdFx0XHR7dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1idWxrLXRhZ3MtaGludCcpfVxuXHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHQ8L0Zvcm1Hcm91cD5cblxuXHRcdFx0PEJveCBtdD0neGwnPlxuXHRcdFx0XHQ8QnV0dG9uIHZhcmlhbnQ9J2NvbnRhaW5lZCcgY29sb3I9J3ByaW1hcnknIHN0eWxlPXthY3Rpb25CdXR0b25TdHlsZX0gZGlzYWJsZWQ9eyFjYW5TYXZlIHx8IHNhdmluZ30gb25DbGljaz17aGFuZGxlU2F2ZX0+XG5cdFx0XHRcdFx0e3NhdmluZyA/IHRyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtYnVsay1zYXZpbmcnKSA6IHRyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtYnVsay1hcHBseScpfVxuXHRcdFx0XHQ8L0J1dHRvbj5cblx0XHRcdDwvQm94PlxuXHRcdDwvQm94PlxuXHQpO1xufVxuIiwiaW1wb3J0IHsgdXNlTWVtbywgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBBcGlDbGllbnQsIHR5cGUgQWN0aW9uUHJvcHMsIHVzZU5vdGljZSwgdXNlVHJhbnNsYXRpb24gfSBmcm9tICdhZG1pbmpzJztcbmltcG9ydCB7IEJveCwgQnV0dG9uLCBGb3JtR3JvdXAsIExhYmVsLCBTZWxlY3QsIFRleHQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcblxuY29uc3QgYXBpID0gbmV3IEFwaUNsaWVudCgpO1xuXG5jb25zdCBhY3Rpb25CdXR0b25TdHlsZSA9IHtcblx0Ym9yZGVyQ29sb3I6ICd3aGl0ZScsXG5cdGJhY2tncm91bmQ6ICcjZmFjYzE1Jyxcblx0Y29sb3I6ICdibGFjaycsXG59O1xuXG5jb25zdCByZXNvbHZlUmVjb3JkSWRzID0gKHJlY29yZHM6IEFjdGlvblByb3BzWydyZWNvcmRzJ10pID0+IHtcblx0Y29uc3QgZnJvbVByb3BzID0gKHJlY29yZHMgPz8gW10pLm1hcCgocikgPT4gci5pZCkuZmlsdGVyKEJvb2xlYW4pIGFzIHN0cmluZ1tdO1xuXHRpZiAoZnJvbVByb3BzLmxlbmd0aCkgcmV0dXJuIGZyb21Qcm9wcztcblx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSByZXR1cm4gW107XG5cdGNvbnN0IHJhdyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCkuZ2V0KCdyZWNvcmRJZHMnKSA/PyAnJztcblx0cmV0dXJuIHJhd1xuXHRcdC5zcGxpdCgnLCcpXG5cdFx0Lm1hcCgoaWQpID0+IGlkLnRyaW0oKSlcblx0XHQuZmlsdGVyKEJvb2xlYW4pO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUHJvZHVjdEJ1bGtBZGp1c3RQcmljZUFjdGlvbih7IGFjdGlvbiwgcmVzb3VyY2UsIHJlY29yZHMgfTogQWN0aW9uUHJvcHMpIHtcblx0Y29uc3QgYWRkTm90aWNlID0gdXNlTm90aWNlKCk7XG5cdGNvbnN0IHsgdHJhbnNsYXRlQWN0aW9uLCB0cmFuc2xhdGVNZXNzYWdlIH0gPSB1c2VUcmFuc2xhdGlvbigpO1xuXG5cdGNvbnN0IHJlY29yZElkcyA9IHVzZU1lbW8oKCkgPT4gcmVzb2x2ZVJlY29yZElkcyhyZWNvcmRzKSwgW3JlY29yZHNdKTtcblx0Y29uc3QgW2RpcmVjdGlvbiwgc2V0RGlyZWN0aW9uXSA9IHVzZVN0YXRlPCdpbmNyZWFzZScgfCAnZGVjcmVhc2UnPignaW5jcmVhc2UnKTtcblx0Y29uc3QgW2tpbmQsIHNldEtpbmRdID0gdXNlU3RhdGU8J3BlcmNlbnQnIHwgJ2ZpeGVkJz4oJ3BlcmNlbnQnKTtcblx0Y29uc3QgW3ZhbHVlLCBzZXRWYWx1ZV0gPSB1c2VTdGF0ZSgnMTAnKTtcblx0Y29uc3QgW2FwcGx5VG9EaXNjb3VudCwgc2V0QXBwbHlUb0Rpc2NvdW50XSA9IHVzZVN0YXRlKGZhbHNlKTtcblx0Y29uc3QgW3NhdmluZywgc2V0U2F2aW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuXHRjb25zdCB0aXRsZSA9IHRyYW5zbGF0ZUFjdGlvbihhY3Rpb24ubmFtZSwgcmVzb3VyY2UuaWQpO1xuXHRjb25zdCBwYXJzZWRWYWx1ZSA9IE51bWJlcih2YWx1ZSk7XG5cdGNvbnN0IGNhblNhdmUgPSByZWNvcmRJZHMubGVuZ3RoID4gMCAmJiBOdW1iZXIuaXNGaW5pdGUocGFyc2VkVmFsdWUpICYmIHBhcnNlZFZhbHVlID4gMDtcblxuXHRjb25zdCBoYW5kbGVTYXZlID0gYXN5bmMgKCkgPT4ge1xuXHRcdGlmICghY2FuU2F2ZSB8fCBzYXZpbmcpIHJldHVybjtcblx0XHRzZXRTYXZpbmcodHJ1ZSk7XG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG5cdFx0XHRmb3JtRGF0YS5hcHBlbmQoJ2RpcmVjdGlvbicsIGRpcmVjdGlvbik7XG5cdFx0XHRmb3JtRGF0YS5hcHBlbmQoJ2tpbmQnLCBraW5kKTtcblx0XHRcdGZvcm1EYXRhLmFwcGVuZCgndmFsdWUnLCB2YWx1ZSk7XG5cdFx0XHRmb3JtRGF0YS5hcHBlbmQoJ2FwcGx5VG9EaXNjb3VudCcsIFN0cmluZyhhcHBseVRvRGlzY291bnQpKTtcblx0XHRcdGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXBpLmJ1bGtBY3Rpb24oe1xuXHRcdFx0XHRyZXNvdXJjZUlkOiByZXNvdXJjZS5pZCxcblx0XHRcdFx0cmVjb3JkSWRzLFxuXHRcdFx0XHRhY3Rpb25OYW1lOiBhY3Rpb24ubmFtZSxcblx0XHRcdFx0bWV0aG9kOiAncG9zdCcsXG5cdFx0XHRcdGRhdGE6IGZvcm1EYXRhLFxuXHRcdFx0fSk7XG5cdFx0XHRpZiAocmVzcG9uc2UuZGF0YS5ub3RpY2UpIGFkZE5vdGljZShyZXNwb25zZS5kYXRhLm5vdGljZSk7XG5cdFx0fSBjYXRjaCB7XG5cdFx0XHRhZGROb3RpY2UoeyBtZXNzYWdlOiAncHJvZHVjdC1idWxrLWZhaWxlZCcsIHR5cGU6ICdlcnJvcicgfSk7XG5cdFx0fSBmaW5hbGx5IHtcblx0XHRcdHNldFNhdmluZyhmYWxzZSk7XG5cdFx0fVxuXHR9O1xuXG5cdHJldHVybiAoXG5cdFx0PEJveCB2YXJpYW50PSd3aGl0ZScgcD0neHhsJyBib3JkZXJSYWRpdXM9J3hsJyBib3hTaGFkb3c9J3NtJyBzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQgI0UyRThGMCcgfX0+XG5cdFx0XHQ8VGV4dCBmb250U2l6ZT0neGwnIGZvbnRXZWlnaHQ9J2JvbGQnIG1iPSdtZCc+XG5cdFx0XHRcdHt0aXRsZX1cblx0XHRcdDwvVGV4dD5cblx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnIG1iPSd4bCc+XG5cdFx0XHRcdHt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWJ1bGstc2VsZWN0ZWQnLCB7IGNvdW50OiByZWNvcmRJZHMubGVuZ3RoIH0pfVxuXHRcdFx0PC9UZXh0PlxuXG5cdFx0XHQ8Qm94IHN0eWxlPXt7IGRpc3BsYXk6ICdncmlkJywgZ3JpZFRlbXBsYXRlQ29sdW1uczogJ3JlcGVhdChhdXRvLWZpdCwgbWlubWF4KDIyMHB4LCAxZnIpKScsIGdhcDogMTIgfX0+XG5cdFx0XHRcdDxGb3JtR3JvdXA+XG5cdFx0XHRcdFx0PExhYmVsPnt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWJ1bGstcHJpY2UtZGlyZWN0aW9uJyl9PC9MYWJlbD5cblx0XHRcdFx0XHQ8U2VsZWN0IHZhbHVlPXtkaXJlY3Rpb259IG9uQ2hhbmdlPXsoZTogYW55KSA9PiBzZXREaXJlY3Rpb24oU3RyaW5nKGU/LnRhcmdldD8udmFsdWUgPz8gJ2luY3JlYXNlJykgYXMgYW55KX0+XG5cdFx0XHRcdFx0XHQ8b3B0aW9uIHZhbHVlPSdpbmNyZWFzZSc+e3RyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtYnVsay1wcmljZS1pbmNyZWFzZScpfTwvb3B0aW9uPlxuXHRcdFx0XHRcdFx0PG9wdGlvbiB2YWx1ZT0nZGVjcmVhc2UnPnt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWJ1bGstcHJpY2UtZGVjcmVhc2UnKX08L29wdGlvbj5cblx0XHRcdFx0XHQ8L1NlbGVjdD5cblx0XHRcdFx0PC9Gb3JtR3JvdXA+XG5cdFx0XHRcdDxGb3JtR3JvdXA+XG5cdFx0XHRcdFx0PExhYmVsPnt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWJ1bGstcHJpY2Uta2luZCcpfTwvTGFiZWw+XG5cdFx0XHRcdFx0PFNlbGVjdCB2YWx1ZT17a2luZH0gb25DaGFuZ2U9eyhlOiBhbnkpID0+IHNldEtpbmQoU3RyaW5nKGU/LnRhcmdldD8udmFsdWUgPz8gJ3BlcmNlbnQnKSBhcyBhbnkpfT5cblx0XHRcdFx0XHRcdDxvcHRpb24gdmFsdWU9J3BlcmNlbnQnPnt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWJ1bGstcHJpY2UtcGVyY2VudCcpfTwvb3B0aW9uPlxuXHRcdFx0XHRcdFx0PG9wdGlvbiB2YWx1ZT0nZml4ZWQnPnt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWJ1bGstcHJpY2UtZml4ZWQnKX08L29wdGlvbj5cblx0XHRcdFx0XHQ8L1NlbGVjdD5cblx0XHRcdFx0PC9Gb3JtR3JvdXA+XG5cdFx0XHRcdDxGb3JtR3JvdXA+XG5cdFx0XHRcdFx0PExhYmVsPnt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWJ1bGstcHJpY2UtdmFsdWUnKX08L0xhYmVsPlxuXHRcdFx0XHRcdDxpbnB1dFxuXHRcdFx0XHRcdFx0dHlwZT0nbnVtYmVyJ1xuXHRcdFx0XHRcdFx0c3RlcD0nMC4wMSdcblx0XHRcdFx0XHRcdHZhbHVlPXt2YWx1ZX1cblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsoZSkgPT4gc2V0VmFsdWUoZS50YXJnZXQudmFsdWUpfVxuXHRcdFx0XHRcdFx0c3R5bGU9e3tcblx0XHRcdFx0XHRcdFx0d2lkdGg6ICcxMDAlJyxcblx0XHRcdFx0XHRcdFx0cGFkZGluZzogJzEwcHggMTJweCcsXG5cdFx0XHRcdFx0XHRcdGJvcmRlclJhZGl1czogOCxcblx0XHRcdFx0XHRcdFx0Ym9yZGVyOiAnMXB4IHNvbGlkICNFMkU4RjAnLFxuXHRcdFx0XHRcdFx0XHRmb250U2l6ZTogMTQsXG5cdFx0XHRcdFx0XHR9fVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdDwvRm9ybUdyb3VwPlxuXHRcdFx0PC9Cb3g+XG5cblx0XHRcdDxCb3ggbXQ9J2xnJz5cblx0XHRcdFx0PGxhYmVsIHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZ2FwOiAxMCwgYWxpZ25JdGVtczogJ2NlbnRlcicgfX0+XG5cdFx0XHRcdFx0PGlucHV0IHR5cGU9J2NoZWNrYm94JyBjaGVja2VkPXthcHBseVRvRGlzY291bnR9IG9uQ2hhbmdlPXsoZSkgPT4gc2V0QXBwbHlUb0Rpc2NvdW50KGUudGFyZ2V0LmNoZWNrZWQpfSAvPlxuXHRcdFx0XHRcdDxUZXh0Pnt0cmFuc2xhdGVNZXNzYWdlKCdwcm9kdWN0LWJ1bGstcHJpY2UtYXBwbHktZGlzY291bnQnKX08L1RleHQ+XG5cdFx0XHRcdDwvbGFiZWw+XG5cdFx0XHQ8L0JveD5cblxuXHRcdFx0PEJveCBtdD0neGwnPlxuXHRcdFx0XHQ8QnV0dG9uIHZhcmlhbnQ9J2NvbnRhaW5lZCcgY29sb3I9J3ByaW1hcnknIHN0eWxlPXthY3Rpb25CdXR0b25TdHlsZX0gZGlzYWJsZWQ9eyFjYW5TYXZlIHx8IHNhdmluZ30gb25DbGljaz17aGFuZGxlU2F2ZX0+XG5cdFx0XHRcdFx0e3NhdmluZyA/IHRyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtYnVsay1zYXZpbmcnKSA6IHRyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtYnVsay1hcHBseScpfVxuXHRcdFx0XHQ8L0J1dHRvbj5cblx0XHRcdDwvQm94PlxuXHRcdDwvQm94PlxuXHQpO1xufVxuIiwiaW1wb3J0IHsgdXNlTWVtbywgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBBcGlDbGllbnQsIHR5cGUgQWN0aW9uUHJvcHMsIHVzZU5vdGljZSwgdXNlVHJhbnNsYXRpb24gfSBmcm9tICdhZG1pbmpzJztcbmltcG9ydCB7IEJveCwgQnV0dG9uLCBGb3JtR3JvdXAsIExhYmVsLCBTZWxlY3QsIFRleHQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcblxuY29uc3QgYXBpID0gbmV3IEFwaUNsaWVudCgpO1xuXG5jb25zdCBhY3Rpb25CdXR0b25TdHlsZSA9IHtcblx0Ym9yZGVyQ29sb3I6ICd3aGl0ZScsXG5cdGJhY2tncm91bmQ6ICcjZmFjYzE1Jyxcblx0Y29sb3I6ICdibGFjaycsXG59O1xuXG5jb25zdCByZXNvbHZlUmVjb3JkSWRzID0gKHJlY29yZHM6IEFjdGlvblByb3BzWydyZWNvcmRzJ10pID0+IHtcblx0Y29uc3QgZnJvbVByb3BzID0gKHJlY29yZHMgPz8gW10pLm1hcCgocikgPT4gci5pZCkuZmlsdGVyKEJvb2xlYW4pIGFzIHN0cmluZ1tdO1xuXHRpZiAoZnJvbVByb3BzLmxlbmd0aCkgcmV0dXJuIGZyb21Qcm9wcztcblx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSByZXR1cm4gW107XG5cdGNvbnN0IHJhdyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCkuZ2V0KCdyZWNvcmRJZHMnKSA/PyAnJztcblx0cmV0dXJuIHJhd1xuXHRcdC5zcGxpdCgnLCcpXG5cdFx0Lm1hcCgoaWQpID0+IGlkLnRyaW0oKSlcblx0XHQuZmlsdGVyKEJvb2xlYW4pO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUHJvZHVjdEJ1bGtUb2dnbGVJblN0b2NrQWN0aW9uKHsgYWN0aW9uLCByZXNvdXJjZSwgcmVjb3JkcyB9OiBBY3Rpb25Qcm9wcykge1xuXHRjb25zdCBhZGROb3RpY2UgPSB1c2VOb3RpY2UoKTtcblx0Y29uc3QgeyB0cmFuc2xhdGVBY3Rpb24sIHRyYW5zbGF0ZU1lc3NhZ2UgfSA9IHVzZVRyYW5zbGF0aW9uKCk7XG5cblx0Y29uc3QgcmVjb3JkSWRzID0gdXNlTWVtbygoKSA9PiByZXNvbHZlUmVjb3JkSWRzKHJlY29yZHMpLCBbcmVjb3Jkc10pO1xuXHRjb25zdCBbbW9kZSwgc2V0TW9kZV0gPSB1c2VTdGF0ZTwndG9nZ2xlJyB8ICdzZXQnPigndG9nZ2xlJyk7XG5cdGNvbnN0IFt2YWx1ZSwgc2V0VmFsdWVdID0gdXNlU3RhdGU8J3RydWUnIHwgJ2ZhbHNlJz4oJ3RydWUnKTtcblx0Y29uc3QgW3NhdmluZywgc2V0U2F2aW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuXHRjb25zdCB0aXRsZSA9IHRyYW5zbGF0ZUFjdGlvbihhY3Rpb24ubmFtZSwgcmVzb3VyY2UuaWQpO1xuXHRjb25zdCBjYW5TYXZlID0gcmVjb3JkSWRzLmxlbmd0aCA+IDA7XG5cblx0Y29uc3QgaGFuZGxlU2F2ZSA9IGFzeW5jICgpID0+IHtcblx0XHRpZiAoIWNhblNhdmUgfHwgc2F2aW5nKSByZXR1cm47XG5cdFx0c2V0U2F2aW5nKHRydWUpO1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuXHRcdFx0Zm9ybURhdGEuYXBwZW5kKCdtb2RlJywgbW9kZSk7XG5cdFx0XHRmb3JtRGF0YS5hcHBlbmQoJ3ZhbHVlJywgdmFsdWUpO1xuXHRcdFx0Y29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhcGkuYnVsa0FjdGlvbih7XG5cdFx0XHRcdHJlc291cmNlSWQ6IHJlc291cmNlLmlkLFxuXHRcdFx0XHRyZWNvcmRJZHMsXG5cdFx0XHRcdGFjdGlvbk5hbWU6IGFjdGlvbi5uYW1lLFxuXHRcdFx0XHRtZXRob2Q6ICdwb3N0Jyxcblx0XHRcdFx0ZGF0YTogZm9ybURhdGEsXG5cdFx0XHR9KTtcblx0XHRcdGlmIChyZXNwb25zZS5kYXRhLm5vdGljZSkgYWRkTm90aWNlKHJlc3BvbnNlLmRhdGEubm90aWNlKTtcblx0XHR9IGNhdGNoIHtcblx0XHRcdGFkZE5vdGljZSh7IG1lc3NhZ2U6ICdwcm9kdWN0LWJ1bGstZmFpbGVkJywgdHlwZTogJ2Vycm9yJyB9KTtcblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0c2V0U2F2aW5nKGZhbHNlKTtcblx0XHR9XG5cdH07XG5cblx0cmV0dXJuIChcblx0XHQ8Qm94IHZhcmlhbnQ9J3doaXRlJyBwPSd4eGwnIGJvcmRlclJhZGl1cz0neGwnIGJveFNoYWRvdz0nc20nIHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJyB9fT5cblx0XHRcdDxUZXh0IGZvbnRTaXplPSd4bCcgZm9udFdlaWdodD0nYm9sZCcgbWI9J21kJz5cblx0XHRcdFx0e3RpdGxlfVxuXHRcdFx0PC9UZXh0PlxuXHRcdFx0PFRleHQgY29sb3I9J2dyZXk2MCcgbWI9J3hsJz5cblx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtYnVsay1zZWxlY3RlZCcsIHsgY291bnQ6IHJlY29yZElkcy5sZW5ndGggfSl9XG5cdFx0XHQ8L1RleHQ+XG5cblx0XHRcdDxGb3JtR3JvdXA+XG5cdFx0XHRcdDxMYWJlbD57dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1idWxrLXN0b2NrLW1vZGUnKX08L0xhYmVsPlxuXHRcdFx0XHQ8U2VsZWN0IHZhbHVlPXttb2RlfSBvbkNoYW5nZT17KGU6IGFueSkgPT4gc2V0TW9kZShTdHJpbmcoZT8udGFyZ2V0Py52YWx1ZSA/PyAndG9nZ2xlJykgYXMgYW55KX0+XG5cdFx0XHRcdFx0PG9wdGlvbiB2YWx1ZT0ndG9nZ2xlJz57dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1idWxrLXN0b2NrLXRvZ2dsZScpfTwvb3B0aW9uPlxuXHRcdFx0XHRcdDxvcHRpb24gdmFsdWU9J3NldCc+e3RyYW5zbGF0ZU1lc3NhZ2UoJ3Byb2R1Y3QtYnVsay1zdG9jay1zZXQnKX08L29wdGlvbj5cblx0XHRcdFx0PC9TZWxlY3Q+XG5cdFx0XHQ8L0Zvcm1Hcm91cD5cblxuXHRcdFx0e21vZGUgPT09ICdzZXQnID8gKFxuXHRcdFx0XHQ8Rm9ybUdyb3VwPlxuXHRcdFx0XHRcdDxMYWJlbD57dHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1idWxrLXN0b2NrLXZhbHVlJyl9PC9MYWJlbD5cblx0XHRcdFx0XHQ8U2VsZWN0IHZhbHVlPXt2YWx1ZX0gb25DaGFuZ2U9eyhlOiBhbnkpID0+IHNldFZhbHVlKFN0cmluZyhlPy50YXJnZXQ/LnZhbHVlID8/ICd0cnVlJykgYXMgYW55KX0+XG5cdFx0XHRcdFx0XHQ8b3B0aW9uIHZhbHVlPSd0cnVlJz57dHJhbnNsYXRlTWVzc2FnZSgnbGFiZWxzLmluU3RvY2sudHJ1ZScpfTwvb3B0aW9uPlxuXHRcdFx0XHRcdFx0PG9wdGlvbiB2YWx1ZT0nZmFsc2UnPnt0cmFuc2xhdGVNZXNzYWdlKCdsYWJlbHMuaW5TdG9jay5mYWxzZScpfTwvb3B0aW9uPlxuXHRcdFx0XHRcdDwvU2VsZWN0PlxuXHRcdFx0XHQ8L0Zvcm1Hcm91cD5cblx0XHRcdCkgOiBudWxsfVxuXG5cdFx0XHQ8Qm94IG10PSd4bCc+XG5cdFx0XHRcdDxCdXR0b24gdmFyaWFudD0nY29udGFpbmVkJyBjb2xvcj0ncHJpbWFyeScgc3R5bGU9e2FjdGlvbkJ1dHRvblN0eWxlfSBkaXNhYmxlZD17IWNhblNhdmUgfHwgc2F2aW5nfSBvbkNsaWNrPXtoYW5kbGVTYXZlfT5cblx0XHRcdFx0XHR7c2F2aW5nID8gdHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1idWxrLXNhdmluZycpIDogdHJhbnNsYXRlTWVzc2FnZSgncHJvZHVjdC1idWxrLWFwcGx5Jyl9XG5cdFx0XHRcdDwvQnV0dG9uPlxuXHRcdFx0PC9Cb3g+XG5cdFx0PC9Cb3g+XG5cdCk7XG59XG4iLCJpbXBvcnQgeyB1c2VUcmFuc2xhdGlvbiB9IGZyb20gJ2FkbWluanMnO1xuaW1wb3J0IHsgQm94LCBCdXR0b24sIEgyLCBINCwgSDUsIElsbHVzdHJhdGlvbiwgVGV4dCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xuXG50eXBlIFF1aWNrQWN0aW9uID0ge1xuXHRrZXk6IHN0cmluZztcblx0cGF0aDogc3RyaW5nO1xufTtcblxuY29uc3QgcXVpY2tBY3Rpb25zOiBRdWlja0FjdGlvbltdID0gW1xuXHR7IGtleTogJ29yZGVycycsIHBhdGg6ICdyZXNvdXJjZXMvT3JkZXInIH0sXG5cdHsga2V5OiAncHJvZHVjdHMnLCBwYXRoOiAncmVzb3VyY2VzL1Byb2R1Y3QnIH0sXG5cdHsga2V5OiAnY3VzdG9tZXJzJywgcGF0aDogJ3Jlc291cmNlcy9Vc2VyJyB9LFxuXHR7IGtleTogJ3Jldmlld3MnLCBwYXRoOiAncmVzb3VyY2VzL1JldmlldycgfSxcbl07XG5cbmNvbnN0IGFjdGlvbkJ1dHRvblN0eWxlID0ge1xuXHRib3JkZXJDb2xvcjogJ3doaXRlJyxcblx0YmFja2dyb3VuZDogJyNmYWNjMTUnLFxuXHRjb2xvcjogJ2JsYWNrJyxcbn07XG5cbmNvbnN0IHJlc29sdmVQYXRoID0gKHBhdGg6IHN0cmluZykgPT4ge1xuXHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybiBwYXRoO1xuXHRjb25zdCBnbG9iYWxBbnkgPSB3aW5kb3cgYXMgdHlwZW9mIHdpbmRvdyAmIHtcblx0XHRSRURVWF9TVEFURT86IHsgcGF0aHM/OiB7IHJvb3RQYXRoPzogc3RyaW5nIH0gfTtcblx0fTtcblx0Y29uc3Qgcm9vdFBhdGggPSBnbG9iYWxBbnkuUkVEVVhfU1RBVEU/LnBhdGhzPy5yb290UGF0aCA/PyAnJztcblx0Y29uc3Qgbm9ybWFsaXplZFJvb3QgPSByb290UGF0aC5yZXBsYWNlKC9cXC8kLywgJycpO1xuXHRjb25zdCBub3JtYWxpemVkUGF0aCA9IHBhdGgucmVwbGFjZSgvXlxcLy8sICcnKTtcblx0aWYgKCFub3JtYWxpemVkUm9vdCkgcmV0dXJuIHBhdGg7XG5cdHJldHVybiBgJHtub3JtYWxpemVkUm9vdH0vJHtub3JtYWxpemVkUGF0aH1gO1xufTtcblxuY29uc3QgZ29UbyA9IChwYXRoOiBzdHJpbmcpID0+ICgpID0+IHtcblx0aWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0d2luZG93LmxvY2F0aW9uLmFzc2lnbihyZXNvbHZlUGF0aChwYXRoKSk7XG5cdH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIERhc2hib2FyZCgpIHtcblx0Y29uc3QgeyB0cmFuc2xhdGVNZXNzYWdlIH0gPSB1c2VUcmFuc2xhdGlvbigpO1xuXG5cdHJldHVybiAoXG5cdFx0PEJveCB2YXJpYW50PSdncmV5JyBwPSd4eGwnPlxuXHRcdFx0PEJveFxuXHRcdFx0XHR2YXJpYW50PSd3aGl0ZSdcblx0XHRcdFx0cD0neHhsJ1xuXHRcdFx0XHRib3JkZXJSYWRpdXM9J3hsJ1xuXHRcdFx0XHRib3hTaGFkb3c9J3NtJ1xuXHRcdFx0XHRzdHlsZT17e1xuXHRcdFx0XHRcdGRpc3BsYXk6ICdmbGV4Jyxcblx0XHRcdFx0XHRhbGlnbkl0ZW1zOiAnY2VudGVyJyxcblx0XHRcdFx0XHRqdXN0aWZ5Q29udGVudDogJ3NwYWNlLWJldHdlZW4nLFxuXHRcdFx0XHRcdGdhcDogMzIsXG5cdFx0XHRcdFx0ZmxleFdyYXA6ICd3cmFwJyxcblx0XHRcdFx0fX1cblx0XHRcdD5cblx0XHRcdFx0PEJveCBzdHlsZT17eyBtYXhXaWR0aDogNTIwIH19PlxuXHRcdFx0XHRcdDxIMiBtYj0nbGcnPnt0cmFuc2xhdGVNZXNzYWdlKCdkYXNoYm9hcmQudGl0bGUnKX08L0gyPlxuXHRcdFx0XHRcdDxUZXh0IGZvbnRTaXplPSdsZycgbWI9J3hsJz5cblx0XHRcdFx0XHRcdHt0cmFuc2xhdGVNZXNzYWdlKCdkYXNoYm9hcmQuc3VidGl0bGUnKX1cblx0XHRcdFx0XHQ8L1RleHQ+XG5cdFx0XHRcdFx0PEJveCBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGdhcDogMTIsIGZsZXhXcmFwOiAnd3JhcCcgfX0+XG5cdFx0XHRcdFx0XHQ8QnV0dG9uXG5cdFx0XHRcdFx0XHRcdHZhcmlhbnQ9J2NvbnRhaW5lZCdcblx0XHRcdFx0XHRcdFx0Y29sb3I9J3ByaW1hcnknXG5cdFx0XHRcdFx0XHRcdHN0eWxlPXthY3Rpb25CdXR0b25TdHlsZX1cblx0XHRcdFx0XHRcdFx0b25DbGljaz17Z29UbygncmVzb3VyY2VzL09yZGVyJyl9XG5cdFx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHRcdHt0cmFuc2xhdGVNZXNzYWdlKCdkYXNoYm9hcmQucHJpbWFyeUFjdGlvbnMub3JkZXJzJyl9XG5cdFx0XHRcdFx0XHQ8L0J1dHRvbj5cblx0XHRcdFx0XHRcdDxCdXR0b25cblx0XHRcdFx0XHRcdFx0dmFyaWFudD0nY29udGFpbmVkJ1xuXHRcdFx0XHRcdFx0XHRjb2xvcj0ncHJpbWFyeSdcblx0XHRcdFx0XHRcdFx0c3R5bGU9e2FjdGlvbkJ1dHRvblN0eWxlfVxuXHRcdFx0XHRcdFx0XHRvbkNsaWNrPXtnb1RvKCdyZXNvdXJjZXMvUHJvZHVjdC9hY3Rpb25zL25ldycpfVxuXHRcdFx0XHRcdFx0PlxuXHRcdFx0XHRcdFx0XHR7dHJhbnNsYXRlTWVzc2FnZSgnZGFzaGJvYXJkLnByaW1hcnlBY3Rpb25zLnByb2R1Y3RzJyl9XG5cdFx0XHRcdFx0XHQ8L0J1dHRvbj5cblx0XHRcdFx0XHRcdDxCdXR0b25cblx0XHRcdFx0XHRcdFx0dmFyaWFudD0nY29udGFpbmVkJ1xuXHRcdFx0XHRcdFx0XHRjb2xvcj0ncHJpbWFyeSdcblx0XHRcdFx0XHRcdFx0c3R5bGU9e2FjdGlvbkJ1dHRvblN0eWxlfVxuXHRcdFx0XHRcdFx0XHRvbkNsaWNrPXtnb1RvKCdyZXNvdXJjZXMvUmV2aWV3Jyl9XG5cdFx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHRcdHt0cmFuc2xhdGVNZXNzYWdlKCdkYXNoYm9hcmQucHJpbWFyeUFjdGlvbnMucmV2aWV3cycpfVxuXHRcdFx0XHRcdFx0PC9CdXR0b24+XG5cdFx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdDwvQm94PlxuXHRcdFx0XHQ8Qm94IHN0eWxlPXt7IG1pbldpZHRoOiAyNDAsIGRpc3BsYXk6ICdmbGV4JywganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInIH19PlxuXHRcdFx0XHRcdDxJbGx1c3RyYXRpb24gdmFyaWFudD0nQmFnJyB3aWR0aD17MjAwfSBoZWlnaHQ9ezE4MH0gLz5cblx0XHRcdFx0PC9Cb3g+XG5cdFx0XHQ8L0JveD5cblxuXHRcdFx0PEJveCBtdD0neHhsJz5cblx0XHRcdFx0PEg0Pnt0cmFuc2xhdGVNZXNzYWdlKCdkYXNoYm9hcmQuZGFpbHlGb2N1cy50aXRsZScpfTwvSDQ+XG5cdFx0XHRcdDxUZXh0IGNvbG9yPSdncmV5NjAnPnt0cmFuc2xhdGVNZXNzYWdlKCdkYXNoYm9hcmQuZGFpbHlGb2N1cy5zdWJ0aXRsZScpfTwvVGV4dD5cblx0XHRcdDwvQm94PlxuXG5cdFx0XHQ8Qm94XG5cdFx0XHRcdG10PSdsZydcblx0XHRcdFx0c3R5bGU9e3tcblx0XHRcdFx0XHRkaXNwbGF5OiAnZ3JpZCcsXG5cdFx0XHRcdFx0Z3JpZFRlbXBsYXRlQ29sdW1uczogJ3JlcGVhdChhdXRvLWZpdCwgbWlubWF4KDI0MHB4LCAxZnIpKScsXG5cdFx0XHRcdFx0Z2FwOiAxNixcblx0XHRcdFx0fX1cblx0XHRcdD5cblx0XHRcdFx0e3F1aWNrQWN0aW9ucy5tYXAoKGFjdGlvbikgPT4gKFxuXHRcdFx0XHRcdDxCb3hcblx0XHRcdFx0XHRcdGtleT17YWN0aW9uLmtleX1cblx0XHRcdFx0XHRcdHZhcmlhbnQ9J3doaXRlJ1xuXHRcdFx0XHRcdFx0cD0neGwnXG5cdFx0XHRcdFx0XHRib3JkZXJSYWRpdXM9J3hsJ1xuXHRcdFx0XHRcdFx0Ym94U2hhZG93PSdzbSdcblx0XHRcdFx0XHRcdHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCAjRTJFOEYwJyB9fVxuXHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdDxINSBtYj0nbWQnPnt0cmFuc2xhdGVNZXNzYWdlKGBkYXNoYm9hcmQuY2FyZHMuJHthY3Rpb24ua2V5fS50aXRsZWApfTwvSDU+XG5cdFx0XHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJyBtYj0neGwnPlxuXHRcdFx0XHRcdFx0XHR7dHJhbnNsYXRlTWVzc2FnZShgZGFzaGJvYXJkLmNhcmRzLiR7YWN0aW9uLmtleX0uZGVzY3JpcHRpb25gKX1cblx0XHRcdFx0XHRcdDwvVGV4dD5cblx0XHRcdFx0XHRcdDxCdXR0b25cblx0XHRcdFx0XHRcdFx0dmFyaWFudD0nY29udGFpbmVkJ1xuXHRcdFx0XHRcdFx0XHRjb2xvcj0ncHJpbWFyeSdcblx0XHRcdFx0XHRcdFx0c3R5bGU9e2FjdGlvbkJ1dHRvblN0eWxlfVxuXHRcdFx0XHRcdFx0XHRvbkNsaWNrPXtnb1RvKGFjdGlvbi5wYXRoKX1cblx0XHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdFx0e3RyYW5zbGF0ZU1lc3NhZ2UoYGRhc2hib2FyZC5jYXJkcy4ke2FjdGlvbi5rZXl9LmJ1dHRvbmApfVxuXHRcdFx0XHRcdFx0PC9CdXR0b24+XG5cdFx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdCkpfVxuXHRcdFx0PC9Cb3g+XG5cdFx0PC9Cb3g+XG5cdCk7XG59XG4iLCJpbXBvcnQgeyB1c2VUcmFuc2xhdGlvbiB9IGZyb20gJ2FkbWluanMnO1xuaW1wb3J0IHsgQm94LCBCdXR0b24sIEZvcm1Hcm91cCwgSDIsIEg1LCBJbGx1c3RyYXRpb24sIElucHV0LCBMYWJlbCwgTWVzc2FnZUJveCwgVGV4dCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xuaW1wb3J0IHsgdXNlU3RhdGUsIHR5cGUgQ2hhbmdlRXZlbnQgfSBmcm9tICdyZWFjdCc7XG5cbnR5cGUgTG9naW5TdGF0ZSA9IHtcblx0YWN0aW9uPzogc3RyaW5nO1xuXHRlcnJvck1lc3NhZ2U/OiBzdHJpbmcgfCBudWxsO1xufTtcblxudHlwZSBCcmFuZGluZ1N0YXRlID0ge1xuXHRsb2dvPzogc3RyaW5nO1xuXHRjb21wYW55TmFtZT86IHN0cmluZztcblx0d2l0aE1hZGVXaXRoTG92ZT86IGJvb2xlYW47XG59O1xuXG50eXBlIFdpbmRvd1dpdGhBZG1pblN0YXRlID0gV2luZG93ICYge1xuXHRfX0FQUF9TVEFURV9fPzogTG9naW5TdGF0ZTtcblx0UkVEVVhfU1RBVEU/OiB7XG5cdFx0YnJhbmRpbmc/OiBCcmFuZGluZ1N0YXRlO1xuXHR9O1xufTtcblxuY29uc3QgYWN0aW9uQnV0dG9uU3R5bGUgPSB7XG5cdGJvcmRlckNvbG9yOiAnd2hpdGUnLFxuXHRiYWNrZ3JvdW5kOiAnI2ZhY2MxNScsXG5cdGNvbG9yOiAnYmxhY2snLFxufTtcblxuY29uc3QgbGFiZWxTdHlsZSA9IHtcblx0Zm9udFNpemU6IDE0LFxufTtcblxuY29uc3QgZ2V0TWVzc2FnZVRleHQgPSAobWVzc2FnZTogc3RyaW5nLCB0cmFuc2xhdGVNZXNzYWdlOiAoa2V5OiBzdHJpbmcpID0+IHN0cmluZykgPT5cblx0bWVzc2FnZS5zcGxpdCgnICcpLmxlbmd0aCA+IDEgPyBtZXNzYWdlIDogdHJhbnNsYXRlTWVzc2FnZShtZXNzYWdlKTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gTG9naW4oKSB7XG5cdGNvbnN0IHdpbmRvd1N0YXRlID0gd2luZG93IGFzIFdpbmRvd1dpdGhBZG1pblN0YXRlO1xuXHRjb25zdCBwcm9wcyA9IHdpbmRvd1N0YXRlLl9fQVBQX1NUQVRFX187XG5cdGNvbnN0IGFjdGlvbiA9IHByb3BzPy5hY3Rpb24gPz8gJyc7XG5cdGNvbnN0IG1lc3NhZ2UgPSBwcm9wcz8uZXJyb3JNZXNzYWdlID8/IHVuZGVmaW5lZDtcblx0Y29uc3QgYnJhbmRpbmcgPSB3aW5kb3dTdGF0ZS5SRURVWF9TVEFURT8uYnJhbmRpbmcgPz8ge307XG5cdGNvbnN0IHsgdHJhbnNsYXRlQ29tcG9uZW50LCB0cmFuc2xhdGVNZXNzYWdlIH0gPSB1c2VUcmFuc2xhdGlvbigpO1xuXHRjb25zdCBbZW1haWwsIHNldEVtYWlsXSA9IHVzZVN0YXRlKCd0ZXN0QGNvbScpO1xuXHRjb25zdCBbcGFzc3dvcmQsIHNldFBhc3N3b3JkXSA9IHVzZVN0YXRlKCd0ZXN0Jyk7XG5cblx0Y29uc3QgaGFuZGxlRW1haWxDaGFuZ2UgPSAoZXZlbnQ6IENoYW5nZUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+KSA9PiB7XG5cdFx0c2V0RW1haWwoZXZlbnQudGFyZ2V0LnZhbHVlKTtcblx0fTtcblxuXHRjb25zdCBoYW5kbGVQYXNzd29yZENoYW5nZSA9IChldmVudDogQ2hhbmdlRXZlbnQ8SFRNTElucHV0RWxlbWVudD4pID0+IHtcblx0XHRzZXRQYXNzd29yZChldmVudC50YXJnZXQudmFsdWUpO1xuXHR9O1xuXG5cdHJldHVybiAoXG5cdFx0PEJveFxuXHRcdFx0dmFyaWFudD0nZ3JleSdcblx0XHRcdGZsZXhcblx0XHRcdGNsYXNzTmFtZT0nYWRtaW4tbG9naW4tcGFnZSdcblx0XHRcdHN0eWxlPXt7XG5cdFx0XHRcdG1pbkhlaWdodDogJzEwMCUnLFxuXHRcdFx0XHRhbGlnbkl0ZW1zOiAnY2VudGVyJyxcblx0XHRcdFx0anVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxuXHRcdFx0XHRwYWRkaW5nOiAnMzJweCAxNnB4Jyxcblx0XHRcdH19XG5cdFx0PlxuXHRcdFx0PEJveFxuXHRcdFx0XHR2YXJpYW50PSd3aGl0ZSdcblx0XHRcdFx0cD0neHhsJ1xuXHRcdFx0XHRib3JkZXJSYWRpdXM9J3hsJ1xuXHRcdFx0XHRib3hTaGFkb3c9J3NtJ1xuXHRcdFx0XHRzdHlsZT17e1xuXHRcdFx0XHRcdHdpZHRoOiAnbWluKDk2MHB4LCAxMDAlKScsXG5cdFx0XHRcdFx0ZGlzcGxheTogJ2dyaWQnLFxuXHRcdFx0XHRcdGdyaWRUZW1wbGF0ZUNvbHVtbnM6ICdyZXBlYXQoYXV0by1maXQsIG1pbm1heCgyODBweCwgMWZyKSknLFxuXHRcdFx0XHRcdGdhcDogMzIsXG5cdFx0XHRcdH19XG5cdFx0XHQ+XG5cdFx0XHRcdDxCb3ggc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywgZ2FwOiAxNiB9fT5cblx0XHRcdFx0XHQ8SDI+e3RyYW5zbGF0ZUNvbXBvbmVudCgnTG9naW4udGl0bGUnKX08L0gyPlxuXHRcdFx0XHRcdDxUZXh0IGZvbnRTaXplPSdsZyc+e3RyYW5zbGF0ZUNvbXBvbmVudCgnTG9naW4uc3VidGl0bGUnKX08L1RleHQ+XG5cdFx0XHRcdFx0PEJveFxuXHRcdFx0XHRcdFx0dmFyaWFudD0nZ3JleSdcblx0XHRcdFx0XHRcdGJvcmRlclJhZGl1cz0neGwnXG5cdFx0XHRcdFx0XHRwPSd4bCdcblx0XHRcdFx0XHRcdHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGdhcDogMTYgfX1cblx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHQ8SWxsdXN0cmF0aW9uIHZhcmlhbnQ9J0JhZycgd2lkdGg9ezEyMH0gaGVpZ2h0PXsxMTB9IC8+XG5cdFx0XHRcdFx0XHQ8VGV4dCBjb2xvcj0nZ3JleTYwJz57dHJhbnNsYXRlQ29tcG9uZW50KCdMb2dpbi5zdXBwb3J0VGV4dCcpfTwvVGV4dD5cblx0XHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0PC9Cb3g+XG5cdFx0XHRcdDxCb3ggYXM9J2Zvcm0nIGFjdGlvbj17YWN0aW9ufSBtZXRob2Q9J1BPU1QnIHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGdhcDogMTYgfX0+XG5cdFx0XHRcdFx0PEg1IG1hcmdpbkJvdHRvbT0nbGcnPlxuXHRcdFx0XHRcdFx0e2JyYW5kaW5nPy5sb2dvID8gKFxuXHRcdFx0XHRcdFx0XHQ8aW1nXG5cdFx0XHRcdFx0XHRcdFx0c3JjPXticmFuZGluZy5sb2dvfVxuXHRcdFx0XHRcdFx0XHRcdGFsdD17YnJhbmRpbmcuY29tcGFueU5hbWV9XG5cdFx0XHRcdFx0XHRcdFx0c3R5bGU9e3sgbWF4V2lkdGg6IDIwMCB9fVxuXHRcdFx0XHRcdFx0XHQvPlxuXHRcdFx0XHRcdFx0KSA6IChcblx0XHRcdFx0XHRcdFx0YnJhbmRpbmc/LmNvbXBhbnlOYW1lID8/ICdBZG1pbidcblx0XHRcdFx0XHRcdCl9XG5cdFx0XHRcdFx0PC9INT5cblx0XHRcdFx0XHR7bWVzc2FnZSA/IChcblx0XHRcdFx0XHRcdDxNZXNzYWdlQm94XG5cdFx0XHRcdFx0XHRcdG15PSdsZydcblx0XHRcdFx0XHRcdFx0bWVzc2FnZT17Z2V0TWVzc2FnZVRleHQobWVzc2FnZSwgdHJhbnNsYXRlTWVzc2FnZSl9XG5cdFx0XHRcdFx0XHRcdHZhcmlhbnQ9J2Rhbmdlcidcblx0XHRcdFx0XHRcdC8+XG5cdFx0XHRcdFx0KSA6IG51bGx9XG5cdFx0XHRcdFx0PEZvcm1Hcm91cD5cblx0XHRcdFx0XHRcdDxMYWJlbCByZXF1aXJlZCBzdHlsZT17bGFiZWxTdHlsZX0+XG5cdFx0XHRcdFx0XHRcdHt0cmFuc2xhdGVDb21wb25lbnQoJ0xvZ2luLnByb3BlcnRpZXMuZW1haWwnKX1cblx0XHRcdFx0XHRcdDwvTGFiZWw+XG5cdFx0XHRcdFx0XHQ8SW5wdXRcblx0XHRcdFx0XHRcdFx0bmFtZT0nZW1haWwnXG5cdFx0XHRcdFx0XHRcdHR5cGU9J2VtYWlsJ1xuXHRcdFx0XHRcdFx0XHRhdXRvQ29tcGxldGU9J29mZidcblx0XHRcdFx0XHRcdFx0cGxhY2Vob2xkZXI9e3RyYW5zbGF0ZUNvbXBvbmVudCgnTG9naW4ucHJvcGVydGllcy5lbWFpbCcpfVxuXHRcdFx0XHRcdFx0XHR2YWx1ZT17ZW1haWx9XG5cdFx0XHRcdFx0XHRcdG9uQ2hhbmdlPXtoYW5kbGVFbWFpbENoYW5nZX1cblx0XHRcdFx0XHRcdC8+XG5cdFx0XHRcdFx0PC9Gb3JtR3JvdXA+XG5cdFx0XHRcdFx0PEZvcm1Hcm91cD5cblx0XHRcdFx0XHRcdDxMYWJlbCByZXF1aXJlZCBzdHlsZT17bGFiZWxTdHlsZX0+XG5cdFx0XHRcdFx0XHRcdHt0cmFuc2xhdGVDb21wb25lbnQoJ0xvZ2luLnByb3BlcnRpZXMucGFzc3dvcmQnKX1cblx0XHRcdFx0XHRcdDwvTGFiZWw+XG5cdFx0XHRcdFx0XHQ8SW5wdXRcblx0XHRcdFx0XHRcdFx0dHlwZT0ncGFzc3dvcmQnXG5cdFx0XHRcdFx0XHRcdG5hbWU9J3Bhc3N3b3JkJ1xuXHRcdFx0XHRcdFx0XHRhdXRvQ29tcGxldGU9J25ldy1wYXNzd29yZCdcblx0XHRcdFx0XHRcdFx0cGxhY2Vob2xkZXI9e3RyYW5zbGF0ZUNvbXBvbmVudCgnTG9naW4ucHJvcGVydGllcy5wYXNzd29yZCcpfVxuXHRcdFx0XHRcdFx0XHR2YWx1ZT17cGFzc3dvcmR9XG5cdFx0XHRcdFx0XHRcdG9uQ2hhbmdlPXtoYW5kbGVQYXNzd29yZENoYW5nZX1cblx0XHRcdFx0XHRcdC8+XG5cdFx0XHRcdFx0PC9Gb3JtR3JvdXA+XG5cdFx0XHRcdFx0PEJveD5cblx0XHRcdFx0XHRcdDxCdXR0b24gdmFyaWFudD0nY29udGFpbmVkJyBjb2xvcj0ncHJpbWFyeScgc3R5bGU9e2FjdGlvbkJ1dHRvblN0eWxlfT5cblx0XHRcdFx0XHRcdFx0e3RyYW5zbGF0ZUNvbXBvbmVudCgnTG9naW4ubG9naW5CdXR0b24nKX1cblx0XHRcdFx0XHRcdDwvQnV0dG9uPlxuXHRcdFx0XHRcdDwvQm94PlxuXHRcdFx0XHQ8L0JveD5cblx0XHRcdDwvQm94PlxuXHRcdDwvQm94PlxuXHQpO1xufVxuIiwiaW1wb3J0IHsgdXNlVHJhbnNsYXRpb24gfSBmcm9tICdhZG1pbmpzJztcbmltcG9ydCB7IEJveCwgQ3VycmVudFVzZXJOYXYgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcblxudHlwZSBMb2dnZWRJblByb3BzID0ge1xuXHRzZXNzaW9uOiB7XG5cdFx0ZW1haWw/OiBzdHJpbmc7XG5cdFx0dGl0bGU/OiBzdHJpbmc7XG5cdFx0YXZhdGFyVXJsPzogc3RyaW5nO1xuXHR9O1xuXHRwYXRoczoge1xuXHRcdGxvZ291dFBhdGg6IHN0cmluZztcblx0fTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIExvZ2dlZEluKHsgc2Vzc2lvbiwgcGF0aHMgfTogTG9nZ2VkSW5Qcm9wcykge1xuXHRjb25zdCB7IHRyYW5zbGF0ZUJ1dHRvbiB9ID0gdXNlVHJhbnNsYXRpb24oKTtcblxuXHRjb25zdCBkcm9wQWN0aW9ucyA9IFtcblx0XHR7XG5cdFx0XHRsYWJlbDogdHJhbnNsYXRlQnV0dG9uKCdsb2dvdXQnKSxcblx0XHRcdG9uQ2xpY2s6IChldmVudDogRXZlbnQpID0+IHtcblx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0d2luZG93LmxvY2F0aW9uLmhyZWYgPSBwYXRocy5sb2dvdXRQYXRoO1xuXHRcdFx0fSxcblx0XHRcdGljb246ICdMb2dPdXQnLFxuXHRcdH0sXG5cdF07XG5cblx0cmV0dXJuIChcblx0XHQ8Qm94IGZsZXhTaHJpbms9ezB9IGRhdGEtY3NzPSdsb2dnZWQtaW4nPlxuXHRcdFx0PEN1cnJlbnRVc2VyTmF2XG5cdFx0XHRcdG5hbWU9e3Nlc3Npb24uZW1haWx9XG5cdFx0XHRcdHRpdGxlPXtzZXNzaW9uLnRpdGxlfVxuXHRcdFx0XHRhdmF0YXJVcmw9e3Nlc3Npb24uYXZhdGFyVXJsfVxuXHRcdFx0XHRkcm9wQWN0aW9ucz17ZHJvcEFjdGlvbnN9XG5cdFx0XHQvPlxuXHRcdDwvQm94PlxuXHQpO1xufVxuIiwiaW1wb3J0IHsgdXNlVHJhbnNsYXRpb24gfSBmcm9tICdhZG1pbmpzJztcbmltcG9ydCB7XG5cdEJveCxcblx0QnV0dG9uLFxuXHREcm9wRG93bixcblx0RHJvcERvd25JdGVtLFxuXHREcm9wRG93bk1lbnUsXG5cdERyb3BEb3duVHJpZ2dlcixcblx0SWNvbixcblx0VGV4dCxcbn0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSc7XG5pbXBvcnQgTG9nZ2VkSW4gZnJvbSAnLi9Mb2dnZWRJbic7XG5cbnR5cGUgVG9wQmFyUHJvcHMgPSB7XG5cdHRvZ2dsZVNpZGViYXI6ICgpID0+IHZvaWQ7XG59O1xuXG50eXBlIEFkbWluU3RhdGUgPSB7XG5cdHNlc3Npb24/OiB7IGVtYWlsPzogc3RyaW5nOyB0aXRsZT86IHN0cmluZzsgYXZhdGFyVXJsPzogc3RyaW5nIH07XG5cdHBhdGhzPzogeyByb290UGF0aD86IHN0cmluZzsgbG9nb3V0UGF0aD86IHN0cmluZyB9O1xuXHR2ZXJzaW9ucz86IHsgYWRtaW4/OiBzdHJpbmc7IGFwcD86IHN0cmluZyB9O1xufTtcblxudHlwZSBWZXJzaW9ucyA9IHtcblx0YWRtaW4/OiBzdHJpbmc7XG5cdGFwcD86IHN0cmluZztcbn07XG5cbnR5cGUgV2luZG93V2l0aEFkbWluU3RhdGUgPSBXaW5kb3cgJiB7XG5cdFJFRFVYX1NUQVRFPzogQWRtaW5TdGF0ZTtcbn07XG5cbmNvbnN0IFZlcnNpb24gPSAoeyB2ZXJzaW9ucyB9OiB7IHZlcnNpb25zOiBWZXJzaW9ucyB9KSA9PiB7XG5cdGNvbnN0IHsgdHJhbnNsYXRlTGFiZWwgfSA9IHVzZVRyYW5zbGF0aW9uKCk7XG5cdGNvbnN0IHsgYWRtaW4sIGFwcCB9ID0gdmVyc2lvbnM7XG5cblx0cmV0dXJuIChcblx0XHQ8Qm94IGZsZXggZmxleEdyb3c9ezF9IHB5PSdkZWZhdWx0JyBweD0neHhsJyBkYXRhLWNzcz0ndmVyc2lvbic+XG5cdFx0XHR7YWRtaW4gPyAoXG5cdFx0XHRcdDxUZXh0IGRpc3BsYXk9e1snbm9uZScsICdibG9jayddfSBjb2xvcj0nZ3JleTEwMCcgc3R5bGU9e3sgcGFkZGluZzogJzEycHggMjRweCAxMnB4IDAnIH19PlxuXHRcdFx0XHRcdHt0cmFuc2xhdGVMYWJlbCgnYWRtaW5WZXJzaW9uJywgeyB2ZXJzaW9uOiBhZG1pbiB9KX1cblx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0KSA6IG51bGx9XG5cdFx0XHR7YXBwID8gKFxuXHRcdFx0XHQ8VGV4dCBkaXNwbGF5PXtbJ25vbmUnLCAnYmxvY2snXX0gY29sb3I9J2dyZXkxMDAnIHN0eWxlPXt7IHBhZGRpbmc6ICcxMnB4IDI0cHggMTJweCAwJyB9fT5cblx0XHRcdFx0XHR7dHJhbnNsYXRlTGFiZWwoJ2FwcFZlcnNpb24nLCB7IHZlcnNpb246IGFwcCB9KX1cblx0XHRcdFx0PC9UZXh0PlxuXHRcdFx0KSA6IG51bGx9XG5cdFx0PC9Cb3g+XG5cdCk7XG59O1xuXG5jb25zdCBMYW5ndWFnZVNlbGVjdCA9ICgpID0+IHtcblx0Y29uc3QgeyBpMThuLCB0cmFuc2xhdGVDb21wb25lbnQgfSA9IHVzZVRyYW5zbGF0aW9uKCk7XG5cdGNvbnN0IHN1cHBvcnRlZExuZ3NSYXcgPSBpMThuPy5vcHRpb25zPy5zdXBwb3J0ZWRMbmdzO1xuXHRjb25zdCBzdXBwb3J0ZWRMbmdzID0gQXJyYXkuaXNBcnJheShzdXBwb3J0ZWRMbmdzUmF3KSA/IHN1cHBvcnRlZExuZ3NSYXcgOiBbXTtcblx0Y29uc3QgYXZhaWxhYmxlTGFuZ3VhZ2VzID0gc3VwcG9ydGVkTG5ncy5maWx0ZXIoKGxhbmc6IHN0cmluZykgPT4gbGFuZyAhPT0gJ2NpbW9kZScpO1xuXG5cdGlmIChhdmFpbGFibGVMYW5ndWFnZXMubGVuZ3RoIDw9IDEpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdHJldHVybiAoXG5cdFx0PEJveCBmbGV4IGFsaWduSXRlbXM9J2NlbnRlcic+XG5cdFx0XHQ8RHJvcERvd24+XG5cdFx0XHRcdDxEcm9wRG93blRyaWdnZXI+XG5cdFx0XHRcdFx0PEJ1dHRvbiBjb2xvcj0ndGV4dCc+XG5cdFx0XHRcdFx0XHQ8SWNvbiBpY29uPSdHbG9iZScgLz5cblx0XHRcdFx0XHRcdHt0cmFuc2xhdGVDb21wb25lbnQoYExhbmd1YWdlU2VsZWN0b3IuYXZhaWxhYmxlTGFuZ3VhZ2VzLiR7aTE4bi5sYW5ndWFnZX1gLCB7XG5cdFx0XHRcdFx0XHRcdGRlZmF1bHRWYWx1ZTogaTE4bi5sYW5ndWFnZSxcblx0XHRcdFx0XHRcdH0pfVxuXHRcdFx0XHRcdDwvQnV0dG9uPlxuXHRcdFx0XHQ8L0Ryb3BEb3duVHJpZ2dlcj5cblx0XHRcdFx0PERyb3BEb3duTWVudT5cblx0XHRcdFx0XHR7YXZhaWxhYmxlTGFuZ3VhZ2VzLm1hcCgobGFuZykgPT4gKFxuXHRcdFx0XHRcdFx0PERyb3BEb3duSXRlbSBrZXk9e2xhbmd9IG9uQ2xpY2s9eygpID0+IGkxOG4uY2hhbmdlTGFuZ3VhZ2UobGFuZyl9PlxuXHRcdFx0XHRcdFx0XHR7dHJhbnNsYXRlQ29tcG9uZW50KGBMYW5ndWFnZVNlbGVjdG9yLmF2YWlsYWJsZUxhbmd1YWdlcy4ke2xhbmd9YCwge1xuXHRcdFx0XHRcdFx0XHRcdGRlZmF1bHRWYWx1ZTogbGFuZyxcblx0XHRcdFx0XHRcdFx0fSl9XG5cdFx0XHRcdFx0XHQ8L0Ryb3BEb3duSXRlbT5cblx0XHRcdFx0XHQpKX1cblx0XHRcdFx0PC9Ecm9wRG93bk1lbnU+XG5cdFx0XHQ8L0Ryb3BEb3duPlxuXHRcdDwvQm94PlxuXHQpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gVG9wQmFyKHsgdG9nZ2xlU2lkZWJhciB9OiBUb3BCYXJQcm9wcykge1xuXHRjb25zdCB3aW5kb3dTdGF0ZSA9IHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnID8gbnVsbCA6ICh3aW5kb3cgYXMgV2luZG93V2l0aEFkbWluU3RhdGUpO1xuXHRjb25zdCByZWR1eFN0YXRlID0gd2luZG93U3RhdGU/LlJFRFVYX1NUQVRFID8/IHt9O1xuXHRjb25zdCBzZXNzaW9uID0gcmVkdXhTdGF0ZS5zZXNzaW9uO1xuXHRjb25zdCBwYXRocyA9IHJlZHV4U3RhdGUucGF0aHM7XG5cdGNvbnN0IHZlcnNpb25zID0gcmVkdXhTdGF0ZS52ZXJzaW9ucztcblx0Y29uc3QgeyB0cmFuc2xhdGVNZXNzYWdlIH0gPSB1c2VUcmFuc2xhdGlvbigpO1xuXHRjb25zdCByb290UGF0aCA9IHBhdGhzPy5yb290UGF0aCA/PyAnL2FkbWluJztcblx0Y29uc3QgbG9nb3V0UGF0aCA9IHBhdGhzPy5sb2dvdXRQYXRoID8/IGAke3Jvb3RQYXRofS9sb2dvdXRgO1xuXHRjb25zdCBob21lTGFiZWwgPSB0cmFuc2xhdGVNZXNzYWdlKCdhZG1pbi1ob21lJyk7XG5cblx0cmV0dXJuIChcblx0XHQ8Qm94XG5cdFx0XHRkYXRhLWNzcz0ndG9wYmFyJ1xuXHRcdFx0c3R5bGU9e3tcblx0XHRcdFx0aGVpZ2h0OiAnNjRweCcsXG5cdFx0XHRcdGJvcmRlckJvdHRvbTogJzFweCBzb2xpZCAjRTJFOEYwJyxcblx0XHRcdFx0YmFja2dyb3VuZDogJyNGRkZGRkYnLFxuXHRcdFx0XHRkaXNwbGF5OiAnZmxleCcsXG5cdFx0XHRcdGZsZXhEaXJlY3Rpb246ICdyb3cnLFxuXHRcdFx0XHRmbGV4U2hyaW5rOiAwLFxuXHRcdFx0XHRhbGlnbkl0ZW1zOiAnY2VudGVyJyxcblx0XHRcdH19XG5cdFx0PlxuXHRcdFx0PEJveCBkaXNwbGF5PSdmbGV4JyBhbGlnbkl0ZW1zPSdjZW50ZXInIHN0eWxlPXt7IGdhcDogMTIgfX0+XG5cdFx0XHRcdDxCb3hcblx0XHRcdFx0XHRweT0nbGcnXG5cdFx0XHRcdFx0cHg9e1snZGVmYXVsdCcsICdsZyddfVxuXHRcdFx0XHRcdG9uQ2xpY2s9e3RvZ2dsZVNpZGViYXJ9XG5cdFx0XHRcdFx0ZGlzcGxheT17WydibG9jaycsICdibG9jaycsICdibG9jaycsICdibG9jaycsICdub25lJ119XG5cdFx0XHRcdFx0c3R5bGU9e3sgY3Vyc29yOiAncG9pbnRlcicgfX1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdDxJY29uIGljb249J01lbnUnIHNpemU9ezI0fSAvPlxuXHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0PGEgaHJlZj17cm9vdFBhdGh9IGNsYXNzTmFtZT0nYWRtaW4taG9tZS1saW5rJz5cblx0XHRcdFx0XHQ8SWNvbiBpY29uPSdIb21lJyAvPlxuXHRcdFx0XHRcdHtob21lTGFiZWx9XG5cdFx0XHRcdDwvYT5cblx0XHRcdDwvQm94PlxuXHRcdFx0PFZlcnNpb24gdmVyc2lvbnM9e3ZlcnNpb25zID8/IHt9fSAvPlxuXHRcdFx0PExhbmd1YWdlU2VsZWN0IC8+XG5cdFx0XHR7c2Vzc2lvbj8uZW1haWwgPyA8TG9nZ2VkSW4gc2Vzc2lvbj17c2Vzc2lvbn0gcGF0aHM9e3sgbG9nb3V0UGF0aCB9fSAvPiA6IG51bGx9XG5cdFx0PC9Cb3g+XG5cdCk7XG59XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGBudWxsYCBvciBgdW5kZWZpbmVkYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBudWxsaXNoLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNOaWwobnVsbCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc05pbCh2b2lkIDApO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNOaWwoTmFOKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzTmlsKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9PSBudWxsO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzTmlsO1xuIiwiLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYF8ubWFwYCBmb3IgYXJyYXlzIHdpdGhvdXQgc3VwcG9ydCBmb3IgaXRlcmF0ZWVcbiAqIHNob3J0aGFuZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IFthcnJheV0gVGhlIGFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIG5ldyBtYXBwZWQgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIGFycmF5TWFwKGFycmF5LCBpdGVyYXRlZSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGFycmF5ID09IG51bGwgPyAwIDogYXJyYXkubGVuZ3RoLFxuICAgICAgcmVzdWx0ID0gQXJyYXkobGVuZ3RoKTtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHJlc3VsdFtpbmRleF0gPSBpdGVyYXRlZShhcnJheVtpbmRleF0sIGluZGV4LCBhcnJheSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhcnJheU1hcDtcbiIsIi8qKlxuICogUmVtb3ZlcyBhbGwga2V5LXZhbHVlIGVudHJpZXMgZnJvbSB0aGUgbGlzdCBjYWNoZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgY2xlYXJcbiAqIEBtZW1iZXJPZiBMaXN0Q2FjaGVcbiAqL1xuZnVuY3Rpb24gbGlzdENhY2hlQ2xlYXIoKSB7XG4gIHRoaXMuX19kYXRhX18gPSBbXTtcbiAgdGhpcy5zaXplID0gMDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBsaXN0Q2FjaGVDbGVhcjtcbiIsIi8qKlxuICogUGVyZm9ybXMgYVxuICogW2BTYW1lVmFsdWVaZXJvYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtc2FtZXZhbHVlemVybylcbiAqIGNvbXBhcmlzb24gYmV0d2VlbiB0d28gdmFsdWVzIHRvIGRldGVybWluZSBpZiB0aGV5IGFyZSBlcXVpdmFsZW50LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjb21wYXJlLlxuICogQHBhcmFtIHsqfSBvdGhlciBUaGUgb3RoZXIgdmFsdWUgdG8gY29tcGFyZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgdmFsdWVzIGFyZSBlcXVpdmFsZW50LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3QgPSB7ICdhJzogMSB9O1xuICogdmFyIG90aGVyID0geyAnYSc6IDEgfTtcbiAqXG4gKiBfLmVxKG9iamVjdCwgb2JqZWN0KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmVxKG9iamVjdCwgb3RoZXIpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmVxKCdhJywgJ2EnKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmVxKCdhJywgT2JqZWN0KCdhJykpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmVxKE5hTiwgTmFOKTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gZXEodmFsdWUsIG90aGVyKSB7XG4gIHJldHVybiB2YWx1ZSA9PT0gb3RoZXIgfHwgKHZhbHVlICE9PSB2YWx1ZSAmJiBvdGhlciAhPT0gb3RoZXIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGVxO1xuIiwidmFyIGVxID0gcmVxdWlyZSgnLi9lcScpO1xuXG4vKipcbiAqIEdldHMgdGhlIGluZGV4IGF0IHdoaWNoIHRoZSBga2V5YCBpcyBmb3VuZCBpbiBgYXJyYXlgIG9mIGtleS12YWx1ZSBwYWlycy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGluc3BlY3QuXG4gKiBAcGFyYW0geyp9IGtleSBUaGUga2V5IHRvIHNlYXJjaCBmb3IuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgbWF0Y2hlZCB2YWx1ZSwgZWxzZSBgLTFgLlxuICovXG5mdW5jdGlvbiBhc3NvY0luZGV4T2YoYXJyYXksIGtleSkge1xuICB2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICBpZiAoZXEoYXJyYXlbbGVuZ3RoXVswXSwga2V5KSkge1xuICAgICAgcmV0dXJuIGxlbmd0aDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIC0xO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFzc29jSW5kZXhPZjtcbiIsInZhciBhc3NvY0luZGV4T2YgPSByZXF1aXJlKCcuL19hc3NvY0luZGV4T2YnKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIGFycmF5UHJvdG8gPSBBcnJheS5wcm90b3R5cGU7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHNwbGljZSA9IGFycmF5UHJvdG8uc3BsaWNlO1xuXG4vKipcbiAqIFJlbW92ZXMgYGtleWAgYW5kIGl0cyB2YWx1ZSBmcm9tIHRoZSBsaXN0IGNhY2hlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBkZWxldGVcbiAqIEBtZW1iZXJPZiBMaXN0Q2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gcmVtb3ZlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBlbnRyeSB3YXMgcmVtb3ZlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBsaXN0Q2FjaGVEZWxldGUoa2V5KSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXyxcbiAgICAgIGluZGV4ID0gYXNzb2NJbmRleE9mKGRhdGEsIGtleSk7XG5cbiAgaWYgKGluZGV4IDwgMCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgbGFzdEluZGV4ID0gZGF0YS5sZW5ndGggLSAxO1xuICBpZiAoaW5kZXggPT0gbGFzdEluZGV4KSB7XG4gICAgZGF0YS5wb3AoKTtcbiAgfSBlbHNlIHtcbiAgICBzcGxpY2UuY2FsbChkYXRhLCBpbmRleCwgMSk7XG4gIH1cbiAgLS10aGlzLnNpemU7XG4gIHJldHVybiB0cnVlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxpc3RDYWNoZURlbGV0ZTtcbiIsInZhciBhc3NvY0luZGV4T2YgPSByZXF1aXJlKCcuL19hc3NvY0luZGV4T2YnKTtcblxuLyoqXG4gKiBHZXRzIHRoZSBsaXN0IGNhY2hlIHZhbHVlIGZvciBga2V5YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZ2V0XG4gKiBAbWVtYmVyT2YgTGlzdENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBlbnRyeSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gbGlzdENhY2hlR2V0KGtleSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX18sXG4gICAgICBpbmRleCA9IGFzc29jSW5kZXhPZihkYXRhLCBrZXkpO1xuXG4gIHJldHVybiBpbmRleCA8IDAgPyB1bmRlZmluZWQgOiBkYXRhW2luZGV4XVsxXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBsaXN0Q2FjaGVHZXQ7XG4iLCJ2YXIgYXNzb2NJbmRleE9mID0gcmVxdWlyZSgnLi9fYXNzb2NJbmRleE9mJyk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGEgbGlzdCBjYWNoZSB2YWx1ZSBmb3IgYGtleWAgZXhpc3RzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBoYXNcbiAqIEBtZW1iZXJPZiBMaXN0Q2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgZW50cnkgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYW4gZW50cnkgZm9yIGBrZXlgIGV4aXN0cywgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBsaXN0Q2FjaGVIYXMoa2V5KSB7XG4gIHJldHVybiBhc3NvY0luZGV4T2YodGhpcy5fX2RhdGFfXywga2V5KSA+IC0xO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxpc3RDYWNoZUhhcztcbiIsInZhciBhc3NvY0luZGV4T2YgPSByZXF1aXJlKCcuL19hc3NvY0luZGV4T2YnKTtcblxuLyoqXG4gKiBTZXRzIHRoZSBsaXN0IGNhY2hlIGBrZXlgIHRvIGB2YWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIHNldFxuICogQG1lbWJlck9mIExpc3RDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBsaXN0IGNhY2hlIGluc3RhbmNlLlxuICovXG5mdW5jdGlvbiBsaXN0Q2FjaGVTZXQoa2V5LCB2YWx1ZSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX18sXG4gICAgICBpbmRleCA9IGFzc29jSW5kZXhPZihkYXRhLCBrZXkpO1xuXG4gIGlmIChpbmRleCA8IDApIHtcbiAgICArK3RoaXMuc2l6ZTtcbiAgICBkYXRhLnB1c2goW2tleSwgdmFsdWVdKTtcbiAgfSBlbHNlIHtcbiAgICBkYXRhW2luZGV4XVsxXSA9IHZhbHVlO1xuICB9XG4gIHJldHVybiB0aGlzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxpc3RDYWNoZVNldDtcbiIsInZhciBsaXN0Q2FjaGVDbGVhciA9IHJlcXVpcmUoJy4vX2xpc3RDYWNoZUNsZWFyJyksXG4gICAgbGlzdENhY2hlRGVsZXRlID0gcmVxdWlyZSgnLi9fbGlzdENhY2hlRGVsZXRlJyksXG4gICAgbGlzdENhY2hlR2V0ID0gcmVxdWlyZSgnLi9fbGlzdENhY2hlR2V0JyksXG4gICAgbGlzdENhY2hlSGFzID0gcmVxdWlyZSgnLi9fbGlzdENhY2hlSGFzJyksXG4gICAgbGlzdENhY2hlU2V0ID0gcmVxdWlyZSgnLi9fbGlzdENhY2hlU2V0Jyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBsaXN0IGNhY2hlIG9iamVjdC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0FycmF5fSBbZW50cmllc10gVGhlIGtleS12YWx1ZSBwYWlycyB0byBjYWNoZS5cbiAqL1xuZnVuY3Rpb24gTGlzdENhY2hlKGVudHJpZXMpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBlbnRyaWVzID09IG51bGwgPyAwIDogZW50cmllcy5sZW5ndGg7XG5cbiAgdGhpcy5jbGVhcigpO1xuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBlbnRyeSA9IGVudHJpZXNbaW5kZXhdO1xuICAgIHRoaXMuc2V0KGVudHJ5WzBdLCBlbnRyeVsxXSk7XG4gIH1cbn1cblxuLy8gQWRkIG1ldGhvZHMgdG8gYExpc3RDYWNoZWAuXG5MaXN0Q2FjaGUucHJvdG90eXBlLmNsZWFyID0gbGlzdENhY2hlQ2xlYXI7XG5MaXN0Q2FjaGUucHJvdG90eXBlWydkZWxldGUnXSA9IGxpc3RDYWNoZURlbGV0ZTtcbkxpc3RDYWNoZS5wcm90b3R5cGUuZ2V0ID0gbGlzdENhY2hlR2V0O1xuTGlzdENhY2hlLnByb3RvdHlwZS5oYXMgPSBsaXN0Q2FjaGVIYXM7XG5MaXN0Q2FjaGUucHJvdG90eXBlLnNldCA9IGxpc3RDYWNoZVNldDtcblxubW9kdWxlLmV4cG9ydHMgPSBMaXN0Q2FjaGU7XG4iLCJ2YXIgTGlzdENhY2hlID0gcmVxdWlyZSgnLi9fTGlzdENhY2hlJyk7XG5cbi8qKlxuICogUmVtb3ZlcyBhbGwga2V5LXZhbHVlIGVudHJpZXMgZnJvbSB0aGUgc3RhY2suXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGNsZWFyXG4gKiBAbWVtYmVyT2YgU3RhY2tcbiAqL1xuZnVuY3Rpb24gc3RhY2tDbGVhcigpIHtcbiAgdGhpcy5fX2RhdGFfXyA9IG5ldyBMaXN0Q2FjaGU7XG4gIHRoaXMuc2l6ZSA9IDA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3RhY2tDbGVhcjtcbiIsIi8qKlxuICogUmVtb3ZlcyBga2V5YCBhbmQgaXRzIHZhbHVlIGZyb20gdGhlIHN0YWNrLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBkZWxldGVcbiAqIEBtZW1iZXJPZiBTdGFja1xuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byByZW1vdmUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGVudHJ5IHdhcyByZW1vdmVkLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIHN0YWNrRGVsZXRlKGtleSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX18sXG4gICAgICByZXN1bHQgPSBkYXRhWydkZWxldGUnXShrZXkpO1xuXG4gIHRoaXMuc2l6ZSA9IGRhdGEuc2l6ZTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdGFja0RlbGV0ZTtcbiIsIi8qKlxuICogR2V0cyB0aGUgc3RhY2sgdmFsdWUgZm9yIGBrZXlgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBnZXRcbiAqIEBtZW1iZXJPZiBTdGFja1xuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZW50cnkgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIHN0YWNrR2V0KGtleSkge1xuICByZXR1cm4gdGhpcy5fX2RhdGFfXy5nZXQoa2V5KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdGFja0dldDtcbiIsIi8qKlxuICogQ2hlY2tzIGlmIGEgc3RhY2sgdmFsdWUgZm9yIGBrZXlgIGV4aXN0cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgaGFzXG4gKiBAbWVtYmVyT2YgU3RhY2tcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgZW50cnkgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYW4gZW50cnkgZm9yIGBrZXlgIGV4aXN0cywgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBzdGFja0hhcyhrZXkpIHtcbiAgcmV0dXJuIHRoaXMuX19kYXRhX18uaGFzKGtleSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3RhY2tIYXM7XG4iLCIvKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGdsb2JhbGAgZnJvbSBOb2RlLmpzLiAqL1xudmFyIGZyZWVHbG9iYWwgPSB0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbCAmJiBnbG9iYWwuT2JqZWN0ID09PSBPYmplY3QgJiYgZ2xvYmFsO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZyZWVHbG9iYWw7XG4iLCJ2YXIgZnJlZUdsb2JhbCA9IHJlcXVpcmUoJy4vX2ZyZWVHbG9iYWwnKTtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBzZWxmYC4gKi9cbnZhciBmcmVlU2VsZiA9IHR5cGVvZiBzZWxmID09ICdvYmplY3QnICYmIHNlbGYgJiYgc2VsZi5PYmplY3QgPT09IE9iamVjdCAmJiBzZWxmO1xuXG4vKiogVXNlZCBhcyBhIHJlZmVyZW5jZSB0byB0aGUgZ2xvYmFsIG9iamVjdC4gKi9cbnZhciByb290ID0gZnJlZUdsb2JhbCB8fCBmcmVlU2VsZiB8fCBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJvb3Q7XG4iLCJ2YXIgcm9vdCA9IHJlcXVpcmUoJy4vX3Jvb3QnKTtcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgU3ltYm9sID0gcm9vdC5TeW1ib2w7XG5cbm1vZHVsZS5leHBvcnRzID0gU3ltYm9sO1xuIiwidmFyIFN5bWJvbCA9IHJlcXVpcmUoJy4vX1N5bWJvbCcpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGVcbiAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgbmF0aXZlT2JqZWN0VG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgc3ltVG9TdHJpbmdUYWcgPSBTeW1ib2wgPyBTeW1ib2wudG9TdHJpbmdUYWcgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlR2V0VGFnYCB3aGljaCBpZ25vcmVzIGBTeW1ib2wudG9TdHJpbmdUYWdgIHZhbHVlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSByYXcgYHRvU3RyaW5nVGFnYC5cbiAqL1xuZnVuY3Rpb24gZ2V0UmF3VGFnKHZhbHVlKSB7XG4gIHZhciBpc093biA9IGhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIHN5bVRvU3RyaW5nVGFnKSxcbiAgICAgIHRhZyA9IHZhbHVlW3N5bVRvU3RyaW5nVGFnXTtcblxuICB0cnkge1xuICAgIHZhbHVlW3N5bVRvU3RyaW5nVGFnXSA9IHVuZGVmaW5lZDtcbiAgICB2YXIgdW5tYXNrZWQgPSB0cnVlO1xuICB9IGNhdGNoIChlKSB7fVxuXG4gIHZhciByZXN1bHQgPSBuYXRpdmVPYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgaWYgKHVubWFza2VkKSB7XG4gICAgaWYgKGlzT3duKSB7XG4gICAgICB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ10gPSB0YWc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlbGV0ZSB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ107XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0UmF3VGFnO1xuIiwiLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG5hdGl2ZU9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIHN0cmluZyB1c2luZyBgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBjb252ZXJ0ZWQgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gbmF0aXZlT2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gb2JqZWN0VG9TdHJpbmc7XG4iLCJ2YXIgU3ltYm9sID0gcmVxdWlyZSgnLi9fU3ltYm9sJyksXG4gICAgZ2V0UmF3VGFnID0gcmVxdWlyZSgnLi9fZ2V0UmF3VGFnJyksXG4gICAgb2JqZWN0VG9TdHJpbmcgPSByZXF1aXJlKCcuL19vYmplY3RUb1N0cmluZycpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgbnVsbFRhZyA9ICdbb2JqZWN0IE51bGxdJyxcbiAgICB1bmRlZmluZWRUYWcgPSAnW29iamVjdCBVbmRlZmluZWRdJztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgc3ltVG9TdHJpbmdUYWcgPSBTeW1ib2wgPyBTeW1ib2wudG9TdHJpbmdUYWcgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYGdldFRhZ2Agd2l0aG91dCBmYWxsYmFja3MgZm9yIGJ1Z2d5IGVudmlyb25tZW50cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBgdG9TdHJpbmdUYWdgLlxuICovXG5mdW5jdGlvbiBiYXNlR2V0VGFnKHZhbHVlKSB7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWRUYWcgOiBudWxsVGFnO1xuICB9XG4gIHJldHVybiAoc3ltVG9TdHJpbmdUYWcgJiYgc3ltVG9TdHJpbmdUYWcgaW4gT2JqZWN0KHZhbHVlKSlcbiAgICA/IGdldFJhd1RhZyh2YWx1ZSlcbiAgICA6IG9iamVjdFRvU3RyaW5nKHZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlR2V0VGFnO1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyB0aGVcbiAqIFtsYW5ndWFnZSB0eXBlXShodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtZWNtYXNjcmlwdC1sYW5ndWFnZS10eXBlcylcbiAqIG9mIGBPYmplY3RgLiAoZS5nLiBhcnJheXMsIGZ1bmN0aW9ucywgb2JqZWN0cywgcmVnZXhlcywgYG5ldyBOdW1iZXIoMClgLCBhbmQgYG5ldyBTdHJpbmcoJycpYClcbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdCh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoXy5ub29wKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmICh0eXBlID09ICdvYmplY3QnIHx8IHR5cGUgPT0gJ2Z1bmN0aW9uJyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNPYmplY3Q7XG4iLCJ2YXIgYmFzZUdldFRhZyA9IHJlcXVpcmUoJy4vX2Jhc2VHZXRUYWcnKSxcbiAgICBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXNPYmplY3QnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGFzeW5jVGFnID0gJ1tvYmplY3QgQXN5bmNGdW5jdGlvbl0nLFxuICAgIGZ1bmNUYWcgPSAnW29iamVjdCBGdW5jdGlvbl0nLFxuICAgIGdlblRhZyA9ICdbb2JqZWN0IEdlbmVyYXRvckZ1bmN0aW9uXScsXG4gICAgcHJveHlUYWcgPSAnW29iamVjdCBQcm94eV0nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgRnVuY3Rpb25gIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIGZ1bmN0aW9uLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNGdW5jdGlvbihfKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzRnVuY3Rpb24oL2FiYy8pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0KHZhbHVlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvLyBUaGUgdXNlIG9mIGBPYmplY3QjdG9TdHJpbmdgIGF2b2lkcyBpc3N1ZXMgd2l0aCB0aGUgYHR5cGVvZmAgb3BlcmF0b3JcbiAgLy8gaW4gU2FmYXJpIDkgd2hpY2ggcmV0dXJucyAnb2JqZWN0JyBmb3IgdHlwZWQgYXJyYXlzIGFuZCBvdGhlciBjb25zdHJ1Y3RvcnMuXG4gIHZhciB0YWcgPSBiYXNlR2V0VGFnKHZhbHVlKTtcbiAgcmV0dXJuIHRhZyA9PSBmdW5jVGFnIHx8IHRhZyA9PSBnZW5UYWcgfHwgdGFnID09IGFzeW5jVGFnIHx8IHRhZyA9PSBwcm94eVRhZztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0Z1bmN0aW9uO1xuIiwidmFyIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBvdmVycmVhY2hpbmcgY29yZS1qcyBzaGltcy4gKi9cbnZhciBjb3JlSnNEYXRhID0gcm9vdFsnX19jb3JlLWpzX3NoYXJlZF9fJ107XG5cbm1vZHVsZS5leHBvcnRzID0gY29yZUpzRGF0YTtcbiIsInZhciBjb3JlSnNEYXRhID0gcmVxdWlyZSgnLi9fY29yZUpzRGF0YScpO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgbWV0aG9kcyBtYXNxdWVyYWRpbmcgYXMgbmF0aXZlLiAqL1xudmFyIG1hc2tTcmNLZXkgPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB1aWQgPSAvW14uXSskLy5leGVjKGNvcmVKc0RhdGEgJiYgY29yZUpzRGF0YS5rZXlzICYmIGNvcmVKc0RhdGEua2V5cy5JRV9QUk9UTyB8fCAnJyk7XG4gIHJldHVybiB1aWQgPyAoJ1N5bWJvbChzcmMpXzEuJyArIHVpZCkgOiAnJztcbn0oKSk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGBmdW5jYCBoYXMgaXRzIHNvdXJjZSBtYXNrZWQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGBmdW5jYCBpcyBtYXNrZWQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNNYXNrZWQoZnVuYykge1xuICByZXR1cm4gISFtYXNrU3JjS2V5ICYmIChtYXNrU3JjS2V5IGluIGZ1bmMpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzTWFza2VkO1xuIiwiLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIGZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgZGVjb21waWxlZCBzb3VyY2Ugb2YgZnVuY3Rpb25zLiAqL1xudmFyIGZ1bmNUb1N0cmluZyA9IGZ1bmNQcm90by50b1N0cmluZztcblxuLyoqXG4gKiBDb252ZXJ0cyBgZnVuY2AgdG8gaXRzIHNvdXJjZSBjb2RlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBjb252ZXJ0LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgc291cmNlIGNvZGUuXG4gKi9cbmZ1bmN0aW9uIHRvU291cmNlKGZ1bmMpIHtcbiAgaWYgKGZ1bmMgIT0gbnVsbCkge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gZnVuY1RvU3RyaW5nLmNhbGwoZnVuYyk7XG4gICAgfSBjYXRjaCAoZSkge31cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIChmdW5jICsgJycpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gIH1cbiAgcmV0dXJuICcnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRvU291cmNlO1xuIiwidmFyIGlzRnVuY3Rpb24gPSByZXF1aXJlKCcuL2lzRnVuY3Rpb24nKSxcbiAgICBpc01hc2tlZCA9IHJlcXVpcmUoJy4vX2lzTWFza2VkJyksXG4gICAgaXNPYmplY3QgPSByZXF1aXJlKCcuL2lzT2JqZWN0JyksXG4gICAgdG9Tb3VyY2UgPSByZXF1aXJlKCcuL190b1NvdXJjZScpO1xuXG4vKipcbiAqIFVzZWQgdG8gbWF0Y2ggYFJlZ0V4cGBcbiAqIFtzeW50YXggY2hhcmFjdGVyc10oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtcGF0dGVybnMpLlxuICovXG52YXIgcmVSZWdFeHBDaGFyID0gL1tcXFxcXiQuKis/KClbXFxde318XS9nO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgaG9zdCBjb25zdHJ1Y3RvcnMgKFNhZmFyaSkuICovXG52YXIgcmVJc0hvc3RDdG9yID0gL15cXFtvYmplY3QgLis/Q29uc3RydWN0b3JcXF0kLztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIGZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZSxcbiAgICBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGRlY29tcGlsZWQgc291cmNlIG9mIGZ1bmN0aW9ucy4gKi9cbnZhciBmdW5jVG9TdHJpbmcgPSBmdW5jUHJvdG8udG9TdHJpbmc7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBpZiBhIG1ldGhvZCBpcyBuYXRpdmUuICovXG52YXIgcmVJc05hdGl2ZSA9IFJlZ0V4cCgnXicgK1xuICBmdW5jVG9TdHJpbmcuY2FsbChoYXNPd25Qcm9wZXJ0eSkucmVwbGFjZShyZVJlZ0V4cENoYXIsICdcXFxcJCYnKVxuICAucmVwbGFjZSgvaGFzT3duUHJvcGVydHl8KGZ1bmN0aW9uKS4qPyg/PVxcXFxcXCgpfCBmb3IgLis/KD89XFxcXFxcXSkvZywgJyQxLio/JykgKyAnJCdcbik7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaXNOYXRpdmVgIHdpdGhvdXQgYmFkIHNoaW0gY2hlY2tzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgbmF0aXZlIGZ1bmN0aW9uLFxuICogIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUlzTmF0aXZlKHZhbHVlKSB7XG4gIGlmICghaXNPYmplY3QodmFsdWUpIHx8IGlzTWFza2VkKHZhbHVlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgcGF0dGVybiA9IGlzRnVuY3Rpb24odmFsdWUpID8gcmVJc05hdGl2ZSA6IHJlSXNIb3N0Q3RvcjtcbiAgcmV0dXJuIHBhdHRlcm4udGVzdCh0b1NvdXJjZSh2YWx1ZSkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VJc05hdGl2ZTtcbiIsIi8qKlxuICogR2V0cyB0aGUgdmFsdWUgYXQgYGtleWAgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqZWN0XSBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgcHJvcGVydHkgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGdldFZhbHVlKG9iamVjdCwga2V5KSB7XG4gIHJldHVybiBvYmplY3QgPT0gbnVsbCA/IHVuZGVmaW5lZCA6IG9iamVjdFtrZXldO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFZhbHVlO1xuIiwidmFyIGJhc2VJc05hdGl2ZSA9IHJlcXVpcmUoJy4vX2Jhc2VJc05hdGl2ZScpLFxuICAgIGdldFZhbHVlID0gcmVxdWlyZSgnLi9fZ2V0VmFsdWUnKTtcblxuLyoqXG4gKiBHZXRzIHRoZSBuYXRpdmUgZnVuY3Rpb24gYXQgYGtleWAgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgbWV0aG9kIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBmdW5jdGlvbiBpZiBpdCdzIG5hdGl2ZSwgZWxzZSBgdW5kZWZpbmVkYC5cbiAqL1xuZnVuY3Rpb24gZ2V0TmF0aXZlKG9iamVjdCwga2V5KSB7XG4gIHZhciB2YWx1ZSA9IGdldFZhbHVlKG9iamVjdCwga2V5KTtcbiAgcmV0dXJuIGJhc2VJc05hdGl2ZSh2YWx1ZSkgPyB2YWx1ZSA6IHVuZGVmaW5lZDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXROYXRpdmU7XG4iLCJ2YXIgZ2V0TmF0aXZlID0gcmVxdWlyZSgnLi9fZ2V0TmF0aXZlJyksXG4gICAgcm9vdCA9IHJlcXVpcmUoJy4vX3Jvb3QnKTtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgdGhhdCBhcmUgdmVyaWZpZWQgdG8gYmUgbmF0aXZlLiAqL1xudmFyIE1hcCA9IGdldE5hdGl2ZShyb290LCAnTWFwJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gTWFwO1xuIiwidmFyIGdldE5hdGl2ZSA9IHJlcXVpcmUoJy4vX2dldE5hdGl2ZScpO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB0aGF0IGFyZSB2ZXJpZmllZCB0byBiZSBuYXRpdmUuICovXG52YXIgbmF0aXZlQ3JlYXRlID0gZ2V0TmF0aXZlKE9iamVjdCwgJ2NyZWF0ZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5hdGl2ZUNyZWF0ZTtcbiIsInZhciBuYXRpdmVDcmVhdGUgPSByZXF1aXJlKCcuL19uYXRpdmVDcmVhdGUnKTtcblxuLyoqXG4gKiBSZW1vdmVzIGFsbCBrZXktdmFsdWUgZW50cmllcyBmcm9tIHRoZSBoYXNoLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBjbGVhclxuICogQG1lbWJlck9mIEhhc2hcbiAqL1xuZnVuY3Rpb24gaGFzaENsZWFyKCkge1xuICB0aGlzLl9fZGF0YV9fID0gbmF0aXZlQ3JlYXRlID8gbmF0aXZlQ3JlYXRlKG51bGwpIDoge307XG4gIHRoaXMuc2l6ZSA9IDA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaGFzaENsZWFyO1xuIiwiLyoqXG4gKiBSZW1vdmVzIGBrZXlgIGFuZCBpdHMgdmFsdWUgZnJvbSB0aGUgaGFzaC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZGVsZXRlXG4gKiBAbWVtYmVyT2YgSGFzaFxuICogQHBhcmFtIHtPYmplY3R9IGhhc2ggVGhlIGhhc2ggdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byByZW1vdmUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGVudHJ5IHdhcyByZW1vdmVkLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGhhc2hEZWxldGUoa2V5KSB7XG4gIHZhciByZXN1bHQgPSB0aGlzLmhhcyhrZXkpICYmIGRlbGV0ZSB0aGlzLl9fZGF0YV9fW2tleV07XG4gIHRoaXMuc2l6ZSAtPSByZXN1bHQgPyAxIDogMDtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBoYXNoRGVsZXRlO1xuIiwidmFyIG5hdGl2ZUNyZWF0ZSA9IHJlcXVpcmUoJy4vX25hdGl2ZUNyZWF0ZScpO1xuXG4vKiogVXNlZCB0byBzdGFuZC1pbiBmb3IgYHVuZGVmaW5lZGAgaGFzaCB2YWx1ZXMuICovXG52YXIgSEFTSF9VTkRFRklORUQgPSAnX19sb2Rhc2hfaGFzaF91bmRlZmluZWRfXyc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogR2V0cyB0aGUgaGFzaCB2YWx1ZSBmb3IgYGtleWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGdldFxuICogQG1lbWJlck9mIEhhc2hcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGVudHJ5IHZhbHVlLlxuICovXG5mdW5jdGlvbiBoYXNoR2V0KGtleSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX187XG4gIGlmIChuYXRpdmVDcmVhdGUpIHtcbiAgICB2YXIgcmVzdWx0ID0gZGF0YVtrZXldO1xuICAgIHJldHVybiByZXN1bHQgPT09IEhBU0hfVU5ERUZJTkVEID8gdW5kZWZpbmVkIDogcmVzdWx0O1xuICB9XG4gIHJldHVybiBoYXNPd25Qcm9wZXJ0eS5jYWxsKGRhdGEsIGtleSkgPyBkYXRhW2tleV0gOiB1bmRlZmluZWQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaGFzaEdldDtcbiIsInZhciBuYXRpdmVDcmVhdGUgPSByZXF1aXJlKCcuL19uYXRpdmVDcmVhdGUnKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYSBoYXNoIHZhbHVlIGZvciBga2V5YCBleGlzdHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGhhc1xuICogQG1lbWJlck9mIEhhc2hcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgZW50cnkgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYW4gZW50cnkgZm9yIGBrZXlgIGV4aXN0cywgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBoYXNoSGFzKGtleSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX187XG4gIHJldHVybiBuYXRpdmVDcmVhdGUgPyAoZGF0YVtrZXldICE9PSB1bmRlZmluZWQpIDogaGFzT3duUHJvcGVydHkuY2FsbChkYXRhLCBrZXkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGhhc2hIYXM7XG4iLCJ2YXIgbmF0aXZlQ3JlYXRlID0gcmVxdWlyZSgnLi9fbmF0aXZlQ3JlYXRlJyk7XG5cbi8qKiBVc2VkIHRvIHN0YW5kLWluIGZvciBgdW5kZWZpbmVkYCBoYXNoIHZhbHVlcy4gKi9cbnZhciBIQVNIX1VOREVGSU5FRCA9ICdfX2xvZGFzaF9oYXNoX3VuZGVmaW5lZF9fJztcblxuLyoqXG4gKiBTZXRzIHRoZSBoYXNoIGBrZXlgIHRvIGB2YWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIHNldFxuICogQG1lbWJlck9mIEhhc2hcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gc2V0LlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2V0LlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgaGFzaCBpbnN0YW5jZS5cbiAqL1xuZnVuY3Rpb24gaGFzaFNldChrZXksIHZhbHVlKSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXztcbiAgdGhpcy5zaXplICs9IHRoaXMuaGFzKGtleSkgPyAwIDogMTtcbiAgZGF0YVtrZXldID0gKG5hdGl2ZUNyZWF0ZSAmJiB2YWx1ZSA9PT0gdW5kZWZpbmVkKSA/IEhBU0hfVU5ERUZJTkVEIDogdmFsdWU7XG4gIHJldHVybiB0aGlzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGhhc2hTZXQ7XG4iLCJ2YXIgaGFzaENsZWFyID0gcmVxdWlyZSgnLi9faGFzaENsZWFyJyksXG4gICAgaGFzaERlbGV0ZSA9IHJlcXVpcmUoJy4vX2hhc2hEZWxldGUnKSxcbiAgICBoYXNoR2V0ID0gcmVxdWlyZSgnLi9faGFzaEdldCcpLFxuICAgIGhhc2hIYXMgPSByZXF1aXJlKCcuL19oYXNoSGFzJyksXG4gICAgaGFzaFNldCA9IHJlcXVpcmUoJy4vX2hhc2hTZXQnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgaGFzaCBvYmplY3QuXG4gKlxuICogQHByaXZhdGVcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtBcnJheX0gW2VudHJpZXNdIFRoZSBrZXktdmFsdWUgcGFpcnMgdG8gY2FjaGUuXG4gKi9cbmZ1bmN0aW9uIEhhc2goZW50cmllcykge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGVudHJpZXMgPT0gbnVsbCA/IDAgOiBlbnRyaWVzLmxlbmd0aDtcblxuICB0aGlzLmNsZWFyKCk7XG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgdmFyIGVudHJ5ID0gZW50cmllc1tpbmRleF07XG4gICAgdGhpcy5zZXQoZW50cnlbMF0sIGVudHJ5WzFdKTtcbiAgfVxufVxuXG4vLyBBZGQgbWV0aG9kcyB0byBgSGFzaGAuXG5IYXNoLnByb3RvdHlwZS5jbGVhciA9IGhhc2hDbGVhcjtcbkhhc2gucHJvdG90eXBlWydkZWxldGUnXSA9IGhhc2hEZWxldGU7XG5IYXNoLnByb3RvdHlwZS5nZXQgPSBoYXNoR2V0O1xuSGFzaC5wcm90b3R5cGUuaGFzID0gaGFzaEhhcztcbkhhc2gucHJvdG90eXBlLnNldCA9IGhhc2hTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gSGFzaDtcbiIsInZhciBIYXNoID0gcmVxdWlyZSgnLi9fSGFzaCcpLFxuICAgIExpc3RDYWNoZSA9IHJlcXVpcmUoJy4vX0xpc3RDYWNoZScpLFxuICAgIE1hcCA9IHJlcXVpcmUoJy4vX01hcCcpO1xuXG4vKipcbiAqIFJlbW92ZXMgYWxsIGtleS12YWx1ZSBlbnRyaWVzIGZyb20gdGhlIG1hcC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgY2xlYXJcbiAqIEBtZW1iZXJPZiBNYXBDYWNoZVxuICovXG5mdW5jdGlvbiBtYXBDYWNoZUNsZWFyKCkge1xuICB0aGlzLnNpemUgPSAwO1xuICB0aGlzLl9fZGF0YV9fID0ge1xuICAgICdoYXNoJzogbmV3IEhhc2gsXG4gICAgJ21hcCc6IG5ldyAoTWFwIHx8IExpc3RDYWNoZSksXG4gICAgJ3N0cmluZyc6IG5ldyBIYXNoXG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWFwQ2FjaGVDbGVhcjtcbiIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgc3VpdGFibGUgZm9yIHVzZSBhcyB1bmlxdWUgb2JqZWN0IGtleS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBzdWl0YWJsZSwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0tleWFibGUodmFsdWUpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIHJldHVybiAodHlwZSA9PSAnc3RyaW5nJyB8fCB0eXBlID09ICdudW1iZXInIHx8IHR5cGUgPT0gJ3N5bWJvbCcgfHwgdHlwZSA9PSAnYm9vbGVhbicpXG4gICAgPyAodmFsdWUgIT09ICdfX3Byb3RvX18nKVxuICAgIDogKHZhbHVlID09PSBudWxsKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0tleWFibGU7XG4iLCJ2YXIgaXNLZXlhYmxlID0gcmVxdWlyZSgnLi9faXNLZXlhYmxlJyk7XG5cbi8qKlxuICogR2V0cyB0aGUgZGF0YSBmb3IgYG1hcGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBtYXAgVGhlIG1hcCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIHJlZmVyZW5jZSBrZXkuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgbWFwIGRhdGEuXG4gKi9cbmZ1bmN0aW9uIGdldE1hcERhdGEobWFwLCBrZXkpIHtcbiAgdmFyIGRhdGEgPSBtYXAuX19kYXRhX187XG4gIHJldHVybiBpc0tleWFibGUoa2V5KVxuICAgID8gZGF0YVt0eXBlb2Yga2V5ID09ICdzdHJpbmcnID8gJ3N0cmluZycgOiAnaGFzaCddXG4gICAgOiBkYXRhLm1hcDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRNYXBEYXRhO1xuIiwidmFyIGdldE1hcERhdGEgPSByZXF1aXJlKCcuL19nZXRNYXBEYXRhJyk7XG5cbi8qKlxuICogUmVtb3ZlcyBga2V5YCBhbmQgaXRzIHZhbHVlIGZyb20gdGhlIG1hcC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZGVsZXRlXG4gKiBAbWVtYmVyT2YgTWFwQ2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gcmVtb3ZlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBlbnRyeSB3YXMgcmVtb3ZlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBtYXBDYWNoZURlbGV0ZShrZXkpIHtcbiAgdmFyIHJlc3VsdCA9IGdldE1hcERhdGEodGhpcywga2V5KVsnZGVsZXRlJ10oa2V5KTtcbiAgdGhpcy5zaXplIC09IHJlc3VsdCA/IDEgOiAwO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1hcENhY2hlRGVsZXRlO1xuIiwidmFyIGdldE1hcERhdGEgPSByZXF1aXJlKCcuL19nZXRNYXBEYXRhJyk7XG5cbi8qKlxuICogR2V0cyB0aGUgbWFwIHZhbHVlIGZvciBga2V5YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZ2V0XG4gKiBAbWVtYmVyT2YgTWFwQ2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGVudHJ5IHZhbHVlLlxuICovXG5mdW5jdGlvbiBtYXBDYWNoZUdldChrZXkpIHtcbiAgcmV0dXJuIGdldE1hcERhdGEodGhpcywga2V5KS5nZXQoa2V5KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtYXBDYWNoZUdldDtcbiIsInZhciBnZXRNYXBEYXRhID0gcmVxdWlyZSgnLi9fZ2V0TWFwRGF0YScpO1xuXG4vKipcbiAqIENoZWNrcyBpZiBhIG1hcCB2YWx1ZSBmb3IgYGtleWAgZXhpc3RzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBoYXNcbiAqIEBtZW1iZXJPZiBNYXBDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBlbnRyeSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBhbiBlbnRyeSBmb3IgYGtleWAgZXhpc3RzLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIG1hcENhY2hlSGFzKGtleSkge1xuICByZXR1cm4gZ2V0TWFwRGF0YSh0aGlzLCBrZXkpLmhhcyhrZXkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1hcENhY2hlSGFzO1xuIiwidmFyIGdldE1hcERhdGEgPSByZXF1aXJlKCcuL19nZXRNYXBEYXRhJyk7XG5cbi8qKlxuICogU2V0cyB0aGUgbWFwIGBrZXlgIHRvIGB2YWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIHNldFxuICogQG1lbWJlck9mIE1hcENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHNldC5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHNldC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIG1hcCBjYWNoZSBpbnN0YW5jZS5cbiAqL1xuZnVuY3Rpb24gbWFwQ2FjaGVTZXQoa2V5LCB2YWx1ZSkge1xuICB2YXIgZGF0YSA9IGdldE1hcERhdGEodGhpcywga2V5KSxcbiAgICAgIHNpemUgPSBkYXRhLnNpemU7XG5cbiAgZGF0YS5zZXQoa2V5LCB2YWx1ZSk7XG4gIHRoaXMuc2l6ZSArPSBkYXRhLnNpemUgPT0gc2l6ZSA/IDAgOiAxO1xuICByZXR1cm4gdGhpcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtYXBDYWNoZVNldDtcbiIsInZhciBtYXBDYWNoZUNsZWFyID0gcmVxdWlyZSgnLi9fbWFwQ2FjaGVDbGVhcicpLFxuICAgIG1hcENhY2hlRGVsZXRlID0gcmVxdWlyZSgnLi9fbWFwQ2FjaGVEZWxldGUnKSxcbiAgICBtYXBDYWNoZUdldCA9IHJlcXVpcmUoJy4vX21hcENhY2hlR2V0JyksXG4gICAgbWFwQ2FjaGVIYXMgPSByZXF1aXJlKCcuL19tYXBDYWNoZUhhcycpLFxuICAgIG1hcENhY2hlU2V0ID0gcmVxdWlyZSgnLi9fbWFwQ2FjaGVTZXQnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbWFwIGNhY2hlIG9iamVjdCB0byBzdG9yZSBrZXktdmFsdWUgcGFpcnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtBcnJheX0gW2VudHJpZXNdIFRoZSBrZXktdmFsdWUgcGFpcnMgdG8gY2FjaGUuXG4gKi9cbmZ1bmN0aW9uIE1hcENhY2hlKGVudHJpZXMpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBlbnRyaWVzID09IG51bGwgPyAwIDogZW50cmllcy5sZW5ndGg7XG5cbiAgdGhpcy5jbGVhcigpO1xuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBlbnRyeSA9IGVudHJpZXNbaW5kZXhdO1xuICAgIHRoaXMuc2V0KGVudHJ5WzBdLCBlbnRyeVsxXSk7XG4gIH1cbn1cblxuLy8gQWRkIG1ldGhvZHMgdG8gYE1hcENhY2hlYC5cbk1hcENhY2hlLnByb3RvdHlwZS5jbGVhciA9IG1hcENhY2hlQ2xlYXI7XG5NYXBDYWNoZS5wcm90b3R5cGVbJ2RlbGV0ZSddID0gbWFwQ2FjaGVEZWxldGU7XG5NYXBDYWNoZS5wcm90b3R5cGUuZ2V0ID0gbWFwQ2FjaGVHZXQ7XG5NYXBDYWNoZS5wcm90b3R5cGUuaGFzID0gbWFwQ2FjaGVIYXM7XG5NYXBDYWNoZS5wcm90b3R5cGUuc2V0ID0gbWFwQ2FjaGVTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gTWFwQ2FjaGU7XG4iLCJ2YXIgTGlzdENhY2hlID0gcmVxdWlyZSgnLi9fTGlzdENhY2hlJyksXG4gICAgTWFwID0gcmVxdWlyZSgnLi9fTWFwJyksXG4gICAgTWFwQ2FjaGUgPSByZXF1aXJlKCcuL19NYXBDYWNoZScpO1xuXG4vKiogVXNlZCBhcyB0aGUgc2l6ZSB0byBlbmFibGUgbGFyZ2UgYXJyYXkgb3B0aW1pemF0aW9ucy4gKi9cbnZhciBMQVJHRV9BUlJBWV9TSVpFID0gMjAwO1xuXG4vKipcbiAqIFNldHMgdGhlIHN0YWNrIGBrZXlgIHRvIGB2YWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIHNldFxuICogQG1lbWJlck9mIFN0YWNrXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHNldC5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHNldC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIHN0YWNrIGNhY2hlIGluc3RhbmNlLlxuICovXG5mdW5jdGlvbiBzdGFja1NldChrZXksIHZhbHVlKSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXztcbiAgaWYgKGRhdGEgaW5zdGFuY2VvZiBMaXN0Q2FjaGUpIHtcbiAgICB2YXIgcGFpcnMgPSBkYXRhLl9fZGF0YV9fO1xuICAgIGlmICghTWFwIHx8IChwYWlycy5sZW5ndGggPCBMQVJHRV9BUlJBWV9TSVpFIC0gMSkpIHtcbiAgICAgIHBhaXJzLnB1c2goW2tleSwgdmFsdWVdKTtcbiAgICAgIHRoaXMuc2l6ZSA9ICsrZGF0YS5zaXplO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGRhdGEgPSB0aGlzLl9fZGF0YV9fID0gbmV3IE1hcENhY2hlKHBhaXJzKTtcbiAgfVxuICBkYXRhLnNldChrZXksIHZhbHVlKTtcbiAgdGhpcy5zaXplID0gZGF0YS5zaXplO1xuICByZXR1cm4gdGhpcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdGFja1NldDtcbiIsInZhciBMaXN0Q2FjaGUgPSByZXF1aXJlKCcuL19MaXN0Q2FjaGUnKSxcbiAgICBzdGFja0NsZWFyID0gcmVxdWlyZSgnLi9fc3RhY2tDbGVhcicpLFxuICAgIHN0YWNrRGVsZXRlID0gcmVxdWlyZSgnLi9fc3RhY2tEZWxldGUnKSxcbiAgICBzdGFja0dldCA9IHJlcXVpcmUoJy4vX3N0YWNrR2V0JyksXG4gICAgc3RhY2tIYXMgPSByZXF1aXJlKCcuL19zdGFja0hhcycpLFxuICAgIHN0YWNrU2V0ID0gcmVxdWlyZSgnLi9fc3RhY2tTZXQnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgc3RhY2sgY2FjaGUgb2JqZWN0IHRvIHN0b3JlIGtleS12YWx1ZSBwYWlycy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0FycmF5fSBbZW50cmllc10gVGhlIGtleS12YWx1ZSBwYWlycyB0byBjYWNoZS5cbiAqL1xuZnVuY3Rpb24gU3RhY2soZW50cmllcykge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX18gPSBuZXcgTGlzdENhY2hlKGVudHJpZXMpO1xuICB0aGlzLnNpemUgPSBkYXRhLnNpemU7XG59XG5cbi8vIEFkZCBtZXRob2RzIHRvIGBTdGFja2AuXG5TdGFjay5wcm90b3R5cGUuY2xlYXIgPSBzdGFja0NsZWFyO1xuU3RhY2sucHJvdG90eXBlWydkZWxldGUnXSA9IHN0YWNrRGVsZXRlO1xuU3RhY2sucHJvdG90eXBlLmdldCA9IHN0YWNrR2V0O1xuU3RhY2sucHJvdG90eXBlLmhhcyA9IHN0YWNrSGFzO1xuU3RhY2sucHJvdG90eXBlLnNldCA9IHN0YWNrU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0YWNrO1xuIiwiLyoqIFVzZWQgdG8gc3RhbmQtaW4gZm9yIGB1bmRlZmluZWRgIGhhc2ggdmFsdWVzLiAqL1xudmFyIEhBU0hfVU5ERUZJTkVEID0gJ19fbG9kYXNoX2hhc2hfdW5kZWZpbmVkX18nO1xuXG4vKipcbiAqIEFkZHMgYHZhbHVlYCB0byB0aGUgYXJyYXkgY2FjaGUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGFkZFxuICogQG1lbWJlck9mIFNldENhY2hlXG4gKiBAYWxpYXMgcHVzaFxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2FjaGUuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBjYWNoZSBpbnN0YW5jZS5cbiAqL1xuZnVuY3Rpb24gc2V0Q2FjaGVBZGQodmFsdWUpIHtcbiAgdGhpcy5fX2RhdGFfXy5zZXQodmFsdWUsIEhBU0hfVU5ERUZJTkVEKTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2V0Q2FjaGVBZGQ7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGluIHRoZSBhcnJheSBjYWNoZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgaGFzXG4gKiBAbWVtYmVyT2YgU2V0Q2FjaGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHNlYXJjaCBmb3IuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGZvdW5kLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIHNldENhY2hlSGFzKHZhbHVlKSB7XG4gIHJldHVybiB0aGlzLl9fZGF0YV9fLmhhcyh2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2V0Q2FjaGVIYXM7XG4iLCJ2YXIgTWFwQ2FjaGUgPSByZXF1aXJlKCcuL19NYXBDYWNoZScpLFxuICAgIHNldENhY2hlQWRkID0gcmVxdWlyZSgnLi9fc2V0Q2FjaGVBZGQnKSxcbiAgICBzZXRDYWNoZUhhcyA9IHJlcXVpcmUoJy4vX3NldENhY2hlSGFzJyk7XG5cbi8qKlxuICpcbiAqIENyZWF0ZXMgYW4gYXJyYXkgY2FjaGUgb2JqZWN0IHRvIHN0b3JlIHVuaXF1ZSB2YWx1ZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtBcnJheX0gW3ZhbHVlc10gVGhlIHZhbHVlcyB0byBjYWNoZS5cbiAqL1xuZnVuY3Rpb24gU2V0Q2FjaGUodmFsdWVzKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gdmFsdWVzID09IG51bGwgPyAwIDogdmFsdWVzLmxlbmd0aDtcblxuICB0aGlzLl9fZGF0YV9fID0gbmV3IE1hcENhY2hlO1xuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHRoaXMuYWRkKHZhbHVlc1tpbmRleF0pO1xuICB9XG59XG5cbi8vIEFkZCBtZXRob2RzIHRvIGBTZXRDYWNoZWAuXG5TZXRDYWNoZS5wcm90b3R5cGUuYWRkID0gU2V0Q2FjaGUucHJvdG90eXBlLnB1c2ggPSBzZXRDYWNoZUFkZDtcblNldENhY2hlLnByb3RvdHlwZS5oYXMgPSBzZXRDYWNoZUhhcztcblxubW9kdWxlLmV4cG9ydHMgPSBTZXRDYWNoZTtcbiIsIi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBfLnNvbWVgIGZvciBhcnJheXMgd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZVxuICogc2hvcnRoYW5kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gW2FycmF5XSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcHJlZGljYXRlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYW55IGVsZW1lbnQgcGFzc2VzIHRoZSBwcmVkaWNhdGUgY2hlY2ssXG4gKiAgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBhcnJheVNvbWUoYXJyYXksIHByZWRpY2F0ZSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGFycmF5ID09IG51bGwgPyAwIDogYXJyYXkubGVuZ3RoO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgaWYgKHByZWRpY2F0ZShhcnJheVtpbmRleF0sIGluZGV4LCBhcnJheSkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXJyYXlTb21lO1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYSBgY2FjaGVgIHZhbHVlIGZvciBga2V5YCBleGlzdHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBjYWNoZSBUaGUgY2FjaGUgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIGVudHJ5IHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFuIGVudHJ5IGZvciBga2V5YCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gY2FjaGVIYXMoY2FjaGUsIGtleSkge1xuICByZXR1cm4gY2FjaGUuaGFzKGtleSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2FjaGVIYXM7XG4iLCJ2YXIgU2V0Q2FjaGUgPSByZXF1aXJlKCcuL19TZXRDYWNoZScpLFxuICAgIGFycmF5U29tZSA9IHJlcXVpcmUoJy4vX2FycmF5U29tZScpLFxuICAgIGNhY2hlSGFzID0gcmVxdWlyZSgnLi9fY2FjaGVIYXMnKTtcblxuLyoqIFVzZWQgdG8gY29tcG9zZSBiaXRtYXNrcyBmb3IgdmFsdWUgY29tcGFyaXNvbnMuICovXG52YXIgQ09NUEFSRV9QQVJUSUFMX0ZMQUcgPSAxLFxuICAgIENPTVBBUkVfVU5PUkRFUkVEX0ZMQUcgPSAyO1xuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgYmFzZUlzRXF1YWxEZWVwYCBmb3IgYXJyYXlzIHdpdGggc3VwcG9ydCBmb3JcbiAqIHBhcnRpYWwgZGVlcCBjb21wYXJpc29ucy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0ge0FycmF5fSBvdGhlciBUaGUgb3RoZXIgYXJyYXkgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBiaXRtYXNrIFRoZSBiaXRtYXNrIGZsYWdzLiBTZWUgYGJhc2VJc0VxdWFsYCBmb3IgbW9yZSBkZXRhaWxzLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY3VzdG9taXplciBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIGNvbXBhcmlzb25zLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZXF1YWxGdW5jIFRoZSBmdW5jdGlvbiB0byBkZXRlcm1pbmUgZXF1aXZhbGVudHMgb2YgdmFsdWVzLlxuICogQHBhcmFtIHtPYmplY3R9IHN0YWNrIFRyYWNrcyB0cmF2ZXJzZWQgYGFycmF5YCBhbmQgYG90aGVyYCBvYmplY3RzLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBhcnJheXMgYXJlIGVxdWl2YWxlbnQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gZXF1YWxBcnJheXMoYXJyYXksIG90aGVyLCBiaXRtYXNrLCBjdXN0b21pemVyLCBlcXVhbEZ1bmMsIHN0YWNrKSB7XG4gIHZhciBpc1BhcnRpYWwgPSBiaXRtYXNrICYgQ09NUEFSRV9QQVJUSUFMX0ZMQUcsXG4gICAgICBhcnJMZW5ndGggPSBhcnJheS5sZW5ndGgsXG4gICAgICBvdGhMZW5ndGggPSBvdGhlci5sZW5ndGg7XG5cbiAgaWYgKGFyckxlbmd0aCAhPSBvdGhMZW5ndGggJiYgIShpc1BhcnRpYWwgJiYgb3RoTGVuZ3RoID4gYXJyTGVuZ3RoKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvLyBDaGVjayB0aGF0IGN5Y2xpYyB2YWx1ZXMgYXJlIGVxdWFsLlxuICB2YXIgYXJyU3RhY2tlZCA9IHN0YWNrLmdldChhcnJheSk7XG4gIHZhciBvdGhTdGFja2VkID0gc3RhY2suZ2V0KG90aGVyKTtcbiAgaWYgKGFyclN0YWNrZWQgJiYgb3RoU3RhY2tlZCkge1xuICAgIHJldHVybiBhcnJTdGFja2VkID09IG90aGVyICYmIG90aFN0YWNrZWQgPT0gYXJyYXk7XG4gIH1cbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICByZXN1bHQgPSB0cnVlLFxuICAgICAgc2VlbiA9IChiaXRtYXNrICYgQ09NUEFSRV9VTk9SREVSRURfRkxBRykgPyBuZXcgU2V0Q2FjaGUgOiB1bmRlZmluZWQ7XG5cbiAgc3RhY2suc2V0KGFycmF5LCBvdGhlcik7XG4gIHN0YWNrLnNldChvdGhlciwgYXJyYXkpO1xuXG4gIC8vIElnbm9yZSBub24taW5kZXggcHJvcGVydGllcy5cbiAgd2hpbGUgKCsraW5kZXggPCBhcnJMZW5ndGgpIHtcbiAgICB2YXIgYXJyVmFsdWUgPSBhcnJheVtpbmRleF0sXG4gICAgICAgIG90aFZhbHVlID0gb3RoZXJbaW5kZXhdO1xuXG4gICAgaWYgKGN1c3RvbWl6ZXIpIHtcbiAgICAgIHZhciBjb21wYXJlZCA9IGlzUGFydGlhbFxuICAgICAgICA/IGN1c3RvbWl6ZXIob3RoVmFsdWUsIGFyclZhbHVlLCBpbmRleCwgb3RoZXIsIGFycmF5LCBzdGFjaylcbiAgICAgICAgOiBjdXN0b21pemVyKGFyclZhbHVlLCBvdGhWYWx1ZSwgaW5kZXgsIGFycmF5LCBvdGhlciwgc3RhY2spO1xuICAgIH1cbiAgICBpZiAoY29tcGFyZWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKGNvbXBhcmVkKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgcmVzdWx0ID0gZmFsc2U7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgLy8gUmVjdXJzaXZlbHkgY29tcGFyZSBhcnJheXMgKHN1c2NlcHRpYmxlIHRvIGNhbGwgc3RhY2sgbGltaXRzKS5cbiAgICBpZiAoc2Vlbikge1xuICAgICAgaWYgKCFhcnJheVNvbWUob3RoZXIsIGZ1bmN0aW9uKG90aFZhbHVlLCBvdGhJbmRleCkge1xuICAgICAgICAgICAgaWYgKCFjYWNoZUhhcyhzZWVuLCBvdGhJbmRleCkgJiZcbiAgICAgICAgICAgICAgICAoYXJyVmFsdWUgPT09IG90aFZhbHVlIHx8IGVxdWFsRnVuYyhhcnJWYWx1ZSwgb3RoVmFsdWUsIGJpdG1hc2ssIGN1c3RvbWl6ZXIsIHN0YWNrKSkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHNlZW4ucHVzaChvdGhJbmRleCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSkpIHtcbiAgICAgICAgcmVzdWx0ID0gZmFsc2U7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIShcbiAgICAgICAgICBhcnJWYWx1ZSA9PT0gb3RoVmFsdWUgfHxcbiAgICAgICAgICAgIGVxdWFsRnVuYyhhcnJWYWx1ZSwgb3RoVmFsdWUsIGJpdG1hc2ssIGN1c3RvbWl6ZXIsIHN0YWNrKVxuICAgICAgICApKSB7XG4gICAgICByZXN1bHQgPSBmYWxzZTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICBzdGFja1snZGVsZXRlJ10oYXJyYXkpO1xuICBzdGFja1snZGVsZXRlJ10ob3RoZXIpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGVxdWFsQXJyYXlzO1xuIiwidmFyIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIFVpbnQ4QXJyYXkgPSByb290LlVpbnQ4QXJyYXk7XG5cbm1vZHVsZS5leHBvcnRzID0gVWludDhBcnJheTtcbiIsIi8qKlxuICogQ29udmVydHMgYG1hcGAgdG8gaXRzIGtleS12YWx1ZSBwYWlycy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG1hcCBUaGUgbWFwIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGtleS12YWx1ZSBwYWlycy5cbiAqL1xuZnVuY3Rpb24gbWFwVG9BcnJheShtYXApIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICByZXN1bHQgPSBBcnJheShtYXAuc2l6ZSk7XG5cbiAgbWFwLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgIHJlc3VsdFsrK2luZGV4XSA9IFtrZXksIHZhbHVlXTtcbiAgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWFwVG9BcnJheTtcbiIsIi8qKlxuICogQ29udmVydHMgYHNldGAgdG8gYW4gYXJyYXkgb2YgaXRzIHZhbHVlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHNldCBUaGUgc2V0IHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIHZhbHVlcy5cbiAqL1xuZnVuY3Rpb24gc2V0VG9BcnJheShzZXQpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICByZXN1bHQgPSBBcnJheShzZXQuc2l6ZSk7XG5cbiAgc2V0LmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXN1bHRbKytpbmRleF0gPSB2YWx1ZTtcbiAgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2V0VG9BcnJheTtcbiIsInZhciBTeW1ib2wgPSByZXF1aXJlKCcuL19TeW1ib2wnKSxcbiAgICBVaW50OEFycmF5ID0gcmVxdWlyZSgnLi9fVWludDhBcnJheScpLFxuICAgIGVxID0gcmVxdWlyZSgnLi9lcScpLFxuICAgIGVxdWFsQXJyYXlzID0gcmVxdWlyZSgnLi9fZXF1YWxBcnJheXMnKSxcbiAgICBtYXBUb0FycmF5ID0gcmVxdWlyZSgnLi9fbWFwVG9BcnJheScpLFxuICAgIHNldFRvQXJyYXkgPSByZXF1aXJlKCcuL19zZXRUb0FycmF5Jyk7XG5cbi8qKiBVc2VkIHRvIGNvbXBvc2UgYml0bWFza3MgZm9yIHZhbHVlIGNvbXBhcmlzb25zLiAqL1xudmFyIENPTVBBUkVfUEFSVElBTF9GTEFHID0gMSxcbiAgICBDT01QQVJFX1VOT1JERVJFRF9GTEFHID0gMjtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGJvb2xUYWcgPSAnW29iamVjdCBCb29sZWFuXScsXG4gICAgZGF0ZVRhZyA9ICdbb2JqZWN0IERhdGVdJyxcbiAgICBlcnJvclRhZyA9ICdbb2JqZWN0IEVycm9yXScsXG4gICAgbWFwVGFnID0gJ1tvYmplY3QgTWFwXScsXG4gICAgbnVtYmVyVGFnID0gJ1tvYmplY3QgTnVtYmVyXScsXG4gICAgcmVnZXhwVGFnID0gJ1tvYmplY3QgUmVnRXhwXScsXG4gICAgc2V0VGFnID0gJ1tvYmplY3QgU2V0XScsXG4gICAgc3RyaW5nVGFnID0gJ1tvYmplY3QgU3RyaW5nXScsXG4gICAgc3ltYm9sVGFnID0gJ1tvYmplY3QgU3ltYm9sXSc7XG5cbnZhciBhcnJheUJ1ZmZlclRhZyA9ICdbb2JqZWN0IEFycmF5QnVmZmVyXScsXG4gICAgZGF0YVZpZXdUYWcgPSAnW29iamVjdCBEYXRhVmlld10nO1xuXG4vKiogVXNlZCB0byBjb252ZXJ0IHN5bWJvbHMgdG8gcHJpbWl0aXZlcyBhbmQgc3RyaW5ncy4gKi9cbnZhciBzeW1ib2xQcm90byA9IFN5bWJvbCA/IFN5bWJvbC5wcm90b3R5cGUgOiB1bmRlZmluZWQsXG4gICAgc3ltYm9sVmFsdWVPZiA9IHN5bWJvbFByb3RvID8gc3ltYm9sUHJvdG8udmFsdWVPZiA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYGJhc2VJc0VxdWFsRGVlcGAgZm9yIGNvbXBhcmluZyBvYmplY3RzIG9mXG4gKiB0aGUgc2FtZSBgdG9TdHJpbmdUYWdgLlxuICpcbiAqICoqTm90ZToqKiBUaGlzIGZ1bmN0aW9uIG9ubHkgc3VwcG9ydHMgY29tcGFyaW5nIHZhbHVlcyB3aXRoIHRhZ3Mgb2ZcbiAqIGBCb29sZWFuYCwgYERhdGVgLCBgRXJyb3JgLCBgTnVtYmVyYCwgYFJlZ0V4cGAsIG9yIGBTdHJpbmdgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvdGhlciBUaGUgb3RoZXIgb2JqZWN0IHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0ge3N0cmluZ30gdGFnIFRoZSBgdG9TdHJpbmdUYWdgIG9mIHRoZSBvYmplY3RzIHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0ge251bWJlcn0gYml0bWFzayBUaGUgYml0bWFzayBmbGFncy4gU2VlIGBiYXNlSXNFcXVhbGAgZm9yIG1vcmUgZGV0YWlscy5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGN1c3RvbWl6ZXIgVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBjb21wYXJpc29ucy5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGVxdWFsRnVuYyBUaGUgZnVuY3Rpb24gdG8gZGV0ZXJtaW5lIGVxdWl2YWxlbnRzIG9mIHZhbHVlcy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBzdGFjayBUcmFja3MgdHJhdmVyc2VkIGBvYmplY3RgIGFuZCBgb3RoZXJgIG9iamVjdHMuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIG9iamVjdHMgYXJlIGVxdWl2YWxlbnQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gZXF1YWxCeVRhZyhvYmplY3QsIG90aGVyLCB0YWcsIGJpdG1hc2ssIGN1c3RvbWl6ZXIsIGVxdWFsRnVuYywgc3RhY2spIHtcbiAgc3dpdGNoICh0YWcpIHtcbiAgICBjYXNlIGRhdGFWaWV3VGFnOlxuICAgICAgaWYgKChvYmplY3QuYnl0ZUxlbmd0aCAhPSBvdGhlci5ieXRlTGVuZ3RoKSB8fFxuICAgICAgICAgIChvYmplY3QuYnl0ZU9mZnNldCAhPSBvdGhlci5ieXRlT2Zmc2V0KSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBvYmplY3QgPSBvYmplY3QuYnVmZmVyO1xuICAgICAgb3RoZXIgPSBvdGhlci5idWZmZXI7XG5cbiAgICBjYXNlIGFycmF5QnVmZmVyVGFnOlxuICAgICAgaWYgKChvYmplY3QuYnl0ZUxlbmd0aCAhPSBvdGhlci5ieXRlTGVuZ3RoKSB8fFxuICAgICAgICAgICFlcXVhbEZ1bmMobmV3IFVpbnQ4QXJyYXkob2JqZWN0KSwgbmV3IFVpbnQ4QXJyYXkob3RoZXIpKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcblxuICAgIGNhc2UgYm9vbFRhZzpcbiAgICBjYXNlIGRhdGVUYWc6XG4gICAgY2FzZSBudW1iZXJUYWc6XG4gICAgICAvLyBDb2VyY2UgYm9vbGVhbnMgdG8gYDFgIG9yIGAwYCBhbmQgZGF0ZXMgdG8gbWlsbGlzZWNvbmRzLlxuICAgICAgLy8gSW52YWxpZCBkYXRlcyBhcmUgY29lcmNlZCB0byBgTmFOYC5cbiAgICAgIHJldHVybiBlcSgrb2JqZWN0LCArb3RoZXIpO1xuXG4gICAgY2FzZSBlcnJvclRhZzpcbiAgICAgIHJldHVybiBvYmplY3QubmFtZSA9PSBvdGhlci5uYW1lICYmIG9iamVjdC5tZXNzYWdlID09IG90aGVyLm1lc3NhZ2U7XG5cbiAgICBjYXNlIHJlZ2V4cFRhZzpcbiAgICBjYXNlIHN0cmluZ1RhZzpcbiAgICAgIC8vIENvZXJjZSByZWdleGVzIHRvIHN0cmluZ3MgYW5kIHRyZWF0IHN0cmluZ3MsIHByaW1pdGl2ZXMgYW5kIG9iamVjdHMsXG4gICAgICAvLyBhcyBlcXVhbC4gU2VlIGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1yZWdleHAucHJvdG90eXBlLnRvc3RyaW5nXG4gICAgICAvLyBmb3IgbW9yZSBkZXRhaWxzLlxuICAgICAgcmV0dXJuIG9iamVjdCA9PSAob3RoZXIgKyAnJyk7XG5cbiAgICBjYXNlIG1hcFRhZzpcbiAgICAgIHZhciBjb252ZXJ0ID0gbWFwVG9BcnJheTtcblxuICAgIGNhc2Ugc2V0VGFnOlxuICAgICAgdmFyIGlzUGFydGlhbCA9IGJpdG1hc2sgJiBDT01QQVJFX1BBUlRJQUxfRkxBRztcbiAgICAgIGNvbnZlcnQgfHwgKGNvbnZlcnQgPSBzZXRUb0FycmF5KTtcblxuICAgICAgaWYgKG9iamVjdC5zaXplICE9IG90aGVyLnNpemUgJiYgIWlzUGFydGlhbCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICAvLyBBc3N1bWUgY3ljbGljIHZhbHVlcyBhcmUgZXF1YWwuXG4gICAgICB2YXIgc3RhY2tlZCA9IHN0YWNrLmdldChvYmplY3QpO1xuICAgICAgaWYgKHN0YWNrZWQpIHtcbiAgICAgICAgcmV0dXJuIHN0YWNrZWQgPT0gb3RoZXI7XG4gICAgICB9XG4gICAgICBiaXRtYXNrIHw9IENPTVBBUkVfVU5PUkRFUkVEX0ZMQUc7XG5cbiAgICAgIC8vIFJlY3Vyc2l2ZWx5IGNvbXBhcmUgb2JqZWN0cyAoc3VzY2VwdGlibGUgdG8gY2FsbCBzdGFjayBsaW1pdHMpLlxuICAgICAgc3RhY2suc2V0KG9iamVjdCwgb3RoZXIpO1xuICAgICAgdmFyIHJlc3VsdCA9IGVxdWFsQXJyYXlzKGNvbnZlcnQob2JqZWN0KSwgY29udmVydChvdGhlciksIGJpdG1hc2ssIGN1c3RvbWl6ZXIsIGVxdWFsRnVuYywgc3RhY2spO1xuICAgICAgc3RhY2tbJ2RlbGV0ZSddKG9iamVjdCk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuXG4gICAgY2FzZSBzeW1ib2xUYWc6XG4gICAgICBpZiAoc3ltYm9sVmFsdWVPZikge1xuICAgICAgICByZXR1cm4gc3ltYm9sVmFsdWVPZi5jYWxsKG9iamVjdCkgPT0gc3ltYm9sVmFsdWVPZi5jYWxsKG90aGVyKTtcbiAgICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXF1YWxCeVRhZztcbiIsIi8qKlxuICogQXBwZW5kcyB0aGUgZWxlbWVudHMgb2YgYHZhbHVlc2AgdG8gYGFycmF5YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7QXJyYXl9IHZhbHVlcyBUaGUgdmFsdWVzIHRvIGFwcGVuZC5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBgYXJyYXlgLlxuICovXG5mdW5jdGlvbiBhcnJheVB1c2goYXJyYXksIHZhbHVlcykge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IHZhbHVlcy5sZW5ndGgsXG4gICAgICBvZmZzZXQgPSBhcnJheS5sZW5ndGg7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICBhcnJheVtvZmZzZXQgKyBpbmRleF0gPSB2YWx1ZXNbaW5kZXhdO1xuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhcnJheVB1c2g7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYW4gYEFycmF5YCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gYXJyYXksIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FycmF5KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5KGRvY3VtZW50LmJvZHkuY2hpbGRyZW4pO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzQXJyYXkoJ2FiYycpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzQXJyYXkoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcblxubW9kdWxlLmV4cG9ydHMgPSBpc0FycmF5O1xuIiwidmFyIGFycmF5UHVzaCA9IHJlcXVpcmUoJy4vX2FycmF5UHVzaCcpLFxuICAgIGlzQXJyYXkgPSByZXF1aXJlKCcuL2lzQXJyYXknKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgZ2V0QWxsS2V5c2AgYW5kIGBnZXRBbGxLZXlzSW5gIHdoaWNoIHVzZXNcbiAqIGBrZXlzRnVuY2AgYW5kIGBzeW1ib2xzRnVuY2AgdG8gZ2V0IHRoZSBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIGFuZFxuICogc3ltYm9scyBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtGdW5jdGlvbn0ga2V5c0Z1bmMgVGhlIGZ1bmN0aW9uIHRvIGdldCB0aGUga2V5cyBvZiBgb2JqZWN0YC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHN5bWJvbHNGdW5jIFRoZSBmdW5jdGlvbiB0byBnZXQgdGhlIHN5bWJvbHMgb2YgYG9iamVjdGAuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzIGFuZCBzeW1ib2xzLlxuICovXG5mdW5jdGlvbiBiYXNlR2V0QWxsS2V5cyhvYmplY3QsIGtleXNGdW5jLCBzeW1ib2xzRnVuYykge1xuICB2YXIgcmVzdWx0ID0ga2V5c0Z1bmMob2JqZWN0KTtcbiAgcmV0dXJuIGlzQXJyYXkob2JqZWN0KSA/IHJlc3VsdCA6IGFycmF5UHVzaChyZXN1bHQsIHN5bWJvbHNGdW5jKG9iamVjdCkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VHZXRBbGxLZXlzO1xuIiwiLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYF8uZmlsdGVyYCBmb3IgYXJyYXlzIHdpdGhvdXQgc3VwcG9ydCBmb3JcbiAqIGl0ZXJhdGVlIHNob3J0aGFuZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IFthcnJheV0gVGhlIGFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHByZWRpY2F0ZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBuZXcgZmlsdGVyZWQgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIGFycmF5RmlsdGVyKGFycmF5LCBwcmVkaWNhdGUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBhcnJheSA9PSBudWxsID8gMCA6IGFycmF5Lmxlbmd0aCxcbiAgICAgIHJlc0luZGV4ID0gMCxcbiAgICAgIHJlc3VsdCA9IFtdO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgdmFyIHZhbHVlID0gYXJyYXlbaW5kZXhdO1xuICAgIGlmIChwcmVkaWNhdGUodmFsdWUsIGluZGV4LCBhcnJheSkpIHtcbiAgICAgIHJlc3VsdFtyZXNJbmRleCsrXSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFycmF5RmlsdGVyO1xuIiwiLyoqXG4gKiBUaGlzIG1ldGhvZCByZXR1cm5zIGEgbmV3IGVtcHR5IGFycmF5LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4xMy4wXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBuZXcgZW1wdHkgYXJyYXkuXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBhcnJheXMgPSBfLnRpbWVzKDIsIF8uc3R1YkFycmF5KTtcbiAqXG4gKiBjb25zb2xlLmxvZyhhcnJheXMpO1xuICogLy8gPT4gW1tdLCBbXV1cbiAqXG4gKiBjb25zb2xlLmxvZyhhcnJheXNbMF0gPT09IGFycmF5c1sxXSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBzdHViQXJyYXkoKSB7XG4gIHJldHVybiBbXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdHViQXJyYXk7XG4iLCJ2YXIgYXJyYXlGaWx0ZXIgPSByZXF1aXJlKCcuL19hcnJheUZpbHRlcicpLFxuICAgIHN0dWJBcnJheSA9IHJlcXVpcmUoJy4vc3R1YkFycmF5Jyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHByb3BlcnR5SXNFbnVtZXJhYmxlID0gb2JqZWN0UHJvdG8ucHJvcGVydHlJc0VudW1lcmFibGU7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVHZXRTeW1ib2xzID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scztcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIHRoZSBvd24gZW51bWVyYWJsZSBzeW1ib2xzIG9mIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHN5bWJvbHMuXG4gKi9cbnZhciBnZXRTeW1ib2xzID0gIW5hdGl2ZUdldFN5bWJvbHMgPyBzdHViQXJyYXkgOiBmdW5jdGlvbihvYmplY3QpIHtcbiAgaWYgKG9iamVjdCA9PSBudWxsKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG4gIG9iamVjdCA9IE9iamVjdChvYmplY3QpO1xuICByZXR1cm4gYXJyYXlGaWx0ZXIobmF0aXZlR2V0U3ltYm9scyhvYmplY3QpLCBmdW5jdGlvbihzeW1ib2wpIHtcbiAgICByZXR1cm4gcHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChvYmplY3QsIHN5bWJvbCk7XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBnZXRTeW1ib2xzO1xuIiwiLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy50aW1lc2Agd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZSBzaG9ydGhhbmRzXG4gKiBvciBtYXggYXJyYXkgbGVuZ3RoIGNoZWNrcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IG4gVGhlIG51bWJlciBvZiB0aW1lcyB0byBpbnZva2UgYGl0ZXJhdGVlYC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHJlc3VsdHMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VUaW1lcyhuLCBpdGVyYXRlZSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIHJlc3VsdCA9IEFycmF5KG4pO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbikge1xuICAgIHJlc3VsdFtpbmRleF0gPSBpdGVyYXRlZShpbmRleCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlVGltZXM7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLiBBIHZhbHVlIGlzIG9iamVjdC1saWtlIGlmIGl0J3Mgbm90IGBudWxsYFxuICogYW5kIGhhcyBhIGB0eXBlb2ZgIHJlc3VsdCBvZiBcIm9iamVjdFwiLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3RMaWtlKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0Jztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc09iamVjdExpa2U7XG4iLCJ2YXIgYmFzZUdldFRhZyA9IHJlcXVpcmUoJy4vX2Jhc2VHZXRUYWcnKSxcbiAgICBpc09iamVjdExpa2UgPSByZXF1aXJlKCcuL2lzT2JqZWN0TGlrZScpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXJnc1RhZyA9ICdbb2JqZWN0IEFyZ3VtZW50c10nO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzQXJndW1lbnRzYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBgYXJndW1lbnRzYCBvYmplY3QsXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc0FyZ3VtZW50cyh2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBiYXNlR2V0VGFnKHZhbHVlKSA9PSBhcmdzVGFnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VJc0FyZ3VtZW50cztcbiIsInZhciBiYXNlSXNBcmd1bWVudHMgPSByZXF1aXJlKCcuL19iYXNlSXNBcmd1bWVudHMnKSxcbiAgICBpc09iamVjdExpa2UgPSByZXF1aXJlKCcuL2lzT2JqZWN0TGlrZScpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBwcm9wZXJ0eUlzRW51bWVyYWJsZSA9IG9iamVjdFByb3RvLnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGxpa2VseSBhbiBgYXJndW1lbnRzYCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LFxuICogIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FyZ3VtZW50cyhmdW5jdGlvbigpIHsgcmV0dXJuIGFyZ3VtZW50czsgfSgpKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJndW1lbnRzKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNBcmd1bWVudHMgPSBiYXNlSXNBcmd1bWVudHMoZnVuY3Rpb24oKSB7IHJldHVybiBhcmd1bWVudHM7IH0oKSkgPyBiYXNlSXNBcmd1bWVudHMgOiBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCAnY2FsbGVlJykgJiZcbiAgICAhcHJvcGVydHlJc0VudW1lcmFibGUuY2FsbCh2YWx1ZSwgJ2NhbGxlZScpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBpc0FyZ3VtZW50cztcbiIsIi8qKlxuICogVGhpcyBtZXRob2QgcmV0dXJucyBgZmFsc2VgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4xMy4wXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy50aW1lcygyLCBfLnN0dWJGYWxzZSk7XG4gKiAvLyA9PiBbZmFsc2UsIGZhbHNlXVxuICovXG5mdW5jdGlvbiBzdHViRmFsc2UoKSB7XG4gIHJldHVybiBmYWxzZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdHViRmFsc2U7XG4iLCJ2YXIgcm9vdCA9IHJlcXVpcmUoJy4vX3Jvb3QnKSxcbiAgICBzdHViRmFsc2UgPSByZXF1aXJlKCcuL3N0dWJGYWxzZScpO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGV4cG9ydHNgLiAqL1xudmFyIGZyZWVFeHBvcnRzID0gdHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcgJiYgZXhwb3J0cyAmJiAhZXhwb3J0cy5ub2RlVHlwZSAmJiBleHBvcnRzO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYG1vZHVsZWAuICovXG52YXIgZnJlZU1vZHVsZSA9IGZyZWVFeHBvcnRzICYmIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlICYmICFtb2R1bGUubm9kZVR5cGUgJiYgbW9kdWxlO1xuXG4vKiogRGV0ZWN0IHRoZSBwb3B1bGFyIENvbW1vbkpTIGV4dGVuc2lvbiBgbW9kdWxlLmV4cG9ydHNgLiAqL1xudmFyIG1vZHVsZUV4cG9ydHMgPSBmcmVlTW9kdWxlICYmIGZyZWVNb2R1bGUuZXhwb3J0cyA9PT0gZnJlZUV4cG9ydHM7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIEJ1ZmZlciA9IG1vZHVsZUV4cG9ydHMgPyByb290LkJ1ZmZlciA6IHVuZGVmaW5lZDtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZUlzQnVmZmVyID0gQnVmZmVyID8gQnVmZmVyLmlzQnVmZmVyIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgYnVmZmVyLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4zLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgYnVmZmVyLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNCdWZmZXIobmV3IEJ1ZmZlcigyKSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0J1ZmZlcihuZXcgVWludDhBcnJheSgyKSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNCdWZmZXIgPSBuYXRpdmVJc0J1ZmZlciB8fCBzdHViRmFsc2U7XG5cbm1vZHVsZS5leHBvcnRzID0gaXNCdWZmZXI7XG4iLCIvKiogVXNlZCBhcyByZWZlcmVuY2VzIGZvciB2YXJpb3VzIGBOdW1iZXJgIGNvbnN0YW50cy4gKi9cbnZhciBNQVhfU0FGRV9JTlRFR0VSID0gOTAwNzE5OTI1NDc0MDk5MTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IHVuc2lnbmVkIGludGVnZXIgdmFsdWVzLiAqL1xudmFyIHJlSXNVaW50ID0gL14oPzowfFsxLTldXFxkKikkLztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGFycmF5LWxpa2UgaW5kZXguXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHBhcmFtIHtudW1iZXJ9IFtsZW5ndGg9TUFYX1NBRkVfSU5URUdFUl0gVGhlIHVwcGVyIGJvdW5kcyBvZiBhIHZhbGlkIGluZGV4LlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBpbmRleCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0luZGV4KHZhbHVlLCBsZW5ndGgpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIGxlbmd0aCA9IGxlbmd0aCA9PSBudWxsID8gTUFYX1NBRkVfSU5URUdFUiA6IGxlbmd0aDtcblxuICByZXR1cm4gISFsZW5ndGggJiZcbiAgICAodHlwZSA9PSAnbnVtYmVyJyB8fFxuICAgICAgKHR5cGUgIT0gJ3N5bWJvbCcgJiYgcmVJc1VpbnQudGVzdCh2YWx1ZSkpKSAmJlxuICAgICAgICAodmFsdWUgPiAtMSAmJiB2YWx1ZSAlIDEgPT0gMCAmJiB2YWx1ZSA8IGxlbmd0aCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNJbmRleDtcbiIsIi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIE1BWF9TQUZFX0lOVEVHRVIgPSA5MDA3MTk5MjU0NzQwOTkxO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgYXJyYXktbGlrZSBsZW5ndGguXG4gKlxuICogKipOb3RlOioqIFRoaXMgbWV0aG9kIGlzIGxvb3NlbHkgYmFzZWQgb25cbiAqIFtgVG9MZW5ndGhgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy10b2xlbmd0aCkuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBsZW5ndGgsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0xlbmd0aCgzKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzTGVuZ3RoKE51bWJlci5NSU5fVkFMVUUpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzTGVuZ3RoKEluZmluaXR5KTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0xlbmd0aCgnMycpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNMZW5ndGgodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJyAmJlxuICAgIHZhbHVlID4gLTEgJiYgdmFsdWUgJSAxID09IDAgJiYgdmFsdWUgPD0gTUFYX1NBRkVfSU5URUdFUjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0xlbmd0aDtcbiIsInZhciBiYXNlR2V0VGFnID0gcmVxdWlyZSgnLi9fYmFzZUdldFRhZycpLFxuICAgIGlzTGVuZ3RoID0gcmVxdWlyZSgnLi9pc0xlbmd0aCcpLFxuICAgIGlzT2JqZWN0TGlrZSA9IHJlcXVpcmUoJy4vaXNPYmplY3RMaWtlJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBhcmdzVGFnID0gJ1tvYmplY3QgQXJndW1lbnRzXScsXG4gICAgYXJyYXlUYWcgPSAnW29iamVjdCBBcnJheV0nLFxuICAgIGJvb2xUYWcgPSAnW29iamVjdCBCb29sZWFuXScsXG4gICAgZGF0ZVRhZyA9ICdbb2JqZWN0IERhdGVdJyxcbiAgICBlcnJvclRhZyA9ICdbb2JqZWN0IEVycm9yXScsXG4gICAgZnVuY1RhZyA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgbWFwVGFnID0gJ1tvYmplY3QgTWFwXScsXG4gICAgbnVtYmVyVGFnID0gJ1tvYmplY3QgTnVtYmVyXScsXG4gICAgb2JqZWN0VGFnID0gJ1tvYmplY3QgT2JqZWN0XScsXG4gICAgcmVnZXhwVGFnID0gJ1tvYmplY3QgUmVnRXhwXScsXG4gICAgc2V0VGFnID0gJ1tvYmplY3QgU2V0XScsXG4gICAgc3RyaW5nVGFnID0gJ1tvYmplY3QgU3RyaW5nXScsXG4gICAgd2Vha01hcFRhZyA9ICdbb2JqZWN0IFdlYWtNYXBdJztcblxudmFyIGFycmF5QnVmZmVyVGFnID0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJyxcbiAgICBkYXRhVmlld1RhZyA9ICdbb2JqZWN0IERhdGFWaWV3XScsXG4gICAgZmxvYXQzMlRhZyA9ICdbb2JqZWN0IEZsb2F0MzJBcnJheV0nLFxuICAgIGZsb2F0NjRUYWcgPSAnW29iamVjdCBGbG9hdDY0QXJyYXldJyxcbiAgICBpbnQ4VGFnID0gJ1tvYmplY3QgSW50OEFycmF5XScsXG4gICAgaW50MTZUYWcgPSAnW29iamVjdCBJbnQxNkFycmF5XScsXG4gICAgaW50MzJUYWcgPSAnW29iamVjdCBJbnQzMkFycmF5XScsXG4gICAgdWludDhUYWcgPSAnW29iamVjdCBVaW50OEFycmF5XScsXG4gICAgdWludDhDbGFtcGVkVGFnID0gJ1tvYmplY3QgVWludDhDbGFtcGVkQXJyYXldJyxcbiAgICB1aW50MTZUYWcgPSAnW29iamVjdCBVaW50MTZBcnJheV0nLFxuICAgIHVpbnQzMlRhZyA9ICdbb2JqZWN0IFVpbnQzMkFycmF5XSc7XG5cbi8qKiBVc2VkIHRvIGlkZW50aWZ5IGB0b1N0cmluZ1RhZ2AgdmFsdWVzIG9mIHR5cGVkIGFycmF5cy4gKi9cbnZhciB0eXBlZEFycmF5VGFncyA9IHt9O1xudHlwZWRBcnJheVRhZ3NbZmxvYXQzMlRhZ10gPSB0eXBlZEFycmF5VGFnc1tmbG9hdDY0VGFnXSA9XG50eXBlZEFycmF5VGFnc1tpbnQ4VGFnXSA9IHR5cGVkQXJyYXlUYWdzW2ludDE2VGFnXSA9XG50eXBlZEFycmF5VGFnc1tpbnQzMlRhZ10gPSB0eXBlZEFycmF5VGFnc1t1aW50OFRhZ10gPVxudHlwZWRBcnJheVRhZ3NbdWludDhDbGFtcGVkVGFnXSA9IHR5cGVkQXJyYXlUYWdzW3VpbnQxNlRhZ10gPVxudHlwZWRBcnJheVRhZ3NbdWludDMyVGFnXSA9IHRydWU7XG50eXBlZEFycmF5VGFnc1thcmdzVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2FycmF5VGFnXSA9XG50eXBlZEFycmF5VGFnc1thcnJheUJ1ZmZlclRhZ10gPSB0eXBlZEFycmF5VGFnc1tib29sVGFnXSA9XG50eXBlZEFycmF5VGFnc1tkYXRhVmlld1RhZ10gPSB0eXBlZEFycmF5VGFnc1tkYXRlVGFnXSA9XG50eXBlZEFycmF5VGFnc1tlcnJvclRhZ10gPSB0eXBlZEFycmF5VGFnc1tmdW5jVGFnXSA9XG50eXBlZEFycmF5VGFnc1ttYXBUYWddID0gdHlwZWRBcnJheVRhZ3NbbnVtYmVyVGFnXSA9XG50eXBlZEFycmF5VGFnc1tvYmplY3RUYWddID0gdHlwZWRBcnJheVRhZ3NbcmVnZXhwVGFnXSA9XG50eXBlZEFycmF5VGFnc1tzZXRUYWddID0gdHlwZWRBcnJheVRhZ3Nbc3RyaW5nVGFnXSA9XG50eXBlZEFycmF5VGFnc1t3ZWFrTWFwVGFnXSA9IGZhbHNlO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzVHlwZWRBcnJheWAgd2l0aG91dCBOb2RlLmpzIG9wdGltaXphdGlvbnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB0eXBlZCBhcnJheSwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBiYXNlSXNUeXBlZEFycmF5KHZhbHVlKSB7XG4gIHJldHVybiBpc09iamVjdExpa2UodmFsdWUpICYmXG4gICAgaXNMZW5ndGgodmFsdWUubGVuZ3RoKSAmJiAhIXR5cGVkQXJyYXlUYWdzW2Jhc2VHZXRUYWcodmFsdWUpXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlSXNUeXBlZEFycmF5O1xuIiwiLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy51bmFyeWAgd2l0aG91dCBzdXBwb3J0IGZvciBzdG9yaW5nIG1ldGFkYXRhLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBjYXAgYXJndW1lbnRzIGZvci5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGNhcHBlZCBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmFzZVVuYXJ5KGZ1bmMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIGZ1bmModmFsdWUpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VVbmFyeTtcbiIsInZhciBmcmVlR2xvYmFsID0gcmVxdWlyZSgnLi9fZnJlZUdsb2JhbCcpO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGV4cG9ydHNgLiAqL1xudmFyIGZyZWVFeHBvcnRzID0gdHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcgJiYgZXhwb3J0cyAmJiAhZXhwb3J0cy5ub2RlVHlwZSAmJiBleHBvcnRzO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYG1vZHVsZWAuICovXG52YXIgZnJlZU1vZHVsZSA9IGZyZWVFeHBvcnRzICYmIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlICYmICFtb2R1bGUubm9kZVR5cGUgJiYgbW9kdWxlO1xuXG4vKiogRGV0ZWN0IHRoZSBwb3B1bGFyIENvbW1vbkpTIGV4dGVuc2lvbiBgbW9kdWxlLmV4cG9ydHNgLiAqL1xudmFyIG1vZHVsZUV4cG9ydHMgPSBmcmVlTW9kdWxlICYmIGZyZWVNb2R1bGUuZXhwb3J0cyA9PT0gZnJlZUV4cG9ydHM7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgcHJvY2Vzc2AgZnJvbSBOb2RlLmpzLiAqL1xudmFyIGZyZWVQcm9jZXNzID0gbW9kdWxlRXhwb3J0cyAmJiBmcmVlR2xvYmFsLnByb2Nlc3M7XG5cbi8qKiBVc2VkIHRvIGFjY2VzcyBmYXN0ZXIgTm9kZS5qcyBoZWxwZXJzLiAqL1xudmFyIG5vZGVVdGlsID0gKGZ1bmN0aW9uKCkge1xuICB0cnkge1xuICAgIC8vIFVzZSBgdXRpbC50eXBlc2AgZm9yIE5vZGUuanMgMTArLlxuICAgIHZhciB0eXBlcyA9IGZyZWVNb2R1bGUgJiYgZnJlZU1vZHVsZS5yZXF1aXJlICYmIGZyZWVNb2R1bGUucmVxdWlyZSgndXRpbCcpLnR5cGVzO1xuXG4gICAgaWYgKHR5cGVzKSB7XG4gICAgICByZXR1cm4gdHlwZXM7XG4gICAgfVxuXG4gICAgLy8gTGVnYWN5IGBwcm9jZXNzLmJpbmRpbmcoJ3V0aWwnKWAgZm9yIE5vZGUuanMgPCAxMC5cbiAgICByZXR1cm4gZnJlZVByb2Nlc3MgJiYgZnJlZVByb2Nlc3MuYmluZGluZyAmJiBmcmVlUHJvY2Vzcy5iaW5kaW5nKCd1dGlsJyk7XG4gIH0gY2F0Y2ggKGUpIHt9XG59KCkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5vZGVVdGlsO1xuIiwidmFyIGJhc2VJc1R5cGVkQXJyYXkgPSByZXF1aXJlKCcuL19iYXNlSXNUeXBlZEFycmF5JyksXG4gICAgYmFzZVVuYXJ5ID0gcmVxdWlyZSgnLi9fYmFzZVVuYXJ5JyksXG4gICAgbm9kZVV0aWwgPSByZXF1aXJlKCcuL19ub2RlVXRpbCcpO1xuXG4vKiBOb2RlLmpzIGhlbHBlciByZWZlcmVuY2VzLiAqL1xudmFyIG5vZGVJc1R5cGVkQXJyYXkgPSBub2RlVXRpbCAmJiBub2RlVXRpbC5pc1R5cGVkQXJyYXk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIHR5cGVkIGFycmF5LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMy4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgdHlwZWQgYXJyYXksIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc1R5cGVkQXJyYXkobmV3IFVpbnQ4QXJyYXkpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNUeXBlZEFycmF5KFtdKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbnZhciBpc1R5cGVkQXJyYXkgPSBub2RlSXNUeXBlZEFycmF5ID8gYmFzZVVuYXJ5KG5vZGVJc1R5cGVkQXJyYXkpIDogYmFzZUlzVHlwZWRBcnJheTtcblxubW9kdWxlLmV4cG9ydHMgPSBpc1R5cGVkQXJyYXk7XG4iLCJ2YXIgYmFzZVRpbWVzID0gcmVxdWlyZSgnLi9fYmFzZVRpbWVzJyksXG4gICAgaXNBcmd1bWVudHMgPSByZXF1aXJlKCcuL2lzQXJndW1lbnRzJyksXG4gICAgaXNBcnJheSA9IHJlcXVpcmUoJy4vaXNBcnJheScpLFxuICAgIGlzQnVmZmVyID0gcmVxdWlyZSgnLi9pc0J1ZmZlcicpLFxuICAgIGlzSW5kZXggPSByZXF1aXJlKCcuL19pc0luZGV4JyksXG4gICAgaXNUeXBlZEFycmF5ID0gcmVxdWlyZSgnLi9pc1R5cGVkQXJyYXknKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIHRoZSBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIG9mIHRoZSBhcnJheS1saWtlIGB2YWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtib29sZWFufSBpbmhlcml0ZWQgU3BlY2lmeSByZXR1cm5pbmcgaW5oZXJpdGVkIHByb3BlcnR5IG5hbWVzLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqL1xuZnVuY3Rpb24gYXJyYXlMaWtlS2V5cyh2YWx1ZSwgaW5oZXJpdGVkKSB7XG4gIHZhciBpc0FyciA9IGlzQXJyYXkodmFsdWUpLFxuICAgICAgaXNBcmcgPSAhaXNBcnIgJiYgaXNBcmd1bWVudHModmFsdWUpLFxuICAgICAgaXNCdWZmID0gIWlzQXJyICYmICFpc0FyZyAmJiBpc0J1ZmZlcih2YWx1ZSksXG4gICAgICBpc1R5cGUgPSAhaXNBcnIgJiYgIWlzQXJnICYmICFpc0J1ZmYgJiYgaXNUeXBlZEFycmF5KHZhbHVlKSxcbiAgICAgIHNraXBJbmRleGVzID0gaXNBcnIgfHwgaXNBcmcgfHwgaXNCdWZmIHx8IGlzVHlwZSxcbiAgICAgIHJlc3VsdCA9IHNraXBJbmRleGVzID8gYmFzZVRpbWVzKHZhbHVlLmxlbmd0aCwgU3RyaW5nKSA6IFtdLFxuICAgICAgbGVuZ3RoID0gcmVzdWx0Lmxlbmd0aDtcblxuICBmb3IgKHZhciBrZXkgaW4gdmFsdWUpIHtcbiAgICBpZiAoKGluaGVyaXRlZCB8fCBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBrZXkpKSAmJlxuICAgICAgICAhKHNraXBJbmRleGVzICYmIChcbiAgICAgICAgICAgLy8gU2FmYXJpIDkgaGFzIGVudW1lcmFibGUgYGFyZ3VtZW50cy5sZW5ndGhgIGluIHN0cmljdCBtb2RlLlxuICAgICAgICAgICBrZXkgPT0gJ2xlbmd0aCcgfHxcbiAgICAgICAgICAgLy8gTm9kZS5qcyAwLjEwIGhhcyBlbnVtZXJhYmxlIG5vbi1pbmRleCBwcm9wZXJ0aWVzIG9uIGJ1ZmZlcnMuXG4gICAgICAgICAgIChpc0J1ZmYgJiYgKGtleSA9PSAnb2Zmc2V0JyB8fCBrZXkgPT0gJ3BhcmVudCcpKSB8fFxuICAgICAgICAgICAvLyBQaGFudG9tSlMgMiBoYXMgZW51bWVyYWJsZSBub24taW5kZXggcHJvcGVydGllcyBvbiB0eXBlZCBhcnJheXMuXG4gICAgICAgICAgIChpc1R5cGUgJiYgKGtleSA9PSAnYnVmZmVyJyB8fCBrZXkgPT0gJ2J5dGVMZW5ndGgnIHx8IGtleSA9PSAnYnl0ZU9mZnNldCcpKSB8fFxuICAgICAgICAgICAvLyBTa2lwIGluZGV4IHByb3BlcnRpZXMuXG4gICAgICAgICAgIGlzSW5kZXgoa2V5LCBsZW5ndGgpXG4gICAgICAgICkpKSB7XG4gICAgICByZXN1bHQucHVzaChrZXkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFycmF5TGlrZUtleXM7XG4iLCIvKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGxpa2VseSBhIHByb3RvdHlwZSBvYmplY3QuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBwcm90b3R5cGUsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNQcm90b3R5cGUodmFsdWUpIHtcbiAgdmFyIEN0b3IgPSB2YWx1ZSAmJiB2YWx1ZS5jb25zdHJ1Y3RvcixcbiAgICAgIHByb3RvID0gKHR5cGVvZiBDdG9yID09ICdmdW5jdGlvbicgJiYgQ3Rvci5wcm90b3R5cGUpIHx8IG9iamVjdFByb3RvO1xuXG4gIHJldHVybiB2YWx1ZSA9PT0gcHJvdG87XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNQcm90b3R5cGU7XG4iLCIvKipcbiAqIENyZWF0ZXMgYSB1bmFyeSBmdW5jdGlvbiB0aGF0IGludm9rZXMgYGZ1bmNgIHdpdGggaXRzIGFyZ3VtZW50IHRyYW5zZm9ybWVkLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byB3cmFwLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gdHJhbnNmb3JtIFRoZSBhcmd1bWVudCB0cmFuc2Zvcm0uXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gb3ZlckFyZyhmdW5jLCB0cmFuc2Zvcm0pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiBmdW5jKHRyYW5zZm9ybShhcmcpKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBvdmVyQXJnO1xuIiwidmFyIG92ZXJBcmcgPSByZXF1aXJlKCcuL19vdmVyQXJnJyk7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVLZXlzID0gb3ZlckFyZyhPYmplY3Qua2V5cywgT2JqZWN0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBuYXRpdmVLZXlzO1xuIiwidmFyIGlzUHJvdG90eXBlID0gcmVxdWlyZSgnLi9faXNQcm90b3R5cGUnKSxcbiAgICBuYXRpdmVLZXlzID0gcmVxdWlyZSgnLi9fbmF0aXZlS2V5cycpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmtleXNgIHdoaWNoIGRvZXNuJ3QgdHJlYXQgc3BhcnNlIGFycmF5cyBhcyBkZW5zZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqL1xuZnVuY3Rpb24gYmFzZUtleXMob2JqZWN0KSB7XG4gIGlmICghaXNQcm90b3R5cGUob2JqZWN0KSkge1xuICAgIHJldHVybiBuYXRpdmVLZXlzKG9iamVjdCk7XG4gIH1cbiAgdmFyIHJlc3VsdCA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gT2JqZWN0KG9iamVjdCkpIHtcbiAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGtleSkgJiYga2V5ICE9ICdjb25zdHJ1Y3RvcicpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUtleXM7XG4iLCJ2YXIgaXNGdW5jdGlvbiA9IHJlcXVpcmUoJy4vaXNGdW5jdGlvbicpLFxuICAgIGlzTGVuZ3RoID0gcmVxdWlyZSgnLi9pc0xlbmd0aCcpO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGFycmF5LWxpa2UuIEEgdmFsdWUgaXMgY29uc2lkZXJlZCBhcnJheS1saWtlIGlmIGl0J3NcbiAqIG5vdCBhIGZ1bmN0aW9uIGFuZCBoYXMgYSBgdmFsdWUubGVuZ3RoYCB0aGF0J3MgYW4gaW50ZWdlciBncmVhdGVyIHRoYW4gb3JcbiAqIGVxdWFsIHRvIGAwYCBhbmQgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIGBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUmAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYXJyYXktbGlrZSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5TGlrZShkb2N1bWVudC5ib2R5LmNoaWxkcmVuKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlKCdhYmMnKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlKF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5TGlrZSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiBpc0xlbmd0aCh2YWx1ZS5sZW5ndGgpICYmICFpc0Z1bmN0aW9uKHZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0FycmF5TGlrZTtcbiIsInZhciBhcnJheUxpa2VLZXlzID0gcmVxdWlyZSgnLi9fYXJyYXlMaWtlS2V5cycpLFxuICAgIGJhc2VLZXlzID0gcmVxdWlyZSgnLi9fYmFzZUtleXMnKSxcbiAgICBpc0FycmF5TGlrZSA9IHJlcXVpcmUoJy4vaXNBcnJheUxpa2UnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIHRoZSBvd24gZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiBgb2JqZWN0YC5cbiAqXG4gKiAqKk5vdGU6KiogTm9uLW9iamVjdCB2YWx1ZXMgYXJlIGNvZXJjZWQgdG8gb2JqZWN0cy4gU2VlIHRoZVxuICogW0VTIHNwZWNdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5rZXlzKVxuICogZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBGb28oKSB7XG4gKiAgIHRoaXMuYSA9IDE7XG4gKiAgIHRoaXMuYiA9IDI7XG4gKiB9XG4gKlxuICogRm9vLnByb3RvdHlwZS5jID0gMztcbiAqXG4gKiBfLmtleXMobmV3IEZvbyk7XG4gKiAvLyA9PiBbJ2EnLCAnYiddIChpdGVyYXRpb24gb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQpXG4gKlxuICogXy5rZXlzKCdoaScpO1xuICogLy8gPT4gWycwJywgJzEnXVxuICovXG5mdW5jdGlvbiBrZXlzKG9iamVjdCkge1xuICByZXR1cm4gaXNBcnJheUxpa2Uob2JqZWN0KSA/IGFycmF5TGlrZUtleXMob2JqZWN0KSA6IGJhc2VLZXlzKG9iamVjdCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ga2V5cztcbiIsInZhciBiYXNlR2V0QWxsS2V5cyA9IHJlcXVpcmUoJy4vX2Jhc2VHZXRBbGxLZXlzJyksXG4gICAgZ2V0U3ltYm9scyA9IHJlcXVpcmUoJy4vX2dldFN5bWJvbHMnKSxcbiAgICBrZXlzID0gcmVxdWlyZSgnLi9rZXlzJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiBvd24gZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBhbmQgc3ltYm9scyBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcyBhbmQgc3ltYm9scy5cbiAqL1xuZnVuY3Rpb24gZ2V0QWxsS2V5cyhvYmplY3QpIHtcbiAgcmV0dXJuIGJhc2VHZXRBbGxLZXlzKG9iamVjdCwga2V5cywgZ2V0U3ltYm9scyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0QWxsS2V5cztcbiIsInZhciBnZXRBbGxLZXlzID0gcmVxdWlyZSgnLi9fZ2V0QWxsS2V5cycpO1xuXG4vKiogVXNlZCB0byBjb21wb3NlIGJpdG1hc2tzIGZvciB2YWx1ZSBjb21wYXJpc29ucy4gKi9cbnZhciBDT01QQVJFX1BBUlRJQUxfRkxBRyA9IDE7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlSXNFcXVhbERlZXBgIGZvciBvYmplY3RzIHdpdGggc3VwcG9ydCBmb3JcbiAqIHBhcnRpYWwgZGVlcCBjb21wYXJpc29ucy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0ge09iamVjdH0gb3RoZXIgVGhlIG90aGVyIG9iamVjdCB0byBjb21wYXJlLlxuICogQHBhcmFtIHtudW1iZXJ9IGJpdG1hc2sgVGhlIGJpdG1hc2sgZmxhZ3MuIFNlZSBgYmFzZUlzRXF1YWxgIGZvciBtb3JlIGRldGFpbHMuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjdXN0b21pemVyIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY29tcGFyaXNvbnMuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBlcXVhbEZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGRldGVybWluZSBlcXVpdmFsZW50cyBvZiB2YWx1ZXMuXG4gKiBAcGFyYW0ge09iamVjdH0gc3RhY2sgVHJhY2tzIHRyYXZlcnNlZCBgb2JqZWN0YCBhbmQgYG90aGVyYCBvYmplY3RzLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBvYmplY3RzIGFyZSBlcXVpdmFsZW50LCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGVxdWFsT2JqZWN0cyhvYmplY3QsIG90aGVyLCBiaXRtYXNrLCBjdXN0b21pemVyLCBlcXVhbEZ1bmMsIHN0YWNrKSB7XG4gIHZhciBpc1BhcnRpYWwgPSBiaXRtYXNrICYgQ09NUEFSRV9QQVJUSUFMX0ZMQUcsXG4gICAgICBvYmpQcm9wcyA9IGdldEFsbEtleXMob2JqZWN0KSxcbiAgICAgIG9iakxlbmd0aCA9IG9ialByb3BzLmxlbmd0aCxcbiAgICAgIG90aFByb3BzID0gZ2V0QWxsS2V5cyhvdGhlciksXG4gICAgICBvdGhMZW5ndGggPSBvdGhQcm9wcy5sZW5ndGg7XG5cbiAgaWYgKG9iakxlbmd0aCAhPSBvdGhMZW5ndGggJiYgIWlzUGFydGlhbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgaW5kZXggPSBvYmpMZW5ndGg7XG4gIHdoaWxlIChpbmRleC0tKSB7XG4gICAgdmFyIGtleSA9IG9ialByb3BzW2luZGV4XTtcbiAgICBpZiAoIShpc1BhcnRpYWwgPyBrZXkgaW4gb3RoZXIgOiBoYXNPd25Qcm9wZXJ0eS5jYWxsKG90aGVyLCBrZXkpKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICAvLyBDaGVjayB0aGF0IGN5Y2xpYyB2YWx1ZXMgYXJlIGVxdWFsLlxuICB2YXIgb2JqU3RhY2tlZCA9IHN0YWNrLmdldChvYmplY3QpO1xuICB2YXIgb3RoU3RhY2tlZCA9IHN0YWNrLmdldChvdGhlcik7XG4gIGlmIChvYmpTdGFja2VkICYmIG90aFN0YWNrZWQpIHtcbiAgICByZXR1cm4gb2JqU3RhY2tlZCA9PSBvdGhlciAmJiBvdGhTdGFja2VkID09IG9iamVjdDtcbiAgfVxuICB2YXIgcmVzdWx0ID0gdHJ1ZTtcbiAgc3RhY2suc2V0KG9iamVjdCwgb3RoZXIpO1xuICBzdGFjay5zZXQob3RoZXIsIG9iamVjdCk7XG5cbiAgdmFyIHNraXBDdG9yID0gaXNQYXJ0aWFsO1xuICB3aGlsZSAoKytpbmRleCA8IG9iakxlbmd0aCkge1xuICAgIGtleSA9IG9ialByb3BzW2luZGV4XTtcbiAgICB2YXIgb2JqVmFsdWUgPSBvYmplY3Rba2V5XSxcbiAgICAgICAgb3RoVmFsdWUgPSBvdGhlcltrZXldO1xuXG4gICAgaWYgKGN1c3RvbWl6ZXIpIHtcbiAgICAgIHZhciBjb21wYXJlZCA9IGlzUGFydGlhbFxuICAgICAgICA/IGN1c3RvbWl6ZXIob3RoVmFsdWUsIG9ialZhbHVlLCBrZXksIG90aGVyLCBvYmplY3QsIHN0YWNrKVxuICAgICAgICA6IGN1c3RvbWl6ZXIob2JqVmFsdWUsIG90aFZhbHVlLCBrZXksIG9iamVjdCwgb3RoZXIsIHN0YWNrKTtcbiAgICB9XG4gICAgLy8gUmVjdXJzaXZlbHkgY29tcGFyZSBvYmplY3RzIChzdXNjZXB0aWJsZSB0byBjYWxsIHN0YWNrIGxpbWl0cykuXG4gICAgaWYgKCEoY29tcGFyZWQgPT09IHVuZGVmaW5lZFxuICAgICAgICAgID8gKG9ialZhbHVlID09PSBvdGhWYWx1ZSB8fCBlcXVhbEZ1bmMob2JqVmFsdWUsIG90aFZhbHVlLCBiaXRtYXNrLCBjdXN0b21pemVyLCBzdGFjaykpXG4gICAgICAgICAgOiBjb21wYXJlZFxuICAgICAgICApKSB7XG4gICAgICByZXN1bHQgPSBmYWxzZTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBza2lwQ3RvciB8fCAoc2tpcEN0b3IgPSBrZXkgPT0gJ2NvbnN0cnVjdG9yJyk7XG4gIH1cbiAgaWYgKHJlc3VsdCAmJiAhc2tpcEN0b3IpIHtcbiAgICB2YXIgb2JqQ3RvciA9IG9iamVjdC5jb25zdHJ1Y3RvcixcbiAgICAgICAgb3RoQ3RvciA9IG90aGVyLmNvbnN0cnVjdG9yO1xuXG4gICAgLy8gTm9uIGBPYmplY3RgIG9iamVjdCBpbnN0YW5jZXMgd2l0aCBkaWZmZXJlbnQgY29uc3RydWN0b3JzIGFyZSBub3QgZXF1YWwuXG4gICAgaWYgKG9iakN0b3IgIT0gb3RoQ3RvciAmJlxuICAgICAgICAoJ2NvbnN0cnVjdG9yJyBpbiBvYmplY3QgJiYgJ2NvbnN0cnVjdG9yJyBpbiBvdGhlcikgJiZcbiAgICAgICAgISh0eXBlb2Ygb2JqQ3RvciA9PSAnZnVuY3Rpb24nICYmIG9iakN0b3IgaW5zdGFuY2VvZiBvYmpDdG9yICYmXG4gICAgICAgICAgdHlwZW9mIG90aEN0b3IgPT0gJ2Z1bmN0aW9uJyAmJiBvdGhDdG9yIGluc3RhbmNlb2Ygb3RoQ3RvcikpIHtcbiAgICAgIHJlc3VsdCA9IGZhbHNlO1xuICAgIH1cbiAgfVxuICBzdGFja1snZGVsZXRlJ10ob2JqZWN0KTtcbiAgc3RhY2tbJ2RlbGV0ZSddKG90aGVyKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBlcXVhbE9iamVjdHM7XG4iLCJ2YXIgZ2V0TmF0aXZlID0gcmVxdWlyZSgnLi9fZ2V0TmF0aXZlJyksXG4gICAgcm9vdCA9IHJlcXVpcmUoJy4vX3Jvb3QnKTtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgdGhhdCBhcmUgdmVyaWZpZWQgdG8gYmUgbmF0aXZlLiAqL1xudmFyIERhdGFWaWV3ID0gZ2V0TmF0aXZlKHJvb3QsICdEYXRhVmlldycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IERhdGFWaWV3O1xuIiwidmFyIGdldE5hdGl2ZSA9IHJlcXVpcmUoJy4vX2dldE5hdGl2ZScpLFxuICAgIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHRoYXQgYXJlIHZlcmlmaWVkIHRvIGJlIG5hdGl2ZS4gKi9cbnZhciBQcm9taXNlID0gZ2V0TmF0aXZlKHJvb3QsICdQcm9taXNlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUHJvbWlzZTtcbiIsInZhciBnZXROYXRpdmUgPSByZXF1aXJlKCcuL19nZXROYXRpdmUnKSxcbiAgICByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB0aGF0IGFyZSB2ZXJpZmllZCB0byBiZSBuYXRpdmUuICovXG52YXIgU2V0ID0gZ2V0TmF0aXZlKHJvb3QsICdTZXQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBTZXQ7XG4iLCJ2YXIgZ2V0TmF0aXZlID0gcmVxdWlyZSgnLi9fZ2V0TmF0aXZlJyksXG4gICAgcm9vdCA9IHJlcXVpcmUoJy4vX3Jvb3QnKTtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgdGhhdCBhcmUgdmVyaWZpZWQgdG8gYmUgbmF0aXZlLiAqL1xudmFyIFdlYWtNYXAgPSBnZXROYXRpdmUocm9vdCwgJ1dlYWtNYXAnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBXZWFrTWFwO1xuIiwidmFyIERhdGFWaWV3ID0gcmVxdWlyZSgnLi9fRGF0YVZpZXcnKSxcbiAgICBNYXAgPSByZXF1aXJlKCcuL19NYXAnKSxcbiAgICBQcm9taXNlID0gcmVxdWlyZSgnLi9fUHJvbWlzZScpLFxuICAgIFNldCA9IHJlcXVpcmUoJy4vX1NldCcpLFxuICAgIFdlYWtNYXAgPSByZXF1aXJlKCcuL19XZWFrTWFwJyksXG4gICAgYmFzZUdldFRhZyA9IHJlcXVpcmUoJy4vX2Jhc2VHZXRUYWcnKSxcbiAgICB0b1NvdXJjZSA9IHJlcXVpcmUoJy4vX3RvU291cmNlJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBtYXBUYWcgPSAnW29iamVjdCBNYXBdJyxcbiAgICBvYmplY3RUYWcgPSAnW29iamVjdCBPYmplY3RdJyxcbiAgICBwcm9taXNlVGFnID0gJ1tvYmplY3QgUHJvbWlzZV0nLFxuICAgIHNldFRhZyA9ICdbb2JqZWN0IFNldF0nLFxuICAgIHdlYWtNYXBUYWcgPSAnW29iamVjdCBXZWFrTWFwXSc7XG5cbnZhciBkYXRhVmlld1RhZyA9ICdbb2JqZWN0IERhdGFWaWV3XSc7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBtYXBzLCBzZXRzLCBhbmQgd2Vha21hcHMuICovXG52YXIgZGF0YVZpZXdDdG9yU3RyaW5nID0gdG9Tb3VyY2UoRGF0YVZpZXcpLFxuICAgIG1hcEN0b3JTdHJpbmcgPSB0b1NvdXJjZShNYXApLFxuICAgIHByb21pc2VDdG9yU3RyaW5nID0gdG9Tb3VyY2UoUHJvbWlzZSksXG4gICAgc2V0Q3RvclN0cmluZyA9IHRvU291cmNlKFNldCksXG4gICAgd2Vha01hcEN0b3JTdHJpbmcgPSB0b1NvdXJjZShXZWFrTWFwKTtcblxuLyoqXG4gKiBHZXRzIHRoZSBgdG9TdHJpbmdUYWdgIG9mIGB2YWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgYHRvU3RyaW5nVGFnYC5cbiAqL1xudmFyIGdldFRhZyA9IGJhc2VHZXRUYWc7XG5cbi8vIEZhbGxiYWNrIGZvciBkYXRhIHZpZXdzLCBtYXBzLCBzZXRzLCBhbmQgd2VhayBtYXBzIGluIElFIDExIGFuZCBwcm9taXNlcyBpbiBOb2RlLmpzIDwgNi5cbmlmICgoRGF0YVZpZXcgJiYgZ2V0VGFnKG5ldyBEYXRhVmlldyhuZXcgQXJyYXlCdWZmZXIoMSkpKSAhPSBkYXRhVmlld1RhZykgfHxcbiAgICAoTWFwICYmIGdldFRhZyhuZXcgTWFwKSAhPSBtYXBUYWcpIHx8XG4gICAgKFByb21pc2UgJiYgZ2V0VGFnKFByb21pc2UucmVzb2x2ZSgpKSAhPSBwcm9taXNlVGFnKSB8fFxuICAgIChTZXQgJiYgZ2V0VGFnKG5ldyBTZXQpICE9IHNldFRhZykgfHxcbiAgICAoV2Vha01hcCAmJiBnZXRUYWcobmV3IFdlYWtNYXApICE9IHdlYWtNYXBUYWcpKSB7XG4gIGdldFRhZyA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgdmFyIHJlc3VsdCA9IGJhc2VHZXRUYWcodmFsdWUpLFxuICAgICAgICBDdG9yID0gcmVzdWx0ID09IG9iamVjdFRhZyA/IHZhbHVlLmNvbnN0cnVjdG9yIDogdW5kZWZpbmVkLFxuICAgICAgICBjdG9yU3RyaW5nID0gQ3RvciA/IHRvU291cmNlKEN0b3IpIDogJyc7XG5cbiAgICBpZiAoY3RvclN0cmluZykge1xuICAgICAgc3dpdGNoIChjdG9yU3RyaW5nKSB7XG4gICAgICAgIGNhc2UgZGF0YVZpZXdDdG9yU3RyaW5nOiByZXR1cm4gZGF0YVZpZXdUYWc7XG4gICAgICAgIGNhc2UgbWFwQ3RvclN0cmluZzogcmV0dXJuIG1hcFRhZztcbiAgICAgICAgY2FzZSBwcm9taXNlQ3RvclN0cmluZzogcmV0dXJuIHByb21pc2VUYWc7XG4gICAgICAgIGNhc2Ugc2V0Q3RvclN0cmluZzogcmV0dXJuIHNldFRhZztcbiAgICAgICAgY2FzZSB3ZWFrTWFwQ3RvclN0cmluZzogcmV0dXJuIHdlYWtNYXBUYWc7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0VGFnO1xuIiwidmFyIFN0YWNrID0gcmVxdWlyZSgnLi9fU3RhY2snKSxcbiAgICBlcXVhbEFycmF5cyA9IHJlcXVpcmUoJy4vX2VxdWFsQXJyYXlzJyksXG4gICAgZXF1YWxCeVRhZyA9IHJlcXVpcmUoJy4vX2VxdWFsQnlUYWcnKSxcbiAgICBlcXVhbE9iamVjdHMgPSByZXF1aXJlKCcuL19lcXVhbE9iamVjdHMnKSxcbiAgICBnZXRUYWcgPSByZXF1aXJlKCcuL19nZXRUYWcnKSxcbiAgICBpc0FycmF5ID0gcmVxdWlyZSgnLi9pc0FycmF5JyksXG4gICAgaXNCdWZmZXIgPSByZXF1aXJlKCcuL2lzQnVmZmVyJyksXG4gICAgaXNUeXBlZEFycmF5ID0gcmVxdWlyZSgnLi9pc1R5cGVkQXJyYXknKTtcblxuLyoqIFVzZWQgdG8gY29tcG9zZSBiaXRtYXNrcyBmb3IgdmFsdWUgY29tcGFyaXNvbnMuICovXG52YXIgQ09NUEFSRV9QQVJUSUFMX0ZMQUcgPSAxO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXJnc1RhZyA9ICdbb2JqZWN0IEFyZ3VtZW50c10nLFxuICAgIGFycmF5VGFnID0gJ1tvYmplY3QgQXJyYXldJyxcbiAgICBvYmplY3RUYWcgPSAnW29iamVjdCBPYmplY3RdJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYGJhc2VJc0VxdWFsYCBmb3IgYXJyYXlzIGFuZCBvYmplY3RzIHdoaWNoIHBlcmZvcm1zXG4gKiBkZWVwIGNvbXBhcmlzb25zIGFuZCB0cmFja3MgdHJhdmVyc2VkIG9iamVjdHMgZW5hYmxpbmcgb2JqZWN0cyB3aXRoIGNpcmN1bGFyXG4gKiByZWZlcmVuY2VzIHRvIGJlIGNvbXBhcmVkLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvdGhlciBUaGUgb3RoZXIgb2JqZWN0IHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0ge251bWJlcn0gYml0bWFzayBUaGUgYml0bWFzayBmbGFncy4gU2VlIGBiYXNlSXNFcXVhbGAgZm9yIG1vcmUgZGV0YWlscy5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGN1c3RvbWl6ZXIgVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBjb21wYXJpc29ucy5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGVxdWFsRnVuYyBUaGUgZnVuY3Rpb24gdG8gZGV0ZXJtaW5lIGVxdWl2YWxlbnRzIG9mIHZhbHVlcy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbc3RhY2tdIFRyYWNrcyB0cmF2ZXJzZWQgYG9iamVjdGAgYW5kIGBvdGhlcmAgb2JqZWN0cy5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgb2JqZWN0cyBhcmUgZXF1aXZhbGVudCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBiYXNlSXNFcXVhbERlZXAob2JqZWN0LCBvdGhlciwgYml0bWFzaywgY3VzdG9taXplciwgZXF1YWxGdW5jLCBzdGFjaykge1xuICB2YXIgb2JqSXNBcnIgPSBpc0FycmF5KG9iamVjdCksXG4gICAgICBvdGhJc0FyciA9IGlzQXJyYXkob3RoZXIpLFxuICAgICAgb2JqVGFnID0gb2JqSXNBcnIgPyBhcnJheVRhZyA6IGdldFRhZyhvYmplY3QpLFxuICAgICAgb3RoVGFnID0gb3RoSXNBcnIgPyBhcnJheVRhZyA6IGdldFRhZyhvdGhlcik7XG5cbiAgb2JqVGFnID0gb2JqVGFnID09IGFyZ3NUYWcgPyBvYmplY3RUYWcgOiBvYmpUYWc7XG4gIG90aFRhZyA9IG90aFRhZyA9PSBhcmdzVGFnID8gb2JqZWN0VGFnIDogb3RoVGFnO1xuXG4gIHZhciBvYmpJc09iaiA9IG9ialRhZyA9PSBvYmplY3RUYWcsXG4gICAgICBvdGhJc09iaiA9IG90aFRhZyA9PSBvYmplY3RUYWcsXG4gICAgICBpc1NhbWVUYWcgPSBvYmpUYWcgPT0gb3RoVGFnO1xuXG4gIGlmIChpc1NhbWVUYWcgJiYgaXNCdWZmZXIob2JqZWN0KSkge1xuICAgIGlmICghaXNCdWZmZXIob3RoZXIpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIG9iaklzQXJyID0gdHJ1ZTtcbiAgICBvYmpJc09iaiA9IGZhbHNlO1xuICB9XG4gIGlmIChpc1NhbWVUYWcgJiYgIW9iaklzT2JqKSB7XG4gICAgc3RhY2sgfHwgKHN0YWNrID0gbmV3IFN0YWNrKTtcbiAgICByZXR1cm4gKG9iaklzQXJyIHx8IGlzVHlwZWRBcnJheShvYmplY3QpKVxuICAgICAgPyBlcXVhbEFycmF5cyhvYmplY3QsIG90aGVyLCBiaXRtYXNrLCBjdXN0b21pemVyLCBlcXVhbEZ1bmMsIHN0YWNrKVxuICAgICAgOiBlcXVhbEJ5VGFnKG9iamVjdCwgb3RoZXIsIG9ialRhZywgYml0bWFzaywgY3VzdG9taXplciwgZXF1YWxGdW5jLCBzdGFjayk7XG4gIH1cbiAgaWYgKCEoYml0bWFzayAmIENPTVBBUkVfUEFSVElBTF9GTEFHKSkge1xuICAgIHZhciBvYmpJc1dyYXBwZWQgPSBvYmpJc09iaiAmJiBoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgJ19fd3JhcHBlZF9fJyksXG4gICAgICAgIG90aElzV3JhcHBlZCA9IG90aElzT2JqICYmIGhhc093blByb3BlcnR5LmNhbGwob3RoZXIsICdfX3dyYXBwZWRfXycpO1xuXG4gICAgaWYgKG9iaklzV3JhcHBlZCB8fCBvdGhJc1dyYXBwZWQpIHtcbiAgICAgIHZhciBvYmpVbndyYXBwZWQgPSBvYmpJc1dyYXBwZWQgPyBvYmplY3QudmFsdWUoKSA6IG9iamVjdCxcbiAgICAgICAgICBvdGhVbndyYXBwZWQgPSBvdGhJc1dyYXBwZWQgPyBvdGhlci52YWx1ZSgpIDogb3RoZXI7XG5cbiAgICAgIHN0YWNrIHx8IChzdGFjayA9IG5ldyBTdGFjayk7XG4gICAgICByZXR1cm4gZXF1YWxGdW5jKG9ialVud3JhcHBlZCwgb3RoVW53cmFwcGVkLCBiaXRtYXNrLCBjdXN0b21pemVyLCBzdGFjayk7XG4gICAgfVxuICB9XG4gIGlmICghaXNTYW1lVGFnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHN0YWNrIHx8IChzdGFjayA9IG5ldyBTdGFjayk7XG4gIHJldHVybiBlcXVhbE9iamVjdHMob2JqZWN0LCBvdGhlciwgYml0bWFzaywgY3VzdG9taXplciwgZXF1YWxGdW5jLCBzdGFjayk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUlzRXF1YWxEZWVwO1xuIiwidmFyIGJhc2VJc0VxdWFsRGVlcCA9IHJlcXVpcmUoJy4vX2Jhc2VJc0VxdWFsRGVlcCcpLFxuICAgIGlzT2JqZWN0TGlrZSA9IHJlcXVpcmUoJy4vaXNPYmplY3RMaWtlJyk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaXNFcXVhbGAgd2hpY2ggc3VwcG9ydHMgcGFydGlhbCBjb21wYXJpc29uc1xuICogYW5kIHRyYWNrcyB0cmF2ZXJzZWQgb2JqZWN0cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB7Kn0gb3RoZXIgVGhlIG90aGVyIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGJpdG1hc2sgVGhlIGJpdG1hc2sgZmxhZ3MuXG4gKiAgMSAtIFVub3JkZXJlZCBjb21wYXJpc29uXG4gKiAgMiAtIFBhcnRpYWwgY29tcGFyaXNvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2N1c3RvbWl6ZXJdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY29tcGFyaXNvbnMuXG4gKiBAcGFyYW0ge09iamVjdH0gW3N0YWNrXSBUcmFja3MgdHJhdmVyc2VkIGB2YWx1ZWAgYW5kIGBvdGhlcmAgb2JqZWN0cy5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgdmFsdWVzIGFyZSBlcXVpdmFsZW50LCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc0VxdWFsKHZhbHVlLCBvdGhlciwgYml0bWFzaywgY3VzdG9taXplciwgc3RhY2spIHtcbiAgaWYgKHZhbHVlID09PSBvdGhlcikge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmICh2YWx1ZSA9PSBudWxsIHx8IG90aGVyID09IG51bGwgfHwgKCFpc09iamVjdExpa2UodmFsdWUpICYmICFpc09iamVjdExpa2Uob3RoZXIpKSkge1xuICAgIHJldHVybiB2YWx1ZSAhPT0gdmFsdWUgJiYgb3RoZXIgIT09IG90aGVyO1xuICB9XG4gIHJldHVybiBiYXNlSXNFcXVhbERlZXAodmFsdWUsIG90aGVyLCBiaXRtYXNrLCBjdXN0b21pemVyLCBiYXNlSXNFcXVhbCwgc3RhY2spO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VJc0VxdWFsO1xuIiwidmFyIFN0YWNrID0gcmVxdWlyZSgnLi9fU3RhY2snKSxcbiAgICBiYXNlSXNFcXVhbCA9IHJlcXVpcmUoJy4vX2Jhc2VJc0VxdWFsJyk7XG5cbi8qKiBVc2VkIHRvIGNvbXBvc2UgYml0bWFza3MgZm9yIHZhbHVlIGNvbXBhcmlzb25zLiAqL1xudmFyIENPTVBBUkVfUEFSVElBTF9GTEFHID0gMSxcbiAgICBDT01QQVJFX1VOT1JERVJFRF9GTEFHID0gMjtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pc01hdGNoYCB3aXRob3V0IHN1cHBvcnQgZm9yIGl0ZXJhdGVlIHNob3J0aGFuZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpbnNwZWN0LlxuICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBUaGUgb2JqZWN0IG9mIHByb3BlcnR5IHZhbHVlcyB0byBtYXRjaC5cbiAqIEBwYXJhbSB7QXJyYXl9IG1hdGNoRGF0YSBUaGUgcHJvcGVydHkgbmFtZXMsIHZhbHVlcywgYW5kIGNvbXBhcmUgZmxhZ3MgdG8gbWF0Y2guXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY3VzdG9taXplcl0gVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBjb21wYXJpc29ucy5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgb2JqZWN0YCBpcyBhIG1hdGNoLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc01hdGNoKG9iamVjdCwgc291cmNlLCBtYXRjaERhdGEsIGN1c3RvbWl6ZXIpIHtcbiAgdmFyIGluZGV4ID0gbWF0Y2hEYXRhLmxlbmd0aCxcbiAgICAgIGxlbmd0aCA9IGluZGV4LFxuICAgICAgbm9DdXN0b21pemVyID0gIWN1c3RvbWl6ZXI7XG5cbiAgaWYgKG9iamVjdCA9PSBudWxsKSB7XG4gICAgcmV0dXJuICFsZW5ndGg7XG4gIH1cbiAgb2JqZWN0ID0gT2JqZWN0KG9iamVjdCk7XG4gIHdoaWxlIChpbmRleC0tKSB7XG4gICAgdmFyIGRhdGEgPSBtYXRjaERhdGFbaW5kZXhdO1xuICAgIGlmICgobm9DdXN0b21pemVyICYmIGRhdGFbMl0pXG4gICAgICAgICAgPyBkYXRhWzFdICE9PSBvYmplY3RbZGF0YVswXV1cbiAgICAgICAgICA6ICEoZGF0YVswXSBpbiBvYmplY3QpXG4gICAgICAgICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIGRhdGEgPSBtYXRjaERhdGFbaW5kZXhdO1xuICAgIHZhciBrZXkgPSBkYXRhWzBdLFxuICAgICAgICBvYmpWYWx1ZSA9IG9iamVjdFtrZXldLFxuICAgICAgICBzcmNWYWx1ZSA9IGRhdGFbMV07XG5cbiAgICBpZiAobm9DdXN0b21pemVyICYmIGRhdGFbMl0pIHtcbiAgICAgIGlmIChvYmpWYWx1ZSA9PT0gdW5kZWZpbmVkICYmICEoa2V5IGluIG9iamVjdCkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgc3RhY2sgPSBuZXcgU3RhY2s7XG4gICAgICBpZiAoY3VzdG9taXplcikge1xuICAgICAgICB2YXIgcmVzdWx0ID0gY3VzdG9taXplcihvYmpWYWx1ZSwgc3JjVmFsdWUsIGtleSwgb2JqZWN0LCBzb3VyY2UsIHN0YWNrKTtcbiAgICAgIH1cbiAgICAgIGlmICghKHJlc3VsdCA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICA/IGJhc2VJc0VxdWFsKHNyY1ZhbHVlLCBvYmpWYWx1ZSwgQ09NUEFSRV9QQVJUSUFMX0ZMQUcgfCBDT01QQVJFX1VOT1JERVJFRF9GTEFHLCBjdXN0b21pemVyLCBzdGFjaylcbiAgICAgICAgICAgIDogcmVzdWx0XG4gICAgICAgICAgKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VJc01hdGNoO1xuIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9pc09iamVjdCcpO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHN1aXRhYmxlIGZvciBzdHJpY3QgZXF1YWxpdHkgY29tcGFyaXNvbnMsIGkuZS4gYD09PWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaWYgc3VpdGFibGUgZm9yIHN0cmljdFxuICogIGVxdWFsaXR5IGNvbXBhcmlzb25zLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzU3RyaWN0Q29tcGFyYWJsZSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT09IHZhbHVlICYmICFpc09iamVjdCh2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNTdHJpY3RDb21wYXJhYmxlO1xuIiwidmFyIGlzU3RyaWN0Q29tcGFyYWJsZSA9IHJlcXVpcmUoJy4vX2lzU3RyaWN0Q29tcGFyYWJsZScpLFxuICAgIGtleXMgPSByZXF1aXJlKCcuL2tleXMnKTtcblxuLyoqXG4gKiBHZXRzIHRoZSBwcm9wZXJ0eSBuYW1lcywgdmFsdWVzLCBhbmQgY29tcGFyZSBmbGFncyBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBtYXRjaCBkYXRhIG9mIGBvYmplY3RgLlxuICovXG5mdW5jdGlvbiBnZXRNYXRjaERhdGEob2JqZWN0KSB7XG4gIHZhciByZXN1bHQgPSBrZXlzKG9iamVjdCksXG4gICAgICBsZW5ndGggPSByZXN1bHQubGVuZ3RoO1xuXG4gIHdoaWxlIChsZW5ndGgtLSkge1xuICAgIHZhciBrZXkgPSByZXN1bHRbbGVuZ3RoXSxcbiAgICAgICAgdmFsdWUgPSBvYmplY3Rba2V5XTtcblxuICAgIHJlc3VsdFtsZW5ndGhdID0gW2tleSwgdmFsdWUsIGlzU3RyaWN0Q29tcGFyYWJsZSh2YWx1ZSldO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0TWF0Y2hEYXRhO1xuIiwiLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYG1hdGNoZXNQcm9wZXJ0eWAgZm9yIHNvdXJjZSB2YWx1ZXMgc3VpdGFibGVcbiAqIGZvciBzdHJpY3QgZXF1YWxpdHkgY29tcGFyaXNvbnMsIGkuZS4gYD09PWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gZ2V0LlxuICogQHBhcmFtIHsqfSBzcmNWYWx1ZSBUaGUgdmFsdWUgdG8gbWF0Y2guXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBzcGVjIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBtYXRjaGVzU3RyaWN0Q29tcGFyYWJsZShrZXksIHNyY1ZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbihvYmplY3QpIHtcbiAgICBpZiAob2JqZWN0ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdFtrZXldID09PSBzcmNWYWx1ZSAmJlxuICAgICAgKHNyY1ZhbHVlICE9PSB1bmRlZmluZWQgfHwgKGtleSBpbiBPYmplY3Qob2JqZWN0KSkpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1hdGNoZXNTdHJpY3RDb21wYXJhYmxlO1xuIiwidmFyIGJhc2VJc01hdGNoID0gcmVxdWlyZSgnLi9fYmFzZUlzTWF0Y2gnKSxcbiAgICBnZXRNYXRjaERhdGEgPSByZXF1aXJlKCcuL19nZXRNYXRjaERhdGEnKSxcbiAgICBtYXRjaGVzU3RyaWN0Q29tcGFyYWJsZSA9IHJlcXVpcmUoJy4vX21hdGNoZXNTdHJpY3RDb21wYXJhYmxlJyk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ubWF0Y2hlc2Agd2hpY2ggZG9lc24ndCBjbG9uZSBgc291cmNlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBUaGUgb2JqZWN0IG9mIHByb3BlcnR5IHZhbHVlcyB0byBtYXRjaC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IHNwZWMgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VNYXRjaGVzKHNvdXJjZSkge1xuICB2YXIgbWF0Y2hEYXRhID0gZ2V0TWF0Y2hEYXRhKHNvdXJjZSk7XG4gIGlmIChtYXRjaERhdGEubGVuZ3RoID09IDEgJiYgbWF0Y2hEYXRhWzBdWzJdKSB7XG4gICAgcmV0dXJuIG1hdGNoZXNTdHJpY3RDb21wYXJhYmxlKG1hdGNoRGF0YVswXVswXSwgbWF0Y2hEYXRhWzBdWzFdKTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgcmV0dXJuIG9iamVjdCA9PT0gc291cmNlIHx8IGJhc2VJc01hdGNoKG9iamVjdCwgc291cmNlLCBtYXRjaERhdGEpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VNYXRjaGVzO1xuIiwidmFyIGJhc2VHZXRUYWcgPSByZXF1aXJlKCcuL19iYXNlR2V0VGFnJyksXG4gICAgaXNPYmplY3RMaWtlID0gcmVxdWlyZSgnLi9pc09iamVjdExpa2UnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIHN5bWJvbFRhZyA9ICdbb2JqZWN0IFN5bWJvbF0nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgU3ltYm9sYCBwcmltaXRpdmUgb3Igb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgc3ltYm9sLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNTeW1ib2woU3ltYm9sLml0ZXJhdG9yKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzU3ltYm9sKCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3ltYm9sKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ3N5bWJvbCcgfHxcbiAgICAoaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBiYXNlR2V0VGFnKHZhbHVlKSA9PSBzeW1ib2xUYWcpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzU3ltYm9sO1xuIiwidmFyIGlzQXJyYXkgPSByZXF1aXJlKCcuL2lzQXJyYXknKSxcbiAgICBpc1N5bWJvbCA9IHJlcXVpcmUoJy4vaXNTeW1ib2wnKTtcblxuLyoqIFVzZWQgdG8gbWF0Y2ggcHJvcGVydHkgbmFtZXMgd2l0aGluIHByb3BlcnR5IHBhdGhzLiAqL1xudmFyIHJlSXNEZWVwUHJvcCA9IC9cXC58XFxbKD86W15bXFxdXSp8KFtcIiddKSg/Oig/IVxcMSlbXlxcXFxdfFxcXFwuKSo/XFwxKVxcXS8sXG4gICAgcmVJc1BsYWluUHJvcCA9IC9eXFx3KiQvO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgcHJvcGVydHkgbmFtZSBhbmQgbm90IGEgcHJvcGVydHkgcGF0aC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcGFyYW0ge09iamVjdH0gW29iamVjdF0gVGhlIG9iamVjdCB0byBxdWVyeSBrZXlzIG9uLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBwcm9wZXJ0eSBuYW1lLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzS2V5KHZhbHVlLCBvYmplY3QpIHtcbiAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICBpZiAodHlwZSA9PSAnbnVtYmVyJyB8fCB0eXBlID09ICdzeW1ib2wnIHx8IHR5cGUgPT0gJ2Jvb2xlYW4nIHx8XG4gICAgICB2YWx1ZSA9PSBudWxsIHx8IGlzU3ltYm9sKHZhbHVlKSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiByZUlzUGxhaW5Qcm9wLnRlc3QodmFsdWUpIHx8ICFyZUlzRGVlcFByb3AudGVzdCh2YWx1ZSkgfHxcbiAgICAob2JqZWN0ICE9IG51bGwgJiYgdmFsdWUgaW4gT2JqZWN0KG9iamVjdCkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzS2V5O1xuIiwidmFyIE1hcENhY2hlID0gcmVxdWlyZSgnLi9fTWFwQ2FjaGUnKTtcblxuLyoqIEVycm9yIG1lc3NhZ2UgY29uc3RhbnRzLiAqL1xudmFyIEZVTkNfRVJST1JfVEVYVCA9ICdFeHBlY3RlZCBhIGZ1bmN0aW9uJztcblxuLyoqXG4gKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCBtZW1vaXplcyB0aGUgcmVzdWx0IG9mIGBmdW5jYC4gSWYgYHJlc29sdmVyYCBpc1xuICogcHJvdmlkZWQsIGl0IGRldGVybWluZXMgdGhlIGNhY2hlIGtleSBmb3Igc3RvcmluZyB0aGUgcmVzdWx0IGJhc2VkIG9uIHRoZVxuICogYXJndW1lbnRzIHByb3ZpZGVkIHRvIHRoZSBtZW1vaXplZCBmdW5jdGlvbi4gQnkgZGVmYXVsdCwgdGhlIGZpcnN0IGFyZ3VtZW50XG4gKiBwcm92aWRlZCB0byB0aGUgbWVtb2l6ZWQgZnVuY3Rpb24gaXMgdXNlZCBhcyB0aGUgbWFwIGNhY2hlIGtleS4gVGhlIGBmdW5jYFxuICogaXMgaW52b2tlZCB3aXRoIHRoZSBgdGhpc2AgYmluZGluZyBvZiB0aGUgbWVtb2l6ZWQgZnVuY3Rpb24uXG4gKlxuICogKipOb3RlOioqIFRoZSBjYWNoZSBpcyBleHBvc2VkIGFzIHRoZSBgY2FjaGVgIHByb3BlcnR5IG9uIHRoZSBtZW1vaXplZFxuICogZnVuY3Rpb24uIEl0cyBjcmVhdGlvbiBtYXkgYmUgY3VzdG9taXplZCBieSByZXBsYWNpbmcgdGhlIGBfLm1lbW9pemUuQ2FjaGVgXG4gKiBjb25zdHJ1Y3RvciB3aXRoIG9uZSB3aG9zZSBpbnN0YW5jZXMgaW1wbGVtZW50IHRoZVxuICogW2BNYXBgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1wcm9wZXJ0aWVzLW9mLXRoZS1tYXAtcHJvdG90eXBlLW9iamVjdClcbiAqIG1ldGhvZCBpbnRlcmZhY2Ugb2YgYGNsZWFyYCwgYGRlbGV0ZWAsIGBnZXRgLCBgaGFzYCwgYW5kIGBzZXRgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gaGF2ZSBpdHMgb3V0cHV0IG1lbW9pemVkLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW3Jlc29sdmVyXSBUaGUgZnVuY3Rpb24gdG8gcmVzb2x2ZSB0aGUgY2FjaGUga2V5LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgbWVtb2l6ZWQgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3QgPSB7ICdhJzogMSwgJ2InOiAyIH07XG4gKiB2YXIgb3RoZXIgPSB7ICdjJzogMywgJ2QnOiA0IH07XG4gKlxuICogdmFyIHZhbHVlcyA9IF8ubWVtb2l6ZShfLnZhbHVlcyk7XG4gKiB2YWx1ZXMob2JqZWN0KTtcbiAqIC8vID0+IFsxLCAyXVxuICpcbiAqIHZhbHVlcyhvdGhlcik7XG4gKiAvLyA9PiBbMywgNF1cbiAqXG4gKiBvYmplY3QuYSA9IDI7XG4gKiB2YWx1ZXMob2JqZWN0KTtcbiAqIC8vID0+IFsxLCAyXVxuICpcbiAqIC8vIE1vZGlmeSB0aGUgcmVzdWx0IGNhY2hlLlxuICogdmFsdWVzLmNhY2hlLnNldChvYmplY3QsIFsnYScsICdiJ10pO1xuICogdmFsdWVzKG9iamVjdCk7XG4gKiAvLyA9PiBbJ2EnLCAnYiddXG4gKlxuICogLy8gUmVwbGFjZSBgXy5tZW1vaXplLkNhY2hlYC5cbiAqIF8ubWVtb2l6ZS5DYWNoZSA9IFdlYWtNYXA7XG4gKi9cbmZ1bmN0aW9uIG1lbW9pemUoZnVuYywgcmVzb2x2ZXIpIHtcbiAgaWYgKHR5cGVvZiBmdW5jICE9ICdmdW5jdGlvbicgfHwgKHJlc29sdmVyICE9IG51bGwgJiYgdHlwZW9mIHJlc29sdmVyICE9ICdmdW5jdGlvbicpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihGVU5DX0VSUk9SX1RFWFQpO1xuICB9XG4gIHZhciBtZW1vaXplZCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmdzID0gYXJndW1lbnRzLFxuICAgICAgICBrZXkgPSByZXNvbHZlciA/IHJlc29sdmVyLmFwcGx5KHRoaXMsIGFyZ3MpIDogYXJnc1swXSxcbiAgICAgICAgY2FjaGUgPSBtZW1vaXplZC5jYWNoZTtcblxuICAgIGlmIChjYWNoZS5oYXMoa2V5KSkge1xuICAgICAgcmV0dXJuIGNhY2hlLmdldChrZXkpO1xuICAgIH1cbiAgICB2YXIgcmVzdWx0ID0gZnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICBtZW1vaXplZC5jYWNoZSA9IGNhY2hlLnNldChrZXksIHJlc3VsdCkgfHwgY2FjaGU7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbiAgbWVtb2l6ZWQuY2FjaGUgPSBuZXcgKG1lbW9pemUuQ2FjaGUgfHwgTWFwQ2FjaGUpO1xuICByZXR1cm4gbWVtb2l6ZWQ7XG59XG5cbi8vIEV4cG9zZSBgTWFwQ2FjaGVgLlxubWVtb2l6ZS5DYWNoZSA9IE1hcENhY2hlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG1lbW9pemU7XG4iLCJ2YXIgbWVtb2l6ZSA9IHJlcXVpcmUoJy4vbWVtb2l6ZScpO1xuXG4vKiogVXNlZCBhcyB0aGUgbWF4aW11bSBtZW1vaXplIGNhY2hlIHNpemUuICovXG52YXIgTUFYX01FTU9JWkVfU0laRSA9IDUwMDtcblxuLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYF8ubWVtb2l6ZWAgd2hpY2ggY2xlYXJzIHRoZSBtZW1vaXplZCBmdW5jdGlvbidzXG4gKiBjYWNoZSB3aGVuIGl0IGV4Y2VlZHMgYE1BWF9NRU1PSVpFX1NJWkVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBoYXZlIGl0cyBvdXRwdXQgbWVtb2l6ZWQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBtZW1vaXplZCBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gbWVtb2l6ZUNhcHBlZChmdW5jKSB7XG4gIHZhciByZXN1bHQgPSBtZW1vaXplKGZ1bmMsIGZ1bmN0aW9uKGtleSkge1xuICAgIGlmIChjYWNoZS5zaXplID09PSBNQVhfTUVNT0laRV9TSVpFKSB7XG4gICAgICBjYWNoZS5jbGVhcigpO1xuICAgIH1cbiAgICByZXR1cm4ga2V5O1xuICB9KTtcblxuICB2YXIgY2FjaGUgPSByZXN1bHQuY2FjaGU7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWVtb2l6ZUNhcHBlZDtcbiIsInZhciBtZW1vaXplQ2FwcGVkID0gcmVxdWlyZSgnLi9fbWVtb2l6ZUNhcHBlZCcpO1xuXG4vKiogVXNlZCB0byBtYXRjaCBwcm9wZXJ0eSBuYW1lcyB3aXRoaW4gcHJvcGVydHkgcGF0aHMuICovXG52YXIgcmVQcm9wTmFtZSA9IC9bXi5bXFxdXSt8XFxbKD86KC0/XFxkKyg/OlxcLlxcZCspPyl8KFtcIiddKSgoPzooPyFcXDIpW15cXFxcXXxcXFxcLikqPylcXDIpXFxdfCg/PSg/OlxcLnxcXFtcXF0pKD86XFwufFxcW1xcXXwkKSkvZztcblxuLyoqIFVzZWQgdG8gbWF0Y2ggYmFja3NsYXNoZXMgaW4gcHJvcGVydHkgcGF0aHMuICovXG52YXIgcmVFc2NhcGVDaGFyID0gL1xcXFwoXFxcXCk/L2c7XG5cbi8qKlxuICogQ29udmVydHMgYHN0cmluZ2AgdG8gYSBwcm9wZXJ0eSBwYXRoIGFycmF5LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIFRoZSBzdHJpbmcgdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgcHJvcGVydHkgcGF0aCBhcnJheS5cbiAqL1xudmFyIHN0cmluZ1RvUGF0aCA9IG1lbW9pemVDYXBwZWQoZnVuY3Rpb24oc3RyaW5nKSB7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgaWYgKHN0cmluZy5jaGFyQ29kZUF0KDApID09PSA0NiAvKiAuICovKSB7XG4gICAgcmVzdWx0LnB1c2goJycpO1xuICB9XG4gIHN0cmluZy5yZXBsYWNlKHJlUHJvcE5hbWUsIGZ1bmN0aW9uKG1hdGNoLCBudW1iZXIsIHF1b3RlLCBzdWJTdHJpbmcpIHtcbiAgICByZXN1bHQucHVzaChxdW90ZSA/IHN1YlN0cmluZy5yZXBsYWNlKHJlRXNjYXBlQ2hhciwgJyQxJykgOiAobnVtYmVyIHx8IG1hdGNoKSk7XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gc3RyaW5nVG9QYXRoO1xuIiwidmFyIFN5bWJvbCA9IHJlcXVpcmUoJy4vX1N5bWJvbCcpLFxuICAgIGFycmF5TWFwID0gcmVxdWlyZSgnLi9fYXJyYXlNYXAnKSxcbiAgICBpc0FycmF5ID0gcmVxdWlyZSgnLi9pc0FycmF5JyksXG4gICAgaXNTeW1ib2wgPSByZXF1aXJlKCcuL2lzU3ltYm9sJyk7XG5cbi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIElORklOSVRZID0gMSAvIDA7XG5cbi8qKiBVc2VkIHRvIGNvbnZlcnQgc3ltYm9scyB0byBwcmltaXRpdmVzIGFuZCBzdHJpbmdzLiAqL1xudmFyIHN5bWJvbFByb3RvID0gU3ltYm9sID8gU3ltYm9sLnByb3RvdHlwZSA6IHVuZGVmaW5lZCxcbiAgICBzeW1ib2xUb1N0cmluZyA9IHN5bWJvbFByb3RvID8gc3ltYm9sUHJvdG8udG9TdHJpbmcgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8udG9TdHJpbmdgIHdoaWNoIGRvZXNuJ3QgY29udmVydCBudWxsaXNoXG4gKiB2YWx1ZXMgdG8gZW1wdHkgc3RyaW5ncy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcHJvY2Vzcy5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gYmFzZVRvU3RyaW5nKHZhbHVlKSB7XG4gIC8vIEV4aXQgZWFybHkgZm9yIHN0cmluZ3MgdG8gYXZvaWQgYSBwZXJmb3JtYW5jZSBoaXQgaW4gc29tZSBlbnZpcm9ubWVudHMuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgLy8gUmVjdXJzaXZlbHkgY29udmVydCB2YWx1ZXMgKHN1c2NlcHRpYmxlIHRvIGNhbGwgc3RhY2sgbGltaXRzKS5cbiAgICByZXR1cm4gYXJyYXlNYXAodmFsdWUsIGJhc2VUb1N0cmluZykgKyAnJztcbiAgfVxuICBpZiAoaXNTeW1ib2wodmFsdWUpKSB7XG4gICAgcmV0dXJuIHN5bWJvbFRvU3RyaW5nID8gc3ltYm9sVG9TdHJpbmcuY2FsbCh2YWx1ZSkgOiAnJztcbiAgfVxuICB2YXIgcmVzdWx0ID0gKHZhbHVlICsgJycpO1xuICByZXR1cm4gKHJlc3VsdCA9PSAnMCcgJiYgKDEgLyB2YWx1ZSkgPT0gLUlORklOSVRZKSA/ICctMCcgOiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZVRvU3RyaW5nO1xuIiwidmFyIGJhc2VUb1N0cmluZyA9IHJlcXVpcmUoJy4vX2Jhc2VUb1N0cmluZycpO1xuXG4vKipcbiAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYSBzdHJpbmcuIEFuIGVtcHR5IHN0cmluZyBpcyByZXR1cm5lZCBmb3IgYG51bGxgXG4gKiBhbmQgYHVuZGVmaW5lZGAgdmFsdWVzLiBUaGUgc2lnbiBvZiBgLTBgIGlzIHByZXNlcnZlZC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGNvbnZlcnRlZCBzdHJpbmcuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8udG9TdHJpbmcobnVsbCk7XG4gKiAvLyA9PiAnJ1xuICpcbiAqIF8udG9TdHJpbmcoLTApO1xuICogLy8gPT4gJy0wJ1xuICpcbiAqIF8udG9TdHJpbmcoWzEsIDIsIDNdKTtcbiAqIC8vID0+ICcxLDIsMydcbiAqL1xuZnVuY3Rpb24gdG9TdHJpbmcodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID09IG51bGwgPyAnJyA6IGJhc2VUb1N0cmluZyh2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdG9TdHJpbmc7XG4iLCJ2YXIgaXNBcnJheSA9IHJlcXVpcmUoJy4vaXNBcnJheScpLFxuICAgIGlzS2V5ID0gcmVxdWlyZSgnLi9faXNLZXknKSxcbiAgICBzdHJpbmdUb1BhdGggPSByZXF1aXJlKCcuL19zdHJpbmdUb1BhdGgnKSxcbiAgICB0b1N0cmluZyA9IHJlcXVpcmUoJy4vdG9TdHJpbmcnKTtcblxuLyoqXG4gKiBDYXN0cyBgdmFsdWVgIHRvIGEgcGF0aCBhcnJheSBpZiBpdCdzIG5vdCBvbmUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGluc3BlY3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW29iamVjdF0gVGhlIG9iamVjdCB0byBxdWVyeSBrZXlzIG9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBjYXN0IHByb3BlcnR5IHBhdGggYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIGNhc3RQYXRoKHZhbHVlLCBvYmplY3QpIHtcbiAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIHJldHVybiBpc0tleSh2YWx1ZSwgb2JqZWN0KSA/IFt2YWx1ZV0gOiBzdHJpbmdUb1BhdGgodG9TdHJpbmcodmFsdWUpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjYXN0UGF0aDtcbiIsInZhciBpc1N5bWJvbCA9IHJlcXVpcmUoJy4vaXNTeW1ib2wnKTtcblxuLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgSU5GSU5JVFkgPSAxIC8gMDtcblxuLyoqXG4gKiBDb252ZXJ0cyBgdmFsdWVgIHRvIGEgc3RyaW5nIGtleSBpZiBpdCdzIG5vdCBhIHN0cmluZyBvciBzeW1ib2wuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGluc3BlY3QuXG4gKiBAcmV0dXJucyB7c3RyaW5nfHN5bWJvbH0gUmV0dXJucyB0aGUga2V5LlxuICovXG5mdW5jdGlvbiB0b0tleSh2YWx1ZSkge1xuICBpZiAodHlwZW9mIHZhbHVlID09ICdzdHJpbmcnIHx8IGlzU3ltYm9sKHZhbHVlKSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICB2YXIgcmVzdWx0ID0gKHZhbHVlICsgJycpO1xuICByZXR1cm4gKHJlc3VsdCA9PSAnMCcgJiYgKDEgLyB2YWx1ZSkgPT0gLUlORklOSVRZKSA/ICctMCcgOiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdG9LZXk7XG4iLCJ2YXIgY2FzdFBhdGggPSByZXF1aXJlKCcuL19jYXN0UGF0aCcpLFxuICAgIHRvS2V5ID0gcmVxdWlyZSgnLi9fdG9LZXknKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5nZXRgIHdpdGhvdXQgc3VwcG9ydCBmb3IgZGVmYXVsdCB2YWx1ZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7QXJyYXl8c3RyaW5nfSBwYXRoIFRoZSBwYXRoIG9mIHRoZSBwcm9wZXJ0eSB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgcmVzb2x2ZWQgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGJhc2VHZXQob2JqZWN0LCBwYXRoKSB7XG4gIHBhdGggPSBjYXN0UGF0aChwYXRoLCBvYmplY3QpO1xuXG4gIHZhciBpbmRleCA9IDAsXG4gICAgICBsZW5ndGggPSBwYXRoLmxlbmd0aDtcblxuICB3aGlsZSAob2JqZWN0ICE9IG51bGwgJiYgaW5kZXggPCBsZW5ndGgpIHtcbiAgICBvYmplY3QgPSBvYmplY3RbdG9LZXkocGF0aFtpbmRleCsrXSldO1xuICB9XG4gIHJldHVybiAoaW5kZXggJiYgaW5kZXggPT0gbGVuZ3RoKSA/IG9iamVjdCA6IHVuZGVmaW5lZDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlR2V0O1xuIiwidmFyIGJhc2VHZXQgPSByZXF1aXJlKCcuL19iYXNlR2V0Jyk7XG5cbi8qKlxuICogR2V0cyB0aGUgdmFsdWUgYXQgYHBhdGhgIG9mIGBvYmplY3RgLiBJZiB0aGUgcmVzb2x2ZWQgdmFsdWUgaXNcbiAqIGB1bmRlZmluZWRgLCB0aGUgYGRlZmF1bHRWYWx1ZWAgaXMgcmV0dXJuZWQgaW4gaXRzIHBsYWNlLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMy43LjBcbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7QXJyYXl8c3RyaW5nfSBwYXRoIFRoZSBwYXRoIG9mIHRoZSBwcm9wZXJ0eSB0byBnZXQuXG4gKiBAcGFyYW0geyp9IFtkZWZhdWx0VmFsdWVdIFRoZSB2YWx1ZSByZXR1cm5lZCBmb3IgYHVuZGVmaW5lZGAgcmVzb2x2ZWQgdmFsdWVzLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHJlc29sdmVkIHZhbHVlLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAnYSc6IFt7ICdiJzogeyAnYyc6IDMgfSB9XSB9O1xuICpcbiAqIF8uZ2V0KG9iamVjdCwgJ2FbMF0uYi5jJyk7XG4gKiAvLyA9PiAzXG4gKlxuICogXy5nZXQob2JqZWN0LCBbJ2EnLCAnMCcsICdiJywgJ2MnXSk7XG4gKiAvLyA9PiAzXG4gKlxuICogXy5nZXQob2JqZWN0LCAnYS5iLmMnLCAnZGVmYXVsdCcpO1xuICogLy8gPT4gJ2RlZmF1bHQnXG4gKi9cbmZ1bmN0aW9uIGdldChvYmplY3QsIHBhdGgsIGRlZmF1bHRWYWx1ZSkge1xuICB2YXIgcmVzdWx0ID0gb2JqZWN0ID09IG51bGwgPyB1bmRlZmluZWQgOiBiYXNlR2V0KG9iamVjdCwgcGF0aCk7XG4gIHJldHVybiByZXN1bHQgPT09IHVuZGVmaW5lZCA/IGRlZmF1bHRWYWx1ZSA6IHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXQ7XG4iLCIvKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmhhc0luYCB3aXRob3V0IHN1cHBvcnQgZm9yIGRlZXAgcGF0aHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqZWN0XSBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtBcnJheXxzdHJpbmd9IGtleSBUaGUga2V5IHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGBrZXlgIGV4aXN0cywgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBiYXNlSGFzSW4ob2JqZWN0LCBrZXkpIHtcbiAgcmV0dXJuIG9iamVjdCAhPSBudWxsICYmIGtleSBpbiBPYmplY3Qob2JqZWN0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlSGFzSW47XG4iLCJ2YXIgY2FzdFBhdGggPSByZXF1aXJlKCcuL19jYXN0UGF0aCcpLFxuICAgIGlzQXJndW1lbnRzID0gcmVxdWlyZSgnLi9pc0FyZ3VtZW50cycpLFxuICAgIGlzQXJyYXkgPSByZXF1aXJlKCcuL2lzQXJyYXknKSxcbiAgICBpc0luZGV4ID0gcmVxdWlyZSgnLi9faXNJbmRleCcpLFxuICAgIGlzTGVuZ3RoID0gcmVxdWlyZSgnLi9pc0xlbmd0aCcpLFxuICAgIHRvS2V5ID0gcmVxdWlyZSgnLi9fdG9LZXknKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHBhdGhgIGV4aXN0cyBvbiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtBcnJheXxzdHJpbmd9IHBhdGggVGhlIHBhdGggdG8gY2hlY2suXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBoYXNGdW5jIFRoZSBmdW5jdGlvbiB0byBjaGVjayBwcm9wZXJ0aWVzLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGBwYXRoYCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaGFzUGF0aChvYmplY3QsIHBhdGgsIGhhc0Z1bmMpIHtcbiAgcGF0aCA9IGNhc3RQYXRoKHBhdGgsIG9iamVjdCk7XG5cbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBwYXRoLmxlbmd0aCxcbiAgICAgIHJlc3VsdCA9IGZhbHNlO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgdmFyIGtleSA9IHRvS2V5KHBhdGhbaW5kZXhdKTtcbiAgICBpZiAoIShyZXN1bHQgPSBvYmplY3QgIT0gbnVsbCAmJiBoYXNGdW5jKG9iamVjdCwga2V5KSkpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBvYmplY3QgPSBvYmplY3Rba2V5XTtcbiAgfVxuICBpZiAocmVzdWx0IHx8ICsraW5kZXggIT0gbGVuZ3RoKSB7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICBsZW5ndGggPSBvYmplY3QgPT0gbnVsbCA/IDAgOiBvYmplY3QubGVuZ3RoO1xuICByZXR1cm4gISFsZW5ndGggJiYgaXNMZW5ndGgobGVuZ3RoKSAmJiBpc0luZGV4KGtleSwgbGVuZ3RoKSAmJlxuICAgIChpc0FycmF5KG9iamVjdCkgfHwgaXNBcmd1bWVudHMob2JqZWN0KSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaGFzUGF0aDtcbiIsInZhciBiYXNlSGFzSW4gPSByZXF1aXJlKCcuL19iYXNlSGFzSW4nKSxcbiAgICBoYXNQYXRoID0gcmVxdWlyZSgnLi9faGFzUGF0aCcpO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgcGF0aGAgaXMgYSBkaXJlY3Qgb3IgaW5oZXJpdGVkIHByb3BlcnR5IG9mIGBvYmplY3RgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7QXJyYXl8c3RyaW5nfSBwYXRoIFRoZSBwYXRoIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGBwYXRoYCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdCA9IF8uY3JlYXRlKHsgJ2EnOiBfLmNyZWF0ZSh7ICdiJzogMiB9KSB9KTtcbiAqXG4gKiBfLmhhc0luKG9iamVjdCwgJ2EnKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmhhc0luKG9iamVjdCwgJ2EuYicpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaGFzSW4ob2JqZWN0LCBbJ2EnLCAnYiddKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmhhc0luKG9iamVjdCwgJ2InKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGhhc0luKG9iamVjdCwgcGF0aCkge1xuICByZXR1cm4gb2JqZWN0ICE9IG51bGwgJiYgaGFzUGF0aChvYmplY3QsIHBhdGgsIGJhc2VIYXNJbik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaGFzSW47XG4iLCJ2YXIgYmFzZUlzRXF1YWwgPSByZXF1aXJlKCcuL19iYXNlSXNFcXVhbCcpLFxuICAgIGdldCA9IHJlcXVpcmUoJy4vZ2V0JyksXG4gICAgaGFzSW4gPSByZXF1aXJlKCcuL2hhc0luJyksXG4gICAgaXNLZXkgPSByZXF1aXJlKCcuL19pc0tleScpLFxuICAgIGlzU3RyaWN0Q29tcGFyYWJsZSA9IHJlcXVpcmUoJy4vX2lzU3RyaWN0Q29tcGFyYWJsZScpLFxuICAgIG1hdGNoZXNTdHJpY3RDb21wYXJhYmxlID0gcmVxdWlyZSgnLi9fbWF0Y2hlc1N0cmljdENvbXBhcmFibGUnKSxcbiAgICB0b0tleSA9IHJlcXVpcmUoJy4vX3RvS2V5Jyk7XG5cbi8qKiBVc2VkIHRvIGNvbXBvc2UgYml0bWFza3MgZm9yIHZhbHVlIGNvbXBhcmlzb25zLiAqL1xudmFyIENPTVBBUkVfUEFSVElBTF9GTEFHID0gMSxcbiAgICBDT01QQVJFX1VOT1JERVJFRF9GTEFHID0gMjtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5tYXRjaGVzUHJvcGVydHlgIHdoaWNoIGRvZXNuJ3QgY2xvbmUgYHNyY1ZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IHBhdGggVGhlIHBhdGggb2YgdGhlIHByb3BlcnR5IHRvIGdldC5cbiAqIEBwYXJhbSB7Kn0gc3JjVmFsdWUgVGhlIHZhbHVlIHRvIG1hdGNoLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgc3BlYyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmFzZU1hdGNoZXNQcm9wZXJ0eShwYXRoLCBzcmNWYWx1ZSkge1xuICBpZiAoaXNLZXkocGF0aCkgJiYgaXNTdHJpY3RDb21wYXJhYmxlKHNyY1ZhbHVlKSkge1xuICAgIHJldHVybiBtYXRjaGVzU3RyaWN0Q29tcGFyYWJsZSh0b0tleShwYXRoKSwgc3JjVmFsdWUpO1xuICB9XG4gIHJldHVybiBmdW5jdGlvbihvYmplY3QpIHtcbiAgICB2YXIgb2JqVmFsdWUgPSBnZXQob2JqZWN0LCBwYXRoKTtcbiAgICByZXR1cm4gKG9ialZhbHVlID09PSB1bmRlZmluZWQgJiYgb2JqVmFsdWUgPT09IHNyY1ZhbHVlKVxuICAgICAgPyBoYXNJbihvYmplY3QsIHBhdGgpXG4gICAgICA6IGJhc2VJc0VxdWFsKHNyY1ZhbHVlLCBvYmpWYWx1ZSwgQ09NUEFSRV9QQVJUSUFMX0ZMQUcgfCBDT01QQVJFX1VOT1JERVJFRF9GTEFHKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlTWF0Y2hlc1Byb3BlcnR5O1xuIiwiLyoqXG4gKiBUaGlzIG1ldGhvZCByZXR1cm5zIHRoZSBmaXJzdCBhcmd1bWVudCBpdCByZWNlaXZlcy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQHBhcmFtIHsqfSB2YWx1ZSBBbnkgdmFsdWUuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyBgdmFsdWVgLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAnYSc6IDEgfTtcbiAqXG4gKiBjb25zb2xlLmxvZyhfLmlkZW50aXR5KG9iamVjdCkgPT09IG9iamVjdCk7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGlkZW50aXR5KHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpZGVudGl0eTtcbiIsIi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ucHJvcGVydHlgIHdpdGhvdXQgc3VwcG9ydCBmb3IgZGVlcCBwYXRocy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBnZXQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBhY2Nlc3NvciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmFzZVByb3BlcnR5KGtleSkge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgcmV0dXJuIG9iamVjdCA9PSBudWxsID8gdW5kZWZpbmVkIDogb2JqZWN0W2tleV07XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZVByb3BlcnR5O1xuIiwidmFyIGJhc2VHZXQgPSByZXF1aXJlKCcuL19iYXNlR2V0Jyk7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlUHJvcGVydHlgIHdoaWNoIHN1cHBvcnRzIGRlZXAgcGF0aHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl8c3RyaW5nfSBwYXRoIFRoZSBwYXRoIG9mIHRoZSBwcm9wZXJ0eSB0byBnZXQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBhY2Nlc3NvciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmFzZVByb3BlcnR5RGVlcChwYXRoKSB7XG4gIHJldHVybiBmdW5jdGlvbihvYmplY3QpIHtcbiAgICByZXR1cm4gYmFzZUdldChvYmplY3QsIHBhdGgpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VQcm9wZXJ0eURlZXA7XG4iLCJ2YXIgYmFzZVByb3BlcnR5ID0gcmVxdWlyZSgnLi9fYmFzZVByb3BlcnR5JyksXG4gICAgYmFzZVByb3BlcnR5RGVlcCA9IHJlcXVpcmUoJy4vX2Jhc2VQcm9wZXJ0eURlZXAnKSxcbiAgICBpc0tleSA9IHJlcXVpcmUoJy4vX2lzS2V5JyksXG4gICAgdG9LZXkgPSByZXF1aXJlKCcuL190b0tleScpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIHZhbHVlIGF0IGBwYXRoYCBvZiBhIGdpdmVuIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDIuNC4wXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQHBhcmFtIHtBcnJheXxzdHJpbmd9IHBhdGggVGhlIHBhdGggb2YgdGhlIHByb3BlcnR5IHRvIGdldC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGFjY2Vzc29yIGZ1bmN0aW9uLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0cyA9IFtcbiAqICAgeyAnYSc6IHsgJ2InOiAyIH0gfSxcbiAqICAgeyAnYSc6IHsgJ2InOiAxIH0gfVxuICogXTtcbiAqXG4gKiBfLm1hcChvYmplY3RzLCBfLnByb3BlcnR5KCdhLmInKSk7XG4gKiAvLyA9PiBbMiwgMV1cbiAqXG4gKiBfLm1hcChfLnNvcnRCeShvYmplY3RzLCBfLnByb3BlcnR5KFsnYScsICdiJ10pKSwgJ2EuYicpO1xuICogLy8gPT4gWzEsIDJdXG4gKi9cbmZ1bmN0aW9uIHByb3BlcnR5KHBhdGgpIHtcbiAgcmV0dXJuIGlzS2V5KHBhdGgpID8gYmFzZVByb3BlcnR5KHRvS2V5KHBhdGgpKSA6IGJhc2VQcm9wZXJ0eURlZXAocGF0aCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcHJvcGVydHk7XG4iLCJ2YXIgYmFzZU1hdGNoZXMgPSByZXF1aXJlKCcuL19iYXNlTWF0Y2hlcycpLFxuICAgIGJhc2VNYXRjaGVzUHJvcGVydHkgPSByZXF1aXJlKCcuL19iYXNlTWF0Y2hlc1Byb3BlcnR5JyksXG4gICAgaWRlbnRpdHkgPSByZXF1aXJlKCcuL2lkZW50aXR5JyksXG4gICAgaXNBcnJheSA9IHJlcXVpcmUoJy4vaXNBcnJheScpLFxuICAgIHByb3BlcnR5ID0gcmVxdWlyZSgnLi9wcm9wZXJ0eScpO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLml0ZXJhdGVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSBbdmFsdWU9Xy5pZGVudGl0eV0gVGhlIHZhbHVlIHRvIGNvbnZlcnQgdG8gYW4gaXRlcmF0ZWUuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIGl0ZXJhdGVlLlxuICovXG5mdW5jdGlvbiBiYXNlSXRlcmF0ZWUodmFsdWUpIHtcbiAgLy8gRG9uJ3Qgc3RvcmUgdGhlIGB0eXBlb2ZgIHJlc3VsdCBpbiBhIHZhcmlhYmxlIHRvIGF2b2lkIGEgSklUIGJ1ZyBpbiBTYWZhcmkgOS5cbiAgLy8gU2VlIGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD0xNTYwMzQgZm9yIG1vcmUgZGV0YWlscy5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIGlkZW50aXR5O1xuICB9XG4gIGlmICh0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gaXNBcnJheSh2YWx1ZSlcbiAgICAgID8gYmFzZU1hdGNoZXNQcm9wZXJ0eSh2YWx1ZVswXSwgdmFsdWVbMV0pXG4gICAgICA6IGJhc2VNYXRjaGVzKHZhbHVlKTtcbiAgfVxuICByZXR1cm4gcHJvcGVydHkodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VJdGVyYXRlZTtcbiIsInZhciBnZXROYXRpdmUgPSByZXF1aXJlKCcuL19nZXROYXRpdmUnKTtcblxudmFyIGRlZmluZVByb3BlcnR5ID0gKGZ1bmN0aW9uKCkge1xuICB0cnkge1xuICAgIHZhciBmdW5jID0gZ2V0TmF0aXZlKE9iamVjdCwgJ2RlZmluZVByb3BlcnR5Jyk7XG4gICAgZnVuYyh7fSwgJycsIHt9KTtcbiAgICByZXR1cm4gZnVuYztcbiAgfSBjYXRjaCAoZSkge31cbn0oKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZGVmaW5lUHJvcGVydHk7XG4iLCJ2YXIgZGVmaW5lUHJvcGVydHkgPSByZXF1aXJlKCcuL19kZWZpbmVQcm9wZXJ0eScpO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBhc3NpZ25WYWx1ZWAgYW5kIGBhc3NpZ25NZXJnZVZhbHVlYCB3aXRob3V0XG4gKiB2YWx1ZSBjaGVja3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGFzc2lnbi5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGFzc2lnbi5cbiAqL1xuZnVuY3Rpb24gYmFzZUFzc2lnblZhbHVlKG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICBpZiAoa2V5ID09ICdfX3Byb3RvX18nICYmIGRlZmluZVByb3BlcnR5KSB7XG4gICAgZGVmaW5lUHJvcGVydHkob2JqZWN0LCBrZXksIHtcbiAgICAgICdjb25maWd1cmFibGUnOiB0cnVlLFxuICAgICAgJ2VudW1lcmFibGUnOiB0cnVlLFxuICAgICAgJ3ZhbHVlJzogdmFsdWUsXG4gICAgICAnd3JpdGFibGUnOiB0cnVlXG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VBc3NpZ25WYWx1ZTtcbiIsInZhciBiYXNlQXNzaWduVmFsdWUgPSByZXF1aXJlKCcuL19iYXNlQXNzaWduVmFsdWUnKSxcbiAgICBlcSA9IHJlcXVpcmUoJy4vZXEnKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBBc3NpZ25zIGB2YWx1ZWAgdG8gYGtleWAgb2YgYG9iamVjdGAgaWYgdGhlIGV4aXN0aW5nIHZhbHVlIGlzIG5vdCBlcXVpdmFsZW50XG4gKiB1c2luZyBbYFNhbWVWYWx1ZVplcm9gXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1zYW1ldmFsdWV6ZXJvKVxuICogZm9yIGVxdWFsaXR5IGNvbXBhcmlzb25zLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBhc3NpZ24uXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBhc3NpZ24uXG4gKi9cbmZ1bmN0aW9uIGFzc2lnblZhbHVlKG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICB2YXIgb2JqVmFsdWUgPSBvYmplY3Rba2V5XTtcbiAgaWYgKCEoaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGtleSkgJiYgZXEob2JqVmFsdWUsIHZhbHVlKSkgfHxcbiAgICAgICh2YWx1ZSA9PT0gdW5kZWZpbmVkICYmICEoa2V5IGluIG9iamVjdCkpKSB7XG4gICAgYmFzZUFzc2lnblZhbHVlKG9iamVjdCwga2V5LCB2YWx1ZSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhc3NpZ25WYWx1ZTtcbiIsInZhciBhc3NpZ25WYWx1ZSA9IHJlcXVpcmUoJy4vX2Fzc2lnblZhbHVlJyksXG4gICAgY2FzdFBhdGggPSByZXF1aXJlKCcuL19jYXN0UGF0aCcpLFxuICAgIGlzSW5kZXggPSByZXF1aXJlKCcuL19pc0luZGV4JyksXG4gICAgaXNPYmplY3QgPSByZXF1aXJlKCcuL2lzT2JqZWN0JyksXG4gICAgdG9LZXkgPSByZXF1aXJlKCcuL190b0tleScpO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnNldGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge0FycmF5fHN0cmluZ30gcGF0aCBUaGUgcGF0aCBvZiB0aGUgcHJvcGVydHkgdG8gc2V0LlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2V0LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2N1c3RvbWl6ZXJdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgcGF0aCBjcmVhdGlvbi5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VTZXQob2JqZWN0LCBwYXRoLCB2YWx1ZSwgY3VzdG9taXplcikge1xuICBpZiAoIWlzT2JqZWN0KG9iamVjdCkpIHtcbiAgICByZXR1cm4gb2JqZWN0O1xuICB9XG4gIHBhdGggPSBjYXN0UGF0aChwYXRoLCBvYmplY3QpO1xuXG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gcGF0aC5sZW5ndGgsXG4gICAgICBsYXN0SW5kZXggPSBsZW5ndGggLSAxLFxuICAgICAgbmVzdGVkID0gb2JqZWN0O1xuXG4gIHdoaWxlIChuZXN0ZWQgIT0gbnVsbCAmJiArK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgdmFyIGtleSA9IHRvS2V5KHBhdGhbaW5kZXhdKSxcbiAgICAgICAgbmV3VmFsdWUgPSB2YWx1ZTtcblxuICAgIGlmIChrZXkgPT09ICdfX3Byb3RvX18nIHx8IGtleSA9PT0gJ2NvbnN0cnVjdG9yJyB8fCBrZXkgPT09ICdwcm90b3R5cGUnKSB7XG4gICAgICByZXR1cm4gb2JqZWN0O1xuICAgIH1cblxuICAgIGlmIChpbmRleCAhPSBsYXN0SW5kZXgpIHtcbiAgICAgIHZhciBvYmpWYWx1ZSA9IG5lc3RlZFtrZXldO1xuICAgICAgbmV3VmFsdWUgPSBjdXN0b21pemVyID8gY3VzdG9taXplcihvYmpWYWx1ZSwga2V5LCBuZXN0ZWQpIDogdW5kZWZpbmVkO1xuICAgICAgaWYgKG5ld1ZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgbmV3VmFsdWUgPSBpc09iamVjdChvYmpWYWx1ZSlcbiAgICAgICAgICA/IG9ialZhbHVlXG4gICAgICAgICAgOiAoaXNJbmRleChwYXRoW2luZGV4ICsgMV0pID8gW10gOiB7fSk7XG4gICAgICB9XG4gICAgfVxuICAgIGFzc2lnblZhbHVlKG5lc3RlZCwga2V5LCBuZXdWYWx1ZSk7XG4gICAgbmVzdGVkID0gbmVzdGVkW2tleV07XG4gIH1cbiAgcmV0dXJuIG9iamVjdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlU2V0O1xuIiwidmFyIGJhc2VHZXQgPSByZXF1aXJlKCcuL19iYXNlR2V0JyksXG4gICAgYmFzZVNldCA9IHJlcXVpcmUoJy4vX2Jhc2VTZXQnKSxcbiAgICBjYXN0UGF0aCA9IHJlcXVpcmUoJy4vX2Nhc3RQYXRoJyk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgIGBfLnBpY2tCeWAgd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZSBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBzb3VyY2Ugb2JqZWN0LlxuICogQHBhcmFtIHtzdHJpbmdbXX0gcGF0aHMgVGhlIHByb3BlcnR5IHBhdGhzIHRvIHBpY2suXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBwcmVkaWNhdGUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIHByb3BlcnR5LlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgbmV3IG9iamVjdC5cbiAqL1xuZnVuY3Rpb24gYmFzZVBpY2tCeShvYmplY3QsIHBhdGhzLCBwcmVkaWNhdGUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBwYXRocy5sZW5ndGgsXG4gICAgICByZXN1bHQgPSB7fTtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBwYXRoID0gcGF0aHNbaW5kZXhdLFxuICAgICAgICB2YWx1ZSA9IGJhc2VHZXQob2JqZWN0LCBwYXRoKTtcblxuICAgIGlmIChwcmVkaWNhdGUodmFsdWUsIHBhdGgpKSB7XG4gICAgICBiYXNlU2V0KHJlc3VsdCwgY2FzdFBhdGgocGF0aCwgb2JqZWN0KSwgdmFsdWUpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VQaWNrQnk7XG4iLCJ2YXIgb3ZlckFyZyA9IHJlcXVpcmUoJy4vX292ZXJBcmcnKTtcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgZ2V0UHJvdG90eXBlID0gb3ZlckFyZyhPYmplY3QuZ2V0UHJvdG90eXBlT2YsIE9iamVjdCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0UHJvdG90eXBlO1xuIiwidmFyIGFycmF5UHVzaCA9IHJlcXVpcmUoJy4vX2FycmF5UHVzaCcpLFxuICAgIGdldFByb3RvdHlwZSA9IHJlcXVpcmUoJy4vX2dldFByb3RvdHlwZScpLFxuICAgIGdldFN5bWJvbHMgPSByZXF1aXJlKCcuL19nZXRTeW1ib2xzJyksXG4gICAgc3R1YkFycmF5ID0gcmVxdWlyZSgnLi9zdHViQXJyYXknKTtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZUdldFN5bWJvbHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdGhlIG93biBhbmQgaW5oZXJpdGVkIGVudW1lcmFibGUgc3ltYm9scyBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBzeW1ib2xzLlxuICovXG52YXIgZ2V0U3ltYm9sc0luID0gIW5hdGl2ZUdldFN5bWJvbHMgPyBzdHViQXJyYXkgOiBmdW5jdGlvbihvYmplY3QpIHtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICB3aGlsZSAob2JqZWN0KSB7XG4gICAgYXJyYXlQdXNoKHJlc3VsdCwgZ2V0U3ltYm9scyhvYmplY3QpKTtcbiAgICBvYmplY3QgPSBnZXRQcm90b3R5cGUob2JqZWN0KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBnZXRTeW1ib2xzSW47XG4iLCIvKipcbiAqIFRoaXMgZnVuY3Rpb24gaXMgbGlrZVxuICogW2BPYmplY3Qua2V5c2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5rZXlzKVxuICogZXhjZXB0IHRoYXQgaXQgaW5jbHVkZXMgaW5oZXJpdGVkIGVudW1lcmFibGUgcHJvcGVydGllcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqL1xuZnVuY3Rpb24gbmF0aXZlS2V5c0luKG9iamVjdCkge1xuICB2YXIgcmVzdWx0ID0gW107XG4gIGlmIChvYmplY3QgIT0gbnVsbCkge1xuICAgIGZvciAodmFyIGtleSBpbiBPYmplY3Qob2JqZWN0KSkge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBuYXRpdmVLZXlzSW47XG4iLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL2lzT2JqZWN0JyksXG4gICAgaXNQcm90b3R5cGUgPSByZXF1aXJlKCcuL19pc1Byb3RvdHlwZScpLFxuICAgIG5hdGl2ZUtleXNJbiA9IHJlcXVpcmUoJy4vX25hdGl2ZUtleXNJbicpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmtleXNJbmAgd2hpY2ggZG9lc24ndCB0cmVhdCBzcGFyc2UgYXJyYXlzIGFzIGRlbnNlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICovXG5mdW5jdGlvbiBiYXNlS2V5c0luKG9iamVjdCkge1xuICBpZiAoIWlzT2JqZWN0KG9iamVjdCkpIHtcbiAgICByZXR1cm4gbmF0aXZlS2V5c0luKG9iamVjdCk7XG4gIH1cbiAgdmFyIGlzUHJvdG8gPSBpc1Byb3RvdHlwZShvYmplY3QpLFxuICAgICAgcmVzdWx0ID0gW107XG5cbiAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgIGlmICghKGtleSA9PSAnY29uc3RydWN0b3InICYmIChpc1Byb3RvIHx8ICFoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KSkpKSB7XG4gICAgICByZXN1bHQucHVzaChrZXkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VLZXlzSW47XG4iLCJ2YXIgYXJyYXlMaWtlS2V5cyA9IHJlcXVpcmUoJy4vX2FycmF5TGlrZUtleXMnKSxcbiAgICBiYXNlS2V5c0luID0gcmVxdWlyZSgnLi9fYmFzZUtleXNJbicpLFxuICAgIGlzQXJyYXlMaWtlID0gcmVxdWlyZSgnLi9pc0FycmF5TGlrZScpO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdGhlIG93biBhbmQgaW5oZXJpdGVkIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgb2YgYG9iamVjdGAuXG4gKlxuICogKipOb3RlOioqIE5vbi1vYmplY3QgdmFsdWVzIGFyZSBjb2VyY2VkIHRvIG9iamVjdHMuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAzLjAuMFxuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmEgPSAxO1xuICogICB0aGlzLmIgPSAyO1xuICogfVxuICpcbiAqIEZvby5wcm90b3R5cGUuYyA9IDM7XG4gKlxuICogXy5rZXlzSW4obmV3IEZvbyk7XG4gKiAvLyA9PiBbJ2EnLCAnYicsICdjJ10gKGl0ZXJhdGlvbiBvcmRlciBpcyBub3QgZ3VhcmFudGVlZClcbiAqL1xuZnVuY3Rpb24ga2V5c0luKG9iamVjdCkge1xuICByZXR1cm4gaXNBcnJheUxpa2Uob2JqZWN0KSA/IGFycmF5TGlrZUtleXMob2JqZWN0LCB0cnVlKSA6IGJhc2VLZXlzSW4ob2JqZWN0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBrZXlzSW47XG4iLCJ2YXIgYmFzZUdldEFsbEtleXMgPSByZXF1aXJlKCcuL19iYXNlR2V0QWxsS2V5cycpLFxuICAgIGdldFN5bWJvbHNJbiA9IHJlcXVpcmUoJy4vX2dldFN5bWJvbHNJbicpLFxuICAgIGtleXNJbiA9IHJlcXVpcmUoJy4va2V5c0luJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiBvd24gYW5kIGluaGVyaXRlZCBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIGFuZFxuICogc3ltYm9scyBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcyBhbmQgc3ltYm9scy5cbiAqL1xuZnVuY3Rpb24gZ2V0QWxsS2V5c0luKG9iamVjdCkge1xuICByZXR1cm4gYmFzZUdldEFsbEtleXMob2JqZWN0LCBrZXlzSW4sIGdldFN5bWJvbHNJbik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0QWxsS2V5c0luO1xuIiwidmFyIGFycmF5TWFwID0gcmVxdWlyZSgnLi9fYXJyYXlNYXAnKSxcbiAgICBiYXNlSXRlcmF0ZWUgPSByZXF1aXJlKCcuL19iYXNlSXRlcmF0ZWUnKSxcbiAgICBiYXNlUGlja0J5ID0gcmVxdWlyZSgnLi9fYmFzZVBpY2tCeScpLFxuICAgIGdldEFsbEtleXNJbiA9IHJlcXVpcmUoJy4vX2dldEFsbEtleXNJbicpO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gb2JqZWN0IGNvbXBvc2VkIG9mIHRoZSBgb2JqZWN0YCBwcm9wZXJ0aWVzIGBwcmVkaWNhdGVgIHJldHVybnNcbiAqIHRydXRoeSBmb3IuIFRoZSBwcmVkaWNhdGUgaXMgaW52b2tlZCB3aXRoIHR3byBhcmd1bWVudHM6ICh2YWx1ZSwga2V5KS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBzb3VyY2Ugb2JqZWN0LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW3ByZWRpY2F0ZT1fLmlkZW50aXR5XSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgcHJvcGVydHkuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBuZXcgb2JqZWN0LlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAnYSc6IDEsICdiJzogJzInLCAnYyc6IDMgfTtcbiAqXG4gKiBfLnBpY2tCeShvYmplY3QsIF8uaXNOdW1iZXIpO1xuICogLy8gPT4geyAnYSc6IDEsICdjJzogMyB9XG4gKi9cbmZ1bmN0aW9uIHBpY2tCeShvYmplY3QsIHByZWRpY2F0ZSkge1xuICBpZiAob2JqZWN0ID09IG51bGwpIHtcbiAgICByZXR1cm4ge307XG4gIH1cbiAgdmFyIHByb3BzID0gYXJyYXlNYXAoZ2V0QWxsS2V5c0luKG9iamVjdCksIGZ1bmN0aW9uKHByb3ApIHtcbiAgICByZXR1cm4gW3Byb3BdO1xuICB9KTtcbiAgcHJlZGljYXRlID0gYmFzZUl0ZXJhdGVlKHByZWRpY2F0ZSk7XG4gIHJldHVybiBiYXNlUGlja0J5KG9iamVjdCwgcHJvcHMsIGZ1bmN0aW9uKHZhbHVlLCBwYXRoKSB7XG4gICAgcmV0dXJuIHByZWRpY2F0ZSh2YWx1ZSwgcGF0aFswXSk7XG4gIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHBpY2tCeTtcbiIsImltcG9ydCB7IEJveCwgQnV0dG9uLCBEcmF3ZXIsIERyYXdlckNvbnRlbnQsIERyYXdlckZvb3RlciwgSDMsIEljb24gfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcbmltcG9ydCBpc05pbCBmcm9tICdsb2Rhc2gvaXNOaWwuanMnO1xuaW1wb3J0IHBpY2tCeSBmcm9tICdsb2Rhc2gvcGlja0J5LmpzJztcbmltcG9ydCB7IHR5cGUgRm9ybUV2ZW50SGFuZGxlciwgdXNlRWZmZWN0LCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQmFzZVByb3BlcnR5Q29tcG9uZW50LCB1c2VGaWx0ZXJEcmF3ZXIsIHVzZVF1ZXJ5UGFyYW1zLCB1c2VUcmFuc2xhdGlvbiB9IGZyb20gJ2FkbWluanMnO1xuXG5leHBvcnQgdHlwZSBGaWx0ZXJQcm9wcyA9IHtcblx0cmVzb3VyY2U6IHsgaWQ6IHN0cmluZzsgZmlsdGVyUHJvcGVydGllczogQXJyYXk8eyBwcm9wZXJ0eVBhdGg6IHN0cmluZyB9PiB9O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRmlsdGVyRHJhd2VyKHByb3BzOiBGaWx0ZXJQcm9wcykge1xuXHRjb25zdCB7IHJlc291cmNlIH0gPSBwcm9wcztcblx0Y29uc3QgcHJvcGVydGllcyA9IHJlc291cmNlLmZpbHRlclByb3BlcnRpZXM7XG5cblx0Y29uc3QgW2ZpbHRlciwgc2V0RmlsdGVyXSA9IHVzZVN0YXRlPFJlY29yZDxzdHJpbmcsIHVua25vd24+Pih7fSk7XG5cdGNvbnN0IHsgdHJhbnNsYXRlQnV0dG9uLCB0cmFuc2xhdGVMYWJlbCB9ID0gdXNlVHJhbnNsYXRpb24oKTtcblx0Y29uc3QgaW5pdGlhbExvYWQgPSB1c2VSZWYodHJ1ZSk7XG5cdGNvbnN0IHsgaXNWaXNpYmxlLCB0b2dnbGVGaWx0ZXIgfSA9IHVzZUZpbHRlckRyYXdlcigpO1xuXHRjb25zdCB7IHN0b3JlUGFyYW1zLCBjbGVhclBhcmFtcywgZmlsdGVycyB9ID0gdXNlUXVlcnlQYXJhbXMoKTtcblxuXHR1c2VFZmZlY3QoKCkgPT4ge1xuXHRcdGlmIChpbml0aWFsTG9hZC5jdXJyZW50KSB7XG5cdFx0XHRpbml0aWFsTG9hZC5jdXJyZW50ID0gZmFsc2U7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNldEZpbHRlcih7fSk7XG5cdFx0fVxuXHR9LCBbcmVzb3VyY2UuaWRdKTtcblxuXHRjb25zdCBoYW5kbGVTdWJtaXQ6IEZvcm1FdmVudEhhbmRsZXI8SFRNTEVsZW1lbnQ+ID0gKGV2ZW50KSA9PiB7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRzdG9yZVBhcmFtcyh7IGZpbHRlcnM6IHBpY2tCeShmaWx0ZXIsICh2KSA9PiAhaXNOaWwodikpLCBwYWdlOiAnMScgfSk7XG5cdH07XG5cblx0Y29uc3QgaGFuZGxlUmVzZXQ6IEZvcm1FdmVudEhhbmRsZXI8SFRNTEVsZW1lbnQ+ID0gKGV2ZW50KSA9PiB7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRjbGVhclBhcmFtcygnZmlsdGVycycpO1xuXHRcdHNldEZpbHRlcih7fSk7XG5cdH07XG5cblx0dXNlRWZmZWN0KCgpID0+IHtcblx0XHRpZiAoZmlsdGVycykge1xuXHRcdFx0c2V0RmlsdGVyKGZpbHRlcnMpO1xuXHRcdH1cblx0fSwgW2ZpbHRlcnNdKTtcblxuXHRjb25zdCBoYW5kbGVDaGFuZ2UgPSAocHJvcGVydHlPclJlY29yZDogc3RyaW5nIHwgeyBwYXJhbXM/OiB1bmtub3duIH0sIHZhbHVlOiBhbnkpOiB2b2lkID0+IHtcblx0XHRpZiAodHlwZW9mIHByb3BlcnR5T3JSZWNvcmQgIT09ICdzdHJpbmcnKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ3lvdSBjYW4gbm90IHBhc3MgUmVjb3JkSlNPTiB0byBmaWx0ZXJzJyk7XG5cdFx0fVxuXHRcdHNldEZpbHRlcih7XG5cdFx0XHQuLi5maWx0ZXIsXG5cdFx0XHRbcHJvcGVydHlPclJlY29yZF06IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgIXZhbHVlLmxlbmd0aCA/IHVuZGVmaW5lZCA6IHZhbHVlLFxuXHRcdH0pO1xuXHR9O1xuXG5cdGNvbnN0IGdldFJlc291cmNlRWxlbWVudENzcyA9IChyZXNvdXJjZUlkOiBzdHJpbmcsIHN1ZmZpeDogc3RyaW5nKSA9PiBgJHtyZXNvdXJjZUlkfS0ke3N1ZmZpeH1gO1xuXHRjb25zdCBjb250ZW50VGFnID0gZ2V0UmVzb3VyY2VFbGVtZW50Q3NzKHJlc291cmNlLmlkLCAnZmlsdGVyLWRyYXdlcicpO1xuXHRjb25zdCBjc3NDb250ZW50ID0gZ2V0UmVzb3VyY2VFbGVtZW50Q3NzKHJlc291cmNlLmlkLCAnZmlsdGVyLWRyYXdlci1jb250ZW50Jyk7XG5cdGNvbnN0IGNzc0Zvb3RlciA9IGdldFJlc291cmNlRWxlbWVudENzcyhyZXNvdXJjZS5pZCwgJ2ZpbHRlci1kcmF3ZXItZm9vdGVyJyk7XG5cdGNvbnN0IGNzc0J1dHRvbkFwcGx5ID0gZ2V0UmVzb3VyY2VFbGVtZW50Q3NzKHJlc291cmNlLmlkLCAnZmlsdGVyLWRyYXdlci1idXR0b24tYXBwbHknKTtcblx0Y29uc3QgY3NzQnV0dG9uUmVzZXQgPSBnZXRSZXNvdXJjZUVsZW1lbnRDc3MocmVzb3VyY2UuaWQsICdmaWx0ZXItZHJhd2VyLWJ1dHRvbi1yZXNldCcpO1xuXG5cdHJldHVybiAoXG5cdFx0PD5cblx0XHRcdHtpc1Zpc2libGUgPyAoXG5cdFx0XHRcdDxkaXZcblx0XHRcdFx0XHRjbGFzc05hbWU9J2FkbWluLWZpbHRlci1vdmVybGF5J1xuXHRcdFx0XHRcdG9uQ2xpY2s9e3RvZ2dsZUZpbHRlcn1cblx0XHRcdFx0XHRyb2xlPSdidXR0b24nXG5cdFx0XHRcdFx0dGFiSW5kZXg9ey0xfVxuXHRcdFx0XHRcdGFyaWEtbGFiZWw9J0Nsb3NlIGZpbHRlcnMnXG5cdFx0XHRcdC8+XG5cdFx0XHQpIDogbnVsbH1cblx0XHRcdDxEcmF3ZXJcblx0XHRcdFx0dmFyaWFudD0nZmlsdGVyJ1xuXHRcdFx0XHRpc0hpZGRlbj17IWlzVmlzaWJsZX1cblx0XHRcdFx0YXM9J2Zvcm0nXG5cdFx0XHRcdG9uU3VibWl0PXtoYW5kbGVTdWJtaXR9XG5cdFx0XHRcdG9uUmVzZXQ9e2hhbmRsZVJlc2V0fVxuXHRcdFx0XHRkYXRhLWNzcz17Y29udGVudFRhZ31cblx0XHRcdD5cblx0XHRcdFx0PERyYXdlckNvbnRlbnQgZGF0YS1jc3M9e2Nzc0NvbnRlbnR9PlxuXHRcdFx0XHRcdDxCb3ggZmxleCBqdXN0aWZ5Q29udGVudD0nc3BhY2UtYmV0d2Vlbic+XG5cdFx0XHRcdFx0XHQ8SDM+e3RyYW5zbGF0ZUxhYmVsKCdmaWx0ZXJzJywgcmVzb3VyY2UuaWQpfTwvSDM+XG5cdFx0XHRcdFx0XHQ8QnV0dG9uXG5cdFx0XHRcdFx0XHRcdHR5cGU9J2J1dHRvbidcblx0XHRcdFx0XHRcdFx0dmFyaWFudD0nbGlnaHQnXG5cdFx0XHRcdFx0XHRcdHNpemU9J2ljb24nXG5cdFx0XHRcdFx0XHRcdHJvdW5kZWRcblx0XHRcdFx0XHRcdFx0Y29sb3I9J3RleHQnXG5cdFx0XHRcdFx0XHRcdG9uQ2xpY2s9e3RvZ2dsZUZpbHRlcn1cblx0XHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdFx0PEljb24gaWNvbj0nWCcgLz5cblx0XHRcdFx0XHRcdDwvQnV0dG9uPlxuXHRcdFx0XHRcdDwvQm94PlxuXHRcdFx0XHRcdDxCb3ggbXk9J3gzJz5cblx0XHRcdFx0XHRcdHtwcm9wZXJ0aWVzLm1hcCgocHJvcGVydHkpID0+IChcblx0XHRcdFx0XHRcdFx0PEJhc2VQcm9wZXJ0eUNvbXBvbmVudFxuXHRcdFx0XHRcdFx0XHRcdGtleT17cHJvcGVydHkucHJvcGVydHlQYXRofVxuXHRcdFx0XHRcdFx0XHRcdHdoZXJlPSdmaWx0ZXInXG5cdFx0XHRcdFx0XHRcdFx0b25DaGFuZ2U9e2hhbmRsZUNoYW5nZX1cblx0XHRcdFx0XHRcdFx0XHRwcm9wZXJ0eT17cHJvcGVydHkgYXMgYW55fVxuXHRcdFx0XHRcdFx0XHRcdGZpbHRlcj17ZmlsdGVyfVxuXHRcdFx0XHRcdFx0XHRcdHJlc291cmNlPXtyZXNvdXJjZSBhcyBhbnl9XG5cdFx0XHRcdFx0XHRcdC8+XG5cdFx0XHRcdFx0XHQpKX1cblx0XHRcdFx0XHQ8L0JveD5cblx0XHRcdFx0PC9EcmF3ZXJDb250ZW50PlxuXHRcdFx0XHQ8RHJhd2VyRm9vdGVyIGRhdGEtY3NzPXtjc3NGb290ZXJ9PlxuXHRcdFx0XHRcdDxCdXR0b24gdHlwZT0nYnV0dG9uJyB2YXJpYW50PSdsaWdodCcgb25DbGljaz17aGFuZGxlUmVzZXR9IGRhdGEtY3NzPXtjc3NCdXR0b25SZXNldH0+XG5cdFx0XHRcdFx0XHR7dHJhbnNsYXRlQnV0dG9uKCdyZXNldEZpbHRlcicsIHJlc291cmNlLmlkKX1cblx0XHRcdFx0XHQ8L0J1dHRvbj5cblx0XHRcdFx0XHQ8QnV0dG9uIHR5cGU9J3N1Ym1pdCcgdmFyaWFudD0nY29udGFpbmVkJyBkYXRhLWNzcz17Y3NzQnV0dG9uQXBwbHl9PlxuXHRcdFx0XHRcdFx0e3RyYW5zbGF0ZUJ1dHRvbignYXBwbHlDaGFuZ2VzJywgcmVzb3VyY2UuaWQpfVxuXHRcdFx0XHRcdDwvQnV0dG9uPlxuXHRcdFx0XHQ8L0RyYXdlckZvb3Rlcj5cblx0XHRcdDwvRHJhd2VyPlxuXHRcdDwvPlxuXHQpO1xufVxuIiwiQWRtaW5KUy5Vc2VyQ29tcG9uZW50cyA9IHt9XG5pbXBvcnQgT3JkZXJTdGF0dXNBY3Rpb24gZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvT3JkZXJTdGF0dXNBY3Rpb24nXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLk9yZGVyU3RhdHVzQWN0aW9uID0gT3JkZXJTdGF0dXNBY3Rpb25cbmltcG9ydCBDYW5jZWxPcmRlckFjdGlvbiBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9DYW5jZWxPcmRlckFjdGlvbidcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuQ2FuY2VsT3JkZXJBY3Rpb24gPSBDYW5jZWxPcmRlckFjdGlvblxuaW1wb3J0IE9yZGVyQXVkaXRUaW1lbGluZUFjdGlvbiBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9PcmRlckF1ZGl0VGltZWxpbmVBY3Rpb24nXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLk9yZGVyQXVkaXRUaW1lbGluZUFjdGlvbiA9IE9yZGVyQXVkaXRUaW1lbGluZUFjdGlvblxuaW1wb3J0IE9yZGVyU2hvdyBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9PcmRlclNob3cnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLk9yZGVyU2hvdyA9IE9yZGVyU2hvd1xuaW1wb3J0IE9yZGVyRnVsZmlsbG1lbnRBY3Rpb24gZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvT3JkZXJGdWxmaWxsbWVudEFjdGlvbidcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuT3JkZXJGdWxmaWxsbWVudEFjdGlvbiA9IE9yZGVyRnVsZmlsbG1lbnRBY3Rpb25cbmltcG9ydCBPcmRlclBhY2tpbmdTbGlwQWN0aW9uIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL09yZGVyUGFja2luZ1NsaXBBY3Rpb24nXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLk9yZGVyUGFja2luZ1NsaXBBY3Rpb24gPSBPcmRlclBhY2tpbmdTbGlwQWN0aW9uXG5pbXBvcnQgT3JkZXJUb3RhbExpc3QgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvT3JkZXJUb3RhbExpc3QnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLk9yZGVyVG90YWxMaXN0ID0gT3JkZXJUb3RhbExpc3RcbmltcG9ydCBPcmRlclRvdGFsUmFuZ2VGaWx0ZXIgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvT3JkZXJUb3RhbFJhbmdlRmlsdGVyJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5PcmRlclRvdGFsUmFuZ2VGaWx0ZXIgPSBPcmRlclRvdGFsUmFuZ2VGaWx0ZXJcbmltcG9ydCBTZWxlY3RGaWx0ZXJXaXRoUGxhY2Vob2xkZXIgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvU2VsZWN0RmlsdGVyV2l0aFBsYWNlaG9sZGVyJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5TZWxlY3RGaWx0ZXJXaXRoUGxhY2Vob2xkZXIgPSBTZWxlY3RGaWx0ZXJXaXRoUGxhY2Vob2xkZXJcbmltcG9ydCBVc2VyU2hvdyBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9Vc2VyU2hvdydcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuVXNlclNob3cgPSBVc2VyU2hvd1xuaW1wb3J0IFVzZXJTZWdtZW50cyBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9Vc2VyU2VnbWVudHMnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlVzZXJTZWdtZW50cyA9IFVzZXJTZWdtZW50c1xuaW1wb3J0IFByb2R1Y3RTY2hlZHVsZURpc2NvdW50QWN0aW9uIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL1Byb2R1Y3RTY2hlZHVsZURpc2NvdW50QWN0aW9uJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5Qcm9kdWN0U2NoZWR1bGVEaXNjb3VudEFjdGlvbiA9IFByb2R1Y3RTY2hlZHVsZURpc2NvdW50QWN0aW9uXG5pbXBvcnQgUHJvZHVjdE5hbWVMaXN0IGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL1Byb2R1Y3ROYW1lTGlzdCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuUHJvZHVjdE5hbWVMaXN0ID0gUHJvZHVjdE5hbWVMaXN0XG5pbXBvcnQgUHJvZHVjdExpc3QgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvUHJvZHVjdExpc3QnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlByb2R1Y3RMaXN0ID0gUHJvZHVjdExpc3RcbmltcG9ydCBQcm9kdWN0U2hvdyBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9Qcm9kdWN0U2hvdydcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuUHJvZHVjdFNob3cgPSBQcm9kdWN0U2hvd1xuaW1wb3J0IFByb2R1Y3RWYXJpYW50TWF0cml4IGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL1Byb2R1Y3RWYXJpYW50TWF0cml4J1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5Qcm9kdWN0VmFyaWFudE1hdHJpeCA9IFByb2R1Y3RWYXJpYW50TWF0cml4XG5pbXBvcnQgUHJvZHVjdENzdkltcG9ydEV4cG9ydEFjdGlvbiBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9Qcm9kdWN0Q3N2SW1wb3J0RXhwb3J0QWN0aW9uJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5Qcm9kdWN0Q3N2SW1wb3J0RXhwb3J0QWN0aW9uID0gUHJvZHVjdENzdkltcG9ydEV4cG9ydEFjdGlvblxuaW1wb3J0IFByb2R1Y3RUYWdzRWRpdCBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9Qcm9kdWN0VGFnc0VkaXQnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlByb2R1Y3RUYWdzRWRpdCA9IFByb2R1Y3RUYWdzRWRpdFxuaW1wb3J0IFByb2R1Y3ROZXcgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvUHJvZHVjdE5ldydcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuUHJvZHVjdE5ldyA9IFByb2R1Y3ROZXdcbmltcG9ydCBQcm9kdWN0RWRpdCBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9Qcm9kdWN0RWRpdCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuUHJvZHVjdEVkaXQgPSBQcm9kdWN0RWRpdFxuaW1wb3J0IFByb2R1Y3RBY3Rpdml0eVRpbWVsaW5lIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL1Byb2R1Y3RBY3Rpdml0eVRpbWVsaW5lJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5Qcm9kdWN0QWN0aXZpdHlUaW1lbGluZSA9IFByb2R1Y3RBY3Rpdml0eVRpbWVsaW5lXG5pbXBvcnQgUHJvZHVjdEJ1bGtTZXRDYXRlZ29yeUFjdGlvbiBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9Qcm9kdWN0QnVsa1NldENhdGVnb3J5QWN0aW9uJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5Qcm9kdWN0QnVsa1NldENhdGVnb3J5QWN0aW9uID0gUHJvZHVjdEJ1bGtTZXRDYXRlZ29yeUFjdGlvblxuaW1wb3J0IFByb2R1Y3RCdWxrU2V0QnJhbmRBY3Rpb24gZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvUHJvZHVjdEJ1bGtTZXRCcmFuZEFjdGlvbidcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuUHJvZHVjdEJ1bGtTZXRCcmFuZEFjdGlvbiA9IFByb2R1Y3RCdWxrU2V0QnJhbmRBY3Rpb25cbmltcG9ydCBQcm9kdWN0QnVsa0VkaXRUYWdzQWN0aW9uIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL1Byb2R1Y3RCdWxrRWRpdFRhZ3NBY3Rpb24nXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlByb2R1Y3RCdWxrRWRpdFRhZ3NBY3Rpb24gPSBQcm9kdWN0QnVsa0VkaXRUYWdzQWN0aW9uXG5pbXBvcnQgUHJvZHVjdEJ1bGtBZGp1c3RQcmljZUFjdGlvbiBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9Qcm9kdWN0QnVsa0FkanVzdFByaWNlQWN0aW9uJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5Qcm9kdWN0QnVsa0FkanVzdFByaWNlQWN0aW9uID0gUHJvZHVjdEJ1bGtBZGp1c3RQcmljZUFjdGlvblxuaW1wb3J0IFByb2R1Y3RCdWxrVG9nZ2xlSW5TdG9ja0FjdGlvbiBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9Qcm9kdWN0QnVsa1RvZ2dsZUluU3RvY2tBY3Rpb24nXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlByb2R1Y3RCdWxrVG9nZ2xlSW5TdG9ja0FjdGlvbiA9IFByb2R1Y3RCdWxrVG9nZ2xlSW5TdG9ja0FjdGlvblxuaW1wb3J0IERhc2hib2FyZCBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9EYXNoYm9hcmQnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkRhc2hib2FyZCA9IERhc2hib2FyZFxuaW1wb3J0IExvZ2luIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL0xvZ2luJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5Mb2dpbiA9IExvZ2luXG5pbXBvcnQgTG9nZ2VkSW4gZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvTG9nZ2VkSW4nXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkxvZ2dlZEluID0gTG9nZ2VkSW5cbmltcG9ydCBUb3BCYXIgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvVG9wQmFyJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5Ub3BCYXIgPSBUb3BCYXJcbmltcG9ydCBGaWx0ZXJEcmF3ZXIgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvRmlsdGVyRHJhd2VyJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5GaWx0ZXJEcmF3ZXIgPSBGaWx0ZXJEcmF3ZXIiXSwibmFtZXMiOlsiYXBpIiwiQXBpQ2xpZW50Iiwic3RhdHVzZXMiLCJPcmRlclN0YXR1c0FjdGlvbiIsImFjdGlvbiIsInJlY29yZCIsInJlc291cmNlIiwibG9jYWxSZWNvcmQiLCJzZXRMb2NhbFJlY29yZCIsInVzZVN0YXRlIiwic2VsZWN0ZWRTdGF0dXMiLCJzZXRTZWxlY3RlZFN0YXR1cyIsInBhcmFtcyIsInN0YXR1cyIsImxvYWRpbmciLCJzZXRMb2FkaW5nIiwiYWRkTm90aWNlIiwidXNlTm90aWNlIiwidHJhbnNsYXRlQWN0aW9uIiwidHJhbnNsYXRlTGFiZWwiLCJ0cmFuc2xhdGVNZXNzYWdlIiwidXNlVHJhbnNsYXRpb24iLCJSZWFjdCIsImNyZWF0ZUVsZW1lbnQiLCJCb3giLCJ2YXJpYW50IiwicCIsIlRleHQiLCJjdXJyZW50U3RhdHVzIiwic3RhdHVzT3B0aW9ucyIsInVzZU1lbW8iLCJtYXAiLCJ2YWx1ZSIsImxhYmVsIiwiaWQiLCJjdXJyZW50TGFiZWwiLCJzZWxlY3RlZE9wdGlvbiIsImZpbmQiLCJvcHRpb24iLCJuZXh0TGFiZWwiLCJoYW5kbGVDbGljayIsImZvcm1EYXRhIiwiRm9ybURhdGEiLCJhcHBlbmQiLCJyZXNwb25zZSIsInJlY29yZEFjdGlvbiIsInJlc291cmNlSWQiLCJyZWNvcmRJZCIsImFjdGlvbk5hbWUiLCJuYW1lIiwibWV0aG9kIiwiZGF0YSIsIm5vdGljZSIsInR5cGUiLCJtZXNzYWdlIiwib3B0aW9ucyIsImJ1dHRvbkxhYmVsIiwidGl0bGUiLCJib3JkZXJSYWRpdXMiLCJib3hTaGFkb3ciLCJtYXhXaWR0aCIsInN0eWxlIiwiYm9yZGVyIiwiZGlzcGxheSIsImFsaWduSXRlbXMiLCJqdXN0aWZ5Q29udGVudCIsIm1iIiwiZm9udFNpemUiLCJmb250V2VpZ2h0IiwiZmxleERpcmVjdGlvbiIsImdhcCIsIm1yIiwiQmFkZ2UiLCJvdXRsaW5lIiwiYmFja2dyb3VuZCIsImJvcmRlckNvbG9yIiwiY29sb3IiLCJGb3JtR3JvdXAiLCJTZWxlY3QiLCJpc0NsZWFyYWJsZSIsIm9uQ2hhbmdlIiwiQnV0dG9uIiwib25DbGljayIsImRpc2FibGVkIiwiQ2FuY2VsT3JkZXJBY3Rpb24iLCJyZWZ1bmRQYXltZW50Iiwic2V0UmVmdW5kUGF5bWVudCIsInN0cmlwZVNlc3Npb25JZCIsImNhblJlZnVuZCIsIkJvb2xlYW4iLCJoYW5kbGVDYW5jZWwiLCJhcyIsImN1cnNvciIsImNoZWNrZWQiLCJldmVudCIsInRhcmdldCIsIndpZHRoIiwiaGVpZ2h0IiwiZXh0cmFjdEVudHJpZXMiLCJwYXlsb2FkIiwiZW50cmllcyIsIkFycmF5IiwiaXNBcnJheSIsIk9yZGVyQXVkaXRUaW1lbGluZUFjdGlvbiIsInNldEVudHJpZXMiLCJub3RlIiwic2V0Tm90ZSIsInNhdmluZyIsInNldFNhdmluZyIsImFkZE5vdGljZVJlZiIsInVzZVJlZiIsInVzZUVmZmVjdCIsImN1cnJlbnQiLCJpc0FjdGl2ZSIsInRoZW4iLCJwYXlsb2FkRW50cmllcyIsImNhdGNoIiwiZmluYWxseSIsImZvcm1hdFRpbWVzdGFtcCIsInBhcnNlZCIsIkRhdGUiLCJwYXJzZSIsIk51bWJlciIsImlzTmFOIiwidG9Mb2NhbGVTdHJpbmciLCJoYW5kbGVTdWJtaXQiLCJ0cmltbWVkIiwidHJpbSIsIkxhYmVsIiwiaHRtbEZvciIsInBsYWNlaG9sZGVyIiwicm93cyIsInJlc2l6ZSIsInBhZGRpbmciLCJtYXJnaW5Ub3AiLCJsZW5ndGgiLCJlbnRyeSIsImFkbWluTGFiZWwiLCJhZG1pbkVtYWlsIiwidGltZXN0YW1wIiwiY3JlYXRlZEF0IiwiZnJvbUxhYmVsIiwiZnJvbVN0YXR1cyIsInRvTGFiZWwiLCJ0b1N0YXR1cyIsImtleSIsImZyb20iLCJ0byIsIkljb24iLCJpY29uIiwic2l6ZSIsIm10IiwiZm9ybWF0TW9uZXkiLCJjdXJyZW5jeSIsInNhZmVWYWx1ZSIsImlzRmluaXRlIiwiSW50bCIsIk51bWJlckZvcm1hdCIsInVuZGVmaW5lZCIsIm1pbmltdW1GcmFjdGlvbkRpZ2l0cyIsIm1heGltdW1GcmFjdGlvbkRpZ2l0cyIsImZvcm1hdCIsInRvRml4ZWQiLCJPcmRlclNob3ciLCJwcm9wcyIsInNldFBheWxvYWQiLCJzdGF0dXNWYXJpYW50IiwicGF5bWVudFN0YXR1cyIsInBheW1lbnRTdGF0dXNMYWJlbCIsImNsYXNzTmFtZSIsImdyaWRUZW1wbGF0ZUNvbHVtbnMiLCJzdWJ0b3RhbCIsImRpc2NvdW50cyIsInNoaXBwaW5nIiwidG90YWwiLCJPcmlnaW5hbFNob3ciLCJleHRyYWN0UGF5bG9hZCIsImNhcnJpZXIiLCJ0cmFja2luZ051bWJlciIsIm1heWJlIiwiT3JkZXJGdWxmaWxsbWVudEFjdGlvbiIsInNldENhcnJpZXIiLCJzZXRUcmFja2luZ051bWJlciIsImxvYWQiLCJ1c2VDYWxsYmFjayIsImhhbmRsZVNhdmUiLCJJbnB1dCIsImUiLCJub3JtYWxpemVGdWxsTmFtZSIsImZpcnN0IiwibGFzdCIsImZpcnN0VHJpbW1lZCIsImxhc3RUcmltbWVkIiwiZmlyc3RMb3dlciIsInRvTG9jYWxlTG93ZXJDYXNlIiwibGFzdExvd2VyIiwiaW5jbHVkZXMiLCJPcmRlclBhY2tpbmdTbGlwQWN0aW9uIiwiY3VzdG9tZXIiLCJjb250YWN0TmFtZSIsImNvbnRhY3RMYXN0TmFtZSIsIndpbmRvdyIsInByaW50Iiwib3JkZXJJZCIsImNvbnRhY3RQaG9uZSIsImNvbnRhY3RFbWFpbCIsIlRhYmxlIiwiVGFibGVIZWFkIiwiVGFibGVSb3ciLCJUYWJsZUNlbGwiLCJUYWJsZUJvZHkiLCJpdGVtcyIsIml0ZW0iLCJpbmRleCIsInF1YW50aXR5IiwidW5pdFByaWNlIiwicHJpY2UiLCJtaW5XaWR0aCIsIk9yZGVyVG90YWxMaXN0IiwicHJvcGVydHkiLCJyYXciLCJwYXRoIiwibnVtZXJpYyIsInBhcnNlTnVtYmVyIiwibm9ybWFsaXplZCIsImJ1aWxkRmlsdGVySnNvbiIsIm1pbiIsIm1heCIsIm1pblZhbHVlIiwibWF4VmFsdWUiLCJKU09OIiwic3RyaW5naWZ5IiwiZ3RlIiwibHRlIiwiT3JkZXJUb3RhbFJhbmdlRmlsdGVyIiwiZmlsdGVyIiwidHJhbnNsYXRlUHJvcGVydHkiLCJmaWx0ZXJWYWx1ZSIsInNldE1pbiIsInNldE1heCIsIm9iaiIsIlN0cmluZyIsImlucHV0TW9kZSIsIm5leHQiLCJTZWxlY3RGaWx0ZXJXaXRoUGxhY2Vob2xkZXIiLCJ0bCIsImF2YWlsYWJsZVZhbHVlcyIsImRlZmF1bHRWYWx1ZSIsImN1cnJlbnRWYWx1ZSIsInNlbGVjdGVkIiwiZm9ybWF0RGF0ZSIsImdldFJvb3RQYXRoIiwibG9jYXRpb24iLCJwYXRobmFtZSIsInBhcnRzIiwic3BsaXQiLCJidWlsZFJlY29yZFNob3dIcmVmIiwiVXNlclNob3ciLCJyZWxhdGVkIiwic2V0UmVsYXRlZCIsInJlbGF0ZWRMb2FkaW5nIiwic2V0UmVsYXRlZExvYWRpbmciLCJhZG1pblN0YXR1cyIsInNldEFkbWluU3RhdHVzIiwiYWRtaW5Ob3RlcyIsInNldEFkbWluTm90ZXMiLCJzYXZpbmdNZXRhIiwic2V0U2F2aW5nTWV0YSIsIm5leHRTdGF0dXMiLCJuZXh0Tm90ZXMiLCJzZWxlY3RlZFN0YXR1c09wdGlvbiIsImxhc3RPcmRlclRleHQiLCJsYXN0T3JkZXJEYXRlIiwic3RhdHVzQmFkZ2VTdHlsZSIsImlzRGlydHkiLCJiYXNlU3RhdHVzIiwiYmFzZU5vdGVzIiwiaGFuZGxlU2F2ZU1ldGEiLCJmbGV4V3JhcCIsInRvdGFsT3JkZXJzIiwibGlmZXRpbWVWYWx1ZSIsImF2ZXJhZ2VPcmRlclZhbHVlIiwib3JkZXJzIiwib3JkZXIiLCJocmVmIiwicmV2aWV3cyIsInJldmlldyIsInByb2R1Y3RJZCIsInByb2R1Y3ROYW1lIiwicmF0aW5nIiwid2hpdGVTcGFjZSIsIm92ZXJmbG93IiwidGV4dE92ZXJmbG93IiwiY29tbWVudCIsIndpc2hsaXN0IiwicmVjZW50bHlWaWV3ZWQiLCJidWlsZFVzZXJTaG93SHJlZiIsInVzZXJJZCIsImJ1aWxkVXNlckxpc3RIcmVmIiwiZmlsdGVycyIsInJvb3QiLCJVUkxTZWFyY2hQYXJhbXMiLCJPYmplY3QiLCJzZXQiLCJ0b1N0cmluZyIsIlVzZXJzVGFibGUiLCJ1c2VycyIsInNob3dMYXN0T3JkZXIiLCJzaG93THR2IiwidXNlciIsImVtYWlsIiwibGFzdE9yZGVyQXQiLCJVc2VyU2VnbWVudHMiLCJyZXNvdXJjZUFjdGlvbiIsInByZXZpZXdMaW1pdFRleHQiLCJsaW1pdCIsImNvbmZpZyIsInByZXZpZXdMaW1pdCIsImNvdW50cyIsInN1YnNjcmliZWQiLCJsaXN0cyIsInZlcmlmaWVkIiwiZW1haWxWZXJpZmllZCIsInVudmVyaWZpZWQiLCJoaWdoU3BlbmRlck1pbkx0diIsImhpZ2hTcGVuZGVycyIsImRheXMiLCJpbmFjdGl2ZURheXMiLCJpbmFjdGl2ZSIsInRvTG9jYWxJbnB1dFZhbHVlIiwiZCIsInBhZCIsIm4iLCJwYWRTdGFydCIsImdldEZ1bGxZZWFyIiwiZ2V0TW9udGgiLCJnZXREYXRlIiwiZ2V0SG91cnMiLCJnZXRNaW51dGVzIiwiUHJvZHVjdFNjaGVkdWxlRGlzY291bnRBY3Rpb24iLCJwcm9kdWN0U2x1ZyIsInNsdWciLCJwcm9kdWN0U3RhdHVzIiwiYmFzZVByaWNlIiwiaW5pdGlhbERpc2NvdW50UHJpY2UiLCJkaXNjb3VudFByaWNlIiwiaW5pdGlhbFN0YXJ0IiwiZGlzY291bnRTdGFydEF0IiwiaW5pdGlhbEVuZCIsImRpc2NvdW50RW5kQXQiLCJzZXREaXNjb3VudFByaWNlIiwic2V0RGlzY291bnRTdGFydEF0Iiwic2V0RGlzY291bnRFbmRBdCIsImNsaWVudFZhbGlkYXRpb25FcnJvciIsImhhc1dpbmRvdyIsInN0YXJ0IiwiZW5kIiwiZ2V0VGltZSIsImN1cnJlbnRTdW1tYXJ5IiwiZHAiLCJ0b0lTT1N0cmluZyIsInN0ZXAiLCJQcm9kdWN0TmFtZUxpc3QiLCJpbWFnZVVybCIsImZsZXhTaHJpbmsiLCJzcmMiLCJhbHQiLCJvYmplY3RGaXQiLCJhY3Rpb25CdXR0b25TdHlsZSIsImJ1aWxkTGlzdEhyZWYiLCJxdWVyeSIsImRheXNBZ29Jc28iLCJub3ciLCJQcm9kdWN0TGlzdCIsInZpZXdzIiwiaW5TdG9jayIsInN0b2NrIiwibm90IiwiZXF1YWxzIiwidXBkYXRlZEF0IiwidmlldyIsIk9yaWdpbmFsTGlzdCIsIkRFRkFVTFRfTE9DQUxFIiwidW5hdmFpbGFibGUiLCJQcm9kdWN0QWN0aXZpdHlUaW1lbGluZSIsImFjdGlvbk5hbWVPdmVycmlkZSIsInRpdGxlT3ZlcnJpZGUiLCJzZXRVbmF2YWlsYWJsZSIsImV4dHJhY3RlZCIsInJlbmRlckVudHJ5VGl0bGUiLCJmaWVsZExhYmVsIiwiZmllbGQiLCJyZW5kZXJFbnRyeUJvZHkiLCJmcm9tVmFsdWUiLCJ0b1ZhbHVlIiwibm9ybWFsaXplTnVtYmVyUGFyYW0iLCJ0b051bWJlciIsInJlc29sdmVTdG9yZWZyb250TG9jYWxlIiwiYWRtaW5Mb2NhbGUiLCJidWlsZFByZXZpZXdQYXRoIiwibG9jYWxlIiwiZnVsbFNsdWciLCJiYXNlUGF0aCIsIlByb2R1Y3RTaG93IiwiaTE4biIsInN0b3JlZnJvbnRMb2NhbGUiLCJsYW5ndWFnZSIsInByZXZpZXdQYXRoIiwicHJldmlld0Jhc2VVcmwiLCJjdXN0b20iLCJmYWxsYmFja0Jhc2VVcmwiLCJvcmlnaW4iLCJyZXNvbHZlZEJhc2VVcmwiLCJwcmV2aWV3VXJsIiwiVVJMIiwiaXNPcGVuIiwic2V0SXNPcGVuIiwic2FuaXRpemVkUmVjb3JkIiwiZGlzY291bnRSYXciLCJub3JtYWxpemVkRGlzY291bnQiLCJudW1lcmljS2V5cyIsImZvckVhY2giLCJvcGVuSW1hZ2UiLCJzdG9wUHJvcGFnYXRpb24iLCJvcGVuUHJldmlldyIsIm9wZW4iLCJjb252ZXJzaW9uVGV4dCIsInJlY2VudGx5Vmlld2VkQ291bnQiLCJjb252ZXJzaW9uUHJveHkiLCJNb2RhbCIsIm9uQ2xvc2UiLCJvbk92ZXJsYXlDbGljayIsInBhZGRpbmdUb3AiLCJtYXhIZWlnaHQiLCJhbGwiLCJmbGV4Iiwid2lzaGxpc3RDb3VudCIsIml0ZW1zU29sZCIsInJldmVudWUiLCJwYWlkT3JkZXJDb3VudCIsIm9yZGVySXRlbXMiLCJvcmRlclN0YXR1cyIsImxpbmVUb3RhbCIsInVzZXJOYW1lIiwiX2V4dGVuZHMiLCJwYXJzZVZhbHVlcyIsInZhbHVlVGV4dCIsIlNldCIsImJ1aWxkU2lnbmF0dXJlIiwic2xpY2UiLCJzb3J0IiwiYSIsImIiLCJhdHRyaWJ1dGVJZCIsImxvY2FsZUNvbXBhcmUiLCJqb2luIiwic2FuaXRpemVTa3VQYXJ0IiwicmVwbGFjZSIsInRvVXBwZXJDYXNlIiwiYnVpbGRTa3UiLCJiYXNlU2t1IiwiYmFzZSIsInN1ZmZpeCIsImJ1aWxkQ29tYmluYXRpb25zIiwiYXR0cmlidXRlcyIsImF0dHIiLCJlbmFibGVkIiwiY29tYm9zIiwidmFsdWVzIiwiZmxhdE1hcCIsImNvbWJvIiwiUHJvZHVjdFZhcmlhbnRNYXRyaXgiLCJsb2FkRXJyb3IiLCJzZXRMb2FkRXJyb3IiLCJzZXRBdHRyaWJ1dGVzIiwidmFyaWFudHMiLCJzZXRWYXJpYW50cyIsInByb2R1Y3QiLCJzZXRQcm9kdWN0IiwidmFsdWVzQnlBdHRyaWJ1dGUiLCJhdHRyaWJ1dGVWYWx1ZXMiLCJyZWR1Y2UiLCJhY2MiLCJoYXMiLCJnZXQiLCJwdXNoIiwiTWFwIiwibmV4dEF0dHJpYnV0ZXMiLCJpZHgiLCJzb3J0T3B0aW9ucyIsIm5leHRWYXJpYW50cyIsInNpZ25hdHVyZSIsInNrdSIsImF0dHJpYnV0ZU9yZGVyIiwib3JkZXJlZEF0dHJpYnV0ZXMiLCJ2YXJpYW50c0J5U2lnbmF0dXJlIiwiaGFuZGxlVG9nZ2xlQXR0cmlidXRlIiwicHJldiIsImhhbmRsZUF0dHJpYnV0ZVZhbHVlc0NoYW5nZSIsImhhbmRsZUdlbmVyYXRlIiwicHJvZHVjdENvZGUiLCJleGlzdGluZyIsImhhbmRsZVZhcmlhbnRDaGFuZ2UiLCJwYXlsb2FkQXR0cmlidXRlcyIsInBheWxvYWRWYXJpYW50cyIsImhhc1ZhcmlhbnRzIiwiRnJhZ21lbnQiLCJ1bml0Iiwib3B0IiwiZG93bmxvYWRUZXh0IiwiY29udGVudCIsImZpbGVuYW1lIiwiYmxvYiIsIkJsb2IiLCJ1cmwiLCJjcmVhdGVPYmplY3RVUkwiLCJsaW5rIiwiZG9jdW1lbnQiLCJkb3dubG9hZCIsImJvZHkiLCJhcHBlbmRDaGlsZCIsImNsaWNrIiwicmVtb3ZlIiwicmV2b2tlT2JqZWN0VVJMIiwiUHJvZHVjdENzdkltcG9ydEV4cG9ydEFjdGlvbiIsImNzdlRleHQiLCJzZXRDc3ZUZXh0IiwiZHJ5UnVuIiwic2V0RHJ5UnVuIiwicmVzdWx0cyIsInNldFJlc3VsdHMiLCJzdW1tYXJ5IiwiY3JlYXRlZCIsInIiLCJ1cGRhdGVkIiwiZXJyb3JzIiwiZm9ybWF0U3RhdHVzIiwiaGFuZGxlRmlsZSIsImZpbGUiLCJyZWFkZXIiLCJGaWxlUmVhZGVyIiwib25sb2FkIiwicmVzdWx0IiwicmVhZEFzVGV4dCIsImhhbmRsZUV4cG9ydCIsImNzdiIsImhhbmRsZUltcG9ydCIsImFjY2VwdCIsImZpbGVzIiwicm93IiwicGFyc2VDc3ZUYWdzIiwidGFnIiwidG9Mb3dlckNhc2UiLCJ0b0NzdiIsInYiLCJQcm9kdWN0VGFnc0VkaXQiLCJmbGF0IiwiaW5pdGlhbCIsInRleHQiLCJzZXRUZXh0IiwibmV4dFRleHQiLCJoaW50S2V5QnlQcm9wZXJ0eSIsIm1ldGFUaXRsZSIsIm1ldGFEZXNjcmlwdGlvbiIsImNhbm9uaWNhbFVybCIsIm9wZW5HcmFwaEltYWdlIiwiY2F0ZWdvcnlOYW1lIiwic3ViY2F0ZWdvcnlOYW1lIiwiYnJhbmQiLCJjYXRlZ29yeSIsInRhZ3MiLCJsb29rc0xpa2VUcmFuc2xhdGlvbktleSIsInN0YXJ0c1dpdGgiLCJQcm9kdWN0VmFsaWRhdGlvbkVycm9yU3VtbWFyeSIsImVyciIsImNvdW50IiwicHJvcGVydHlQYXRoIiwibWVzc2FnZVRleHQiLCJoaW50S2V5IiwiUHJvZHVjdE5ldyIsIk9yaWdpbmFsTmV3IiwiUHJvZHVjdEVkaXQiLCJPcmlnaW5hbEVkaXQiLCJyZXNvbHZlUmVjb3JkSWRzIiwicmVjb3JkcyIsImZyb21Qcm9wcyIsInNlYXJjaCIsIlByb2R1Y3RCdWxrU2V0Q2F0ZWdvcnlBY3Rpb24iLCJyZWNvcmRJZHMiLCJzZXRPcHRpb25zIiwiY2F0ZWdvcnlJZCIsInNldENhdGVnb3J5SWQiLCJidWxrQWN0aW9uIiwicmVzIiwiaGFzT3B0aW9ucyIsImNhblNhdmUiLCJvIiwiUHJvZHVjdEJ1bGtTZXRCcmFuZEFjdGlvbiIsImJyYW5kSWQiLCJzZXRCcmFuZElkIiwiUHJvZHVjdEJ1bGtFZGl0VGFnc0FjdGlvbiIsIm1vZGUiLCJzZXRNb2RlIiwic2V0VGFncyIsIlByb2R1Y3RCdWxrQWRqdXN0UHJpY2VBY3Rpb24iLCJkaXJlY3Rpb24iLCJzZXREaXJlY3Rpb24iLCJraW5kIiwic2V0S2luZCIsInNldFZhbHVlIiwiYXBwbHlUb0Rpc2NvdW50Iiwic2V0QXBwbHlUb0Rpc2NvdW50IiwicGFyc2VkVmFsdWUiLCJQcm9kdWN0QnVsa1RvZ2dsZUluU3RvY2tBY3Rpb24iLCJxdWlja0FjdGlvbnMiLCJyZXNvbHZlUGF0aCIsImdsb2JhbEFueSIsInJvb3RQYXRoIiwiUkVEVVhfU1RBVEUiLCJwYXRocyIsIm5vcm1hbGl6ZWRSb290Iiwibm9ybWFsaXplZFBhdGgiLCJnb1RvIiwiYXNzaWduIiwiRGFzaGJvYXJkIiwiSDIiLCJJbGx1c3RyYXRpb24iLCJINCIsIkg1IiwibGFiZWxTdHlsZSIsImdldE1lc3NhZ2VUZXh0IiwiTG9naW4iLCJ3aW5kb3dTdGF0ZSIsIl9fQVBQX1NUQVRFX18iLCJlcnJvck1lc3NhZ2UiLCJicmFuZGluZyIsInRyYW5zbGF0ZUNvbXBvbmVudCIsInNldEVtYWlsIiwicGFzc3dvcmQiLCJzZXRQYXNzd29yZCIsImhhbmRsZUVtYWlsQ2hhbmdlIiwiaGFuZGxlUGFzc3dvcmRDaGFuZ2UiLCJtaW5IZWlnaHQiLCJtYXJnaW5Cb3R0b20iLCJsb2dvIiwiY29tcGFueU5hbWUiLCJNZXNzYWdlQm94IiwibXkiLCJyZXF1aXJlZCIsImF1dG9Db21wbGV0ZSIsIkxvZ2dlZEluIiwic2Vzc2lvbiIsInRyYW5zbGF0ZUJ1dHRvbiIsImRyb3BBY3Rpb25zIiwicHJldmVudERlZmF1bHQiLCJsb2dvdXRQYXRoIiwiQ3VycmVudFVzZXJOYXYiLCJhdmF0YXJVcmwiLCJWZXJzaW9uIiwidmVyc2lvbnMiLCJhZG1pbiIsImFwcCIsImZsZXhHcm93IiwicHkiLCJweCIsInZlcnNpb24iLCJMYW5ndWFnZVNlbGVjdCIsInN1cHBvcnRlZExuZ3NSYXciLCJzdXBwb3J0ZWRMbmdzIiwiYXZhaWxhYmxlTGFuZ3VhZ2VzIiwibGFuZyIsIkRyb3BEb3duIiwiRHJvcERvd25UcmlnZ2VyIiwiRHJvcERvd25NZW51IiwiRHJvcERvd25JdGVtIiwiY2hhbmdlTGFuZ3VhZ2UiLCJUb3BCYXIiLCJ0b2dnbGVTaWRlYmFyIiwicmVkdXhTdGF0ZSIsImhvbWVMYWJlbCIsImJvcmRlckJvdHRvbSIsImlzTmlsIiwiYXJyYXlNYXAiLCJsaXN0Q2FjaGVDbGVhciIsImVxIiwicmVxdWlyZSQkMCIsImFzc29jSW5kZXhPZiIsImxpc3RDYWNoZURlbGV0ZSIsImxpc3RDYWNoZUdldCIsImxpc3RDYWNoZUhhcyIsImxpc3RDYWNoZVNldCIsInJlcXVpcmUkJDEiLCJyZXF1aXJlJCQyIiwicmVxdWlyZSQkMyIsInJlcXVpcmUkJDQiLCJMaXN0Q2FjaGUiLCJzdGFja0NsZWFyIiwic3RhY2tEZWxldGUiLCJzdGFja0dldCIsInN0YWNrSGFzIiwiZnJlZUdsb2JhbCIsImdsb2JhbCIsIlN5bWJvbCIsIm9iamVjdFByb3RvIiwiaGFzT3duUHJvcGVydHkiLCJuYXRpdmVPYmplY3RUb1N0cmluZyIsInN5bVRvU3RyaW5nVGFnIiwiZ2V0UmF3VGFnIiwib2JqZWN0VG9TdHJpbmciLCJiYXNlR2V0VGFnIiwiaXNPYmplY3QiLCJmdW5jVGFnIiwiaXNGdW5jdGlvbiIsImNvcmVKc0RhdGEiLCJpc01hc2tlZCIsImZ1bmNQcm90byIsImZ1bmNUb1N0cmluZyIsInRvU291cmNlIiwiYmFzZUlzTmF0aXZlIiwiZ2V0VmFsdWUiLCJnZXROYXRpdmUiLCJuYXRpdmVDcmVhdGUiLCJoYXNoQ2xlYXIiLCJoYXNoRGVsZXRlIiwiSEFTSF9VTkRFRklORUQiLCJoYXNoR2V0IiwiaGFzaEhhcyIsImhhc2hTZXQiLCJIYXNoIiwibWFwQ2FjaGVDbGVhciIsImlzS2V5YWJsZSIsImdldE1hcERhdGEiLCJtYXBDYWNoZURlbGV0ZSIsIm1hcENhY2hlR2V0IiwibWFwQ2FjaGVIYXMiLCJtYXBDYWNoZVNldCIsIk1hcENhY2hlIiwic3RhY2tTZXQiLCJyZXF1aXJlJCQ1IiwiU3RhY2siLCJzZXRDYWNoZUFkZCIsInNldENhY2hlSGFzIiwiU2V0Q2FjaGUiLCJhcnJheVNvbWUiLCJjYWNoZUhhcyIsIkNPTVBBUkVfUEFSVElBTF9GTEFHIiwiQ09NUEFSRV9VTk9SREVSRURfRkxBRyIsImVxdWFsQXJyYXlzIiwiVWludDhBcnJheSIsIm1hcFRvQXJyYXkiLCJzZXRUb0FycmF5IiwiYm9vbFRhZyIsImRhdGVUYWciLCJlcnJvclRhZyIsIm1hcFRhZyIsIm51bWJlclRhZyIsInJlZ2V4cFRhZyIsInNldFRhZyIsInN0cmluZ1RhZyIsInN5bWJvbFRhZyIsImFycmF5QnVmZmVyVGFnIiwiZGF0YVZpZXdUYWciLCJzeW1ib2xQcm90byIsImVxdWFsQnlUYWciLCJhcnJheVB1c2giLCJiYXNlR2V0QWxsS2V5cyIsImFycmF5RmlsdGVyIiwic3R1YkFycmF5IiwicHJvcGVydHlJc0VudW1lcmFibGUiLCJuYXRpdmVHZXRTeW1ib2xzIiwiZ2V0U3ltYm9scyIsImJhc2VUaW1lcyIsImlzT2JqZWN0TGlrZSIsImFyZ3NUYWciLCJiYXNlSXNBcmd1bWVudHMiLCJpc0FyZ3VtZW50cyIsImV4cG9ydHMiLCJNQVhfU0FGRV9JTlRFR0VSIiwiaXNJbmRleCIsImlzTGVuZ3RoIiwiYXJyYXlUYWciLCJvYmplY3RUYWciLCJ3ZWFrTWFwVGFnIiwiYmFzZUlzVHlwZWRBcnJheSIsImJhc2VVbmFyeSIsImlzVHlwZWRBcnJheSIsImlzQnVmZmVyIiwiYXJyYXlMaWtlS2V5cyIsImlzUHJvdG90eXBlIiwib3ZlckFyZyIsIm5hdGl2ZUtleXMiLCJiYXNlS2V5cyIsImlzQXJyYXlMaWtlIiwia2V5cyIsImdldEFsbEtleXMiLCJlcXVhbE9iamVjdHMiLCJEYXRhVmlldyIsIlByb21pc2UiLCJXZWFrTWFwIiwicmVxdWlyZSQkNiIsImdldFRhZyIsInJlcXVpcmUkJDciLCJiYXNlSXNFcXVhbERlZXAiLCJiYXNlSXNFcXVhbCIsImJhc2VJc01hdGNoIiwiaXNTdHJpY3RDb21wYXJhYmxlIiwiZ2V0TWF0Y2hEYXRhIiwibWF0Y2hlc1N0cmljdENvbXBhcmFibGUiLCJiYXNlTWF0Y2hlcyIsImlzU3ltYm9sIiwiaXNLZXkiLCJtZW1vaXplIiwibWVtb2l6ZUNhcHBlZCIsInN0cmluZ1RvUGF0aCIsImJhc2VUb1N0cmluZyIsImNhc3RQYXRoIiwidG9LZXkiLCJiYXNlR2V0IiwiYmFzZUhhc0luIiwiaGFzUGF0aCIsImhhc0luIiwiYmFzZU1hdGNoZXNQcm9wZXJ0eSIsImlkZW50aXR5IiwiYmFzZVByb3BlcnR5IiwiYmFzZVByb3BlcnR5RGVlcCIsImJhc2VJdGVyYXRlZSIsImRlZmluZVByb3BlcnR5IiwiYmFzZUFzc2lnblZhbHVlIiwiYXNzaWduVmFsdWUiLCJiYXNlU2V0IiwiYmFzZVBpY2tCeSIsImdldFByb3RvdHlwZSIsImdldFN5bWJvbHNJbiIsIm5hdGl2ZUtleXNJbiIsImJhc2VLZXlzSW4iLCJrZXlzSW4iLCJnZXRBbGxLZXlzSW4iLCJwaWNrQnkiLCJGaWx0ZXJEcmF3ZXIiLCJwcm9wZXJ0aWVzIiwiZmlsdGVyUHJvcGVydGllcyIsInNldEZpbHRlciIsImluaXRpYWxMb2FkIiwiaXNWaXNpYmxlIiwidG9nZ2xlRmlsdGVyIiwidXNlRmlsdGVyRHJhd2VyIiwic3RvcmVQYXJhbXMiLCJjbGVhclBhcmFtcyIsInVzZVF1ZXJ5UGFyYW1zIiwicGFnZSIsImhhbmRsZVJlc2V0IiwiaGFuZGxlQ2hhbmdlIiwicHJvcGVydHlPclJlY29yZCIsIkVycm9yIiwiZ2V0UmVzb3VyY2VFbGVtZW50Q3NzIiwiY29udGVudFRhZyIsImNzc0NvbnRlbnQiLCJjc3NGb290ZXIiLCJjc3NCdXR0b25BcHBseSIsImNzc0J1dHRvblJlc2V0Iiwicm9sZSIsInRhYkluZGV4IiwiRHJhd2VyIiwiaXNIaWRkZW4iLCJvblN1Ym1pdCIsIm9uUmVzZXQiLCJEcmF3ZXJDb250ZW50IiwiSDMiLCJyb3VuZGVkIiwiQmFzZVByb3BlcnR5Q29tcG9uZW50Iiwid2hlcmUiLCJEcmF3ZXJGb290ZXIiLCJBZG1pbkpTIiwiVXNlckNvbXBvbmVudHMiXSwibWFwcGluZ3MiOiI7OztDQU9BLE1BQU1BLEtBQUcsR0FBRyxJQUFJQyxpQkFBUyxFQUFFO0NBRTNCLE1BQU1DLFFBQXVCLEdBQUcsQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDO0NBRXpFLFNBQVNDLGlCQUFpQkEsQ0FBQztHQUFFQyxNQUFNO0dBQUVDLE1BQU07Q0FBRUMsRUFBQUE7Q0FBc0IsQ0FBQyxFQUFFO0dBQ3BGLE1BQU0sQ0FBQ0MsV0FBVyxFQUFFQyxjQUFjLENBQUMsR0FBR0MsY0FBUSxDQUFDSixNQUFNLENBQUM7Q0FDdEQsRUFBQSxNQUFNLENBQUNLLGNBQWMsRUFBRUMsaUJBQWlCLENBQUMsR0FBR0YsY0FBUSxDQUNsREosTUFBTSxFQUFFTyxNQUFNLENB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QUdBLDRCQUE0QjtDQUVsRjRRLE9BQU8sQ0FBQ0MsY0FBYyxDQUFDcFEsOEJBQThCLEdBQUdBLDhCQUE4QjtDQUV0Rm1RLE9BQU8sQ0FBQ0MsY0FBYyxDQUFDelAsU0FBUyxHQUFHQSxTQUFTO0NBRTVDd1AsT0FBTyxDQUFDQyxjQUFjLENBQUNsUCxLQUFLLEdBQUdBLEtBQUs7Q0FFcENpUCxPQUFPLENBQUNDLGNBQWMsQ0FBQy9OLFFBQVEsR0FBR0EsUUFBUTtDQUUxQzhOLE9BQU8sQ0FBQ0MsY0FBYyxDQUFDck0sTUFBTSxHQUFHQSxNQUFNO0NBRXRDb00sT0FBTyxDQUFDQyxjQUFjLENBQUNuQyxZQUFZLEdBQUdBLFlBQVk7Ozs7OzsiLCJ4X2dvb2dsZV9pZ25vcmVMaXN0IjpbMzIsMzMsMzQsMzUsMzYsMzcsMzgsMzksNDAsNDEsNDIsNDMsNDQsNDUsNDYsNDcsNDgsNDksNTAsNTEsNTIsNTMsNTQsNTUsNTYsNTcsNTgsNTksNjAsNjEsNjIsNjMsNjQsNjUsNjYsNjcsNjgsNjksNzAsNzEsNzIsNzMsNzQsNzUsNzYsNzcsNzgsNzksODAsODEsODIsODMsODQsODUsODYsODcsODgsODksOTAsOTEsOTIsOTMsOTQsOTUsOTYsOTcsOTgsOTksMTAwLDEwMSwxMDIsMTAzLDEwNCwxMDUsMTA2LDEwNywxMDgsMTA5LDExMCwxMTEsMTEyLDExMywxMTQsMTE1LDExNiwxMTcsMTE4LDExOSwxMjAsMTIxLDEyMiwxMjMsMTI0LDEyNSwxMjYsMTI3LDEyOCwxMjksMTMwLDEzMSwxMzIsMTMzLDEzNCwxMzUsMTM2LDEzNywxMzgsMTM5LDE0MCwxNDEsMTQyLDE0MywxNDQsMTQ1LDE0NiwxNDcsMTQ4LDE0OSwxNTAsMTUxLDE1MiwxNTMsMTU0LDE1NSwxNTYsMTU3LDE1OF19
