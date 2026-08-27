const styles = {
  container: {
    padding: '24px 32px',
    maxWidth: '960px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    fontFamily:
      '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
    color: '#323130',
    fontSize: '13px',
    lineHeight: '1.6'
  },

  backButton: {
    background: 'none',
    border: 'none',
    color: '#0078d4',
    cursor: 'pointer',
    padding: 0,
    marginBottom: '16px',
    fontSize: '13px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px'
  },

  title: {
    marginTop: 0,
    marginBottom: '8px',
    fontSize: '20px',
    fontWeight: 600,
    color: '#1b1b1b'
  },

  description: {
    color: '#605e5c',
    marginBottom: '20px',
    fontSize: '13px'
  },

  tabBar: {
    display: 'flex',
    borderBottom: '1px solid #e1dfdd',
    marginBottom: '24px'
  },

  tabButton: (isActive: boolean) => ({
    padding: '8px 16px',
    border: 'none',
    background: 'none',
    fontSize: '13px',
    fontWeight: isActive ? 600 : 400,
    color: isActive ? '#0078d4' : '#323130',
    borderBottom: isActive
      ? '2px solid #0078d4'
      : '2px solid transparent',
    cursor: 'pointer',
    marginBottom: '-1px'
  }),

  sectionContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px'
  },

  managementSection: {
    border: '1px solid #e1dfdd',
    borderRadius: '2px',
    padding: '20px 24px',
    backgroundColor: '#ffffff'
  },

  managementSectionTitle: {
    margin: 0,
    marginBottom: '16px',
    fontSize: '16px',
    fontWeight: 600,
    color: '#1b1b1b'
  },

  managementItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px'
  },

  managementItemLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
    color: '#323130',
    fontWeight: 600
  },

  inputSelect: {
    width: '100%',
    maxWidth: '480px',
    height: '32px',
    padding: '0 8px',
    border: '1px solid #605e5c',
    borderRadius: '2px',
    backgroundColor: '#ffffff',
    fontSize: '13px',
    color: '#323130',
    outline: 'none'
  },

  primaryButton: {
    height: '32px',
    padding: '0 16px',
    backgroundColor: '#0078d4',
    color: '#ffffff',
    border: 'none',
    borderRadius: '2px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer'
  },

  secondaryButton: {
    height: '32px',
    padding: '0 16px',
    backgroundColor: '#ffffff',
    color: '#323130',
    border: '1px solid #8a8886',
    borderRadius: '2px',
    fontSize: '13px',
    cursor: 'pointer'
  },

  dangerButton: {
    height: '32px',
    padding: '0 16px',
    backgroundColor: '#a80000',
    color: '#ffffff',
    border: 'none',
    borderRadius: '2px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer'
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    textAlign: 'left' as const,
    fontSize: '13px',
    border: '1px solid #e1dfdd'
  },

  th: {
    backgroundColor: '#faf9f8',
    padding: '10px 12px',
    fontWeight: 600,
    color: '#323130',
    borderBottom: '1px solid #e1dfdd',
    fontSize: '12px'
  },

  td: {
    padding: '10px 12px',
    borderBottom: '1px solid #edebe9',
    verticalAlign: 'middle'
  },

  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },

  modalContainer: {
    backgroundColor: '#ffffff',
    padding: '24px',
    width: '100%',
    maxWidth: '480px',
    border: '1px solid #8a8886',
    boxShadow:
      '0 6.4px 14.4px 0 rgba(0, 0, 0, 0.132), 0 1.2px 3.6px 0 rgba(0, 0, 0, 0.108)'
  },

  inputField: {
    width: '100%',
    height: '32px',
    padding: '0 8px',
    border: '1px solid #605e5c',
    borderRadius: '2px',
    fontSize: '13px',
    outline: 'none',
    marginTop: '4px',
    boxSizing: 'border-box' as const
  }
};

export default styles;