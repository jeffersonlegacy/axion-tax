import React from 'react';
import './MockScheduleC.css';

const MockScheduleC = ({ data, summary, taxYear }) => {
    // Format helpers
    const fmt = (val) => {
        const num = parseFloat(val);
        if (isNaN(num) || num === 0) return '';
        return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const mileageRate = taxYear === '2023' ? 0.655 : taxYear === '2024' ? 0.67 : 0.68;
    const mileageExp = fmt((parseFloat(data.businessMiles) || 0) * mileageRate);

    return (
        <div className="mock-schedule-c-container fade-in">
            <div className="form-header">
                <div className="form-title-block">
                    <h2>SCHEDULE C<br />(Form 1040)</h2>
                </div>
                <div className="form-desc-block">
                    <h3>Profit or Loss From Business</h3>
                    <p>▶ Attach to Form 1040, 1040-SR, 1040-NR, or 1041; partnerships generally must attach to Form 1065.</p>
                    <p>▶ Go to <i>www.irs.gov/ScheduleC</i> for instructions and the latest information.</p>
                </div>
                <div className="form-year-block">
                    <span className="omb">OMB No. 1545-0074</span>
                    <span className="year">{taxYear}</span>
                    <span className="seq">Attachment<br />Sequence No. 09</span>
                </div>
            </div>

            <div className="form-section-title">
                <span className="part-label">Part I</span> Income
            </div>
            <div className="form-grid">
                <div className="row">
                    <span className="line-num">1</span>
                    <span className="line-desc">Gross receipts or sales. See instructions for line 1 and check the box if this income was reported to you on Form W-2...</span>
                    <span className="line-val-box val-box-right">{fmt(data.grossReceipts)}</span>
                </div>
                <div className="row">
                    <span className="line-num">2</span>
                    <span className="line-desc">Returns and allowances</span>
                    <span className="line-val-box val-box-right">{fmt(data.returnsAllowances)}</span>
                </div>
                <div className="row highlight-row">
                    <span className="line-num">3</span>
                    <span className="line-desc">Subtract line 2 from line 1</span>
                    <span className="line-val-box val-box-right">{fmt(summary.gross)}</span>
                </div>
            </div>

            <div className="form-section-title" style={{ marginTop: '1rem' }}>
                <span className="part-label">Part II</span> Expenses
            </div>
            <div className="form-grid">
                <div className="row cols-split">
                    <div className="col-left">
                        <span className="line-num">8</span> <span className="line-desc">Advertising</span>
                        <span className="line-val-box">{fmt(data.advertising)}</span>
                    </div>
                    <div className="col-right">
                        <span className="line-num">18</span> <span className="line-desc">Office expense</span>
                        <span className="line-val-box">{fmt(data.officeSupplies)}</span>
                    </div>
                </div>
                <div className="row cols-split">
                    <div className="col-left">
                        <span className="line-num">9</span> <span className="line-desc">Car and truck expenses</span>
                        <span className="line-val-box">{mileageExp}</span>
                    </div>
                    <div className="col-right">
                        <span className="line-num">20a</span> <span className="line-desc">Rent/Lease</span>
                        <span className="line-val-box">{fmt(data.rentLease)}</span>
                    </div>
                </div>
                <div className="row cols-split">
                    <div className="col-left">
                        <span className="line-num">11</span> <span className="line-desc">Contract labor</span>
                        <span className="line-val-box">{fmt(data.contractLabor)}</span>
                    </div>
                    <div className="col-right">
                        <span className="line-num">21</span> <span className="line-desc">Repairs and maintenance</span>
                        <span className="line-val-box">{fmt(data.repairs)}</span>
                    </div>
                </div>
                <div className="row cols-split">
                    <div className="col-left">
                        <span className="line-num">15</span> <span className="line-desc">Insurance</span>
                        <span className="line-val-box">{fmt(data.insurance)}</span>
                    </div>
                    <div className="col-right">
                        <span className="line-num">23</span> <span className="line-desc">Taxes and licenses</span>
                        <span className="line-val-box">{fmt(data.taxesLicenses)}</span>
                    </div>
                </div>
                <div className="row cols-split">
                    <div className="col-left">
                        <span className="line-num">17</span> <span className="line-desc">Legal and prof. services</span>
                        <span className="line-val-box">{fmt(data.legalProfessional)}</span>
                    </div>
                    <div className="col-right">
                        <span className="line-num">24a</span> <span className="line-desc">Travel & Meals</span>
                        <span className="line-val-box">{fmt((parseFloat(data.travel) || 0) + (parseFloat(data.meals) || 0))}</span>
                    </div>
                </div>

                <div className="row">
                    <span className="line-num">27a</span>
                    <span className="line-desc">Other expenses (from line 48)</span>
                    <span className="line-val-box val-box-right">{fmt((parseFloat(data.phoneInternet) || 0) + (parseFloat(data.otherExpenses) || 0))}</span>
                </div>

                <div className="row highlight-row" style={{ marginTop: '0.5rem', borderTop: '2px solid #000' }}>
                    <span className="line-num">28</span>
                    <span className="line-desc">Total expenses before expenses for business use of home.</span>
                    <span className="line-val-box val-box-right">{fmt(summary.expenses)}</span>
                </div>

                <div className="row highlight-row">
                    <span className="line-num">31</span>
                    <span className="line-desc"><strong>Net profit or (loss).</strong> Subtract line 30 from line 29.</span>
                    <span className="line-val-box val-box-right" style={{ color: summary.net < 0 ? 'red' : 'inherit' }}>{fmt(summary.net)}</span>
                </div>
            </div>

            <div className="mock-footer">
                <p>This is a simulated preview, not an official IRS submission. Your Axion agent will verify all calculations.</p>
            </div>
        </div>
    );
};

export default MockScheduleC;
