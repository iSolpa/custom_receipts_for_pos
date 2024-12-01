/** @odoo-module */
import { OrderReceipt } from "@point_of_sale/app/screens/receipt_screen/receipt/order_receipt";
import { patch } from "@web/core/utils/patch";
import { useState, Component, xml } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

patch(OrderReceipt.prototype, {
    setup() {
        super.setup();
        // Initialize state if it doesn't exist
        if (!this.state) {
            this.state = useState({
                template: true,
            });
        } else {
            // Ensure template property exists in state
            this.state = useState({
                ...this.state,
                template: true,
            });
        }
        
        // Only set pos if it hasn't been set
        if (!this.pos) {
            this.pos = useState(useService("pos"));
        }
    },
    get templateProps() {
        // Get props from super if it exists
        const baseProps = super.templateProps || {};
        
        // Create our props
        const ourProps = {
            data: this.props.data,
            order: this.pos.orders,
            receipt: this.pos.get_order().export_for_printing(),
            orderlines: this.pos.get_order().get_orderlines(),
            paymentlines: this.pos.get_order().get_paymentlines()
        };
    
        // Merge props, preserving any existing data
        return {
            ...baseProps,
            ...ourProps,
            // If receipt exists in both, merge them
            receipt: {
                ...(baseProps.receipt || {}),
                ...(ourProps.receipt || {})
            }
        };
    },
    get templateComponent() {
        var mainRef = this;
        return class extends Component {
            setup() {}
            static template = xml`${mainRef.pos.config.design_receipt}`
        };
    },
    get isTrue() {
        if (this.env.services.pos.config.is_custom_receipt == false) {
            return true;
        }
        return false;
    }
});
