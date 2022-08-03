import {SEC_PER_BLOCK, thorToFloat} from "@/helpers/THORUtil";

export class NodeInfo {
    constructor(node) {
        if (!node) {
            node = {
                status: 'Unknown',
                jail: {},
                bond_providers: {},
                preflight_status: {},
            }
        }

        this.address = node.node_address
        this.status = node.status
        this.bond = thorToFloat(node.bond)
        this.height = +node.active_block_height
        this.bondAddress = node.bond_address
        this.statusSince = +node.status_since
        this.requestedToLeave = !!node.requested_to_leave
        this.forcedtoLeave = !!node.forced_to_leave
        this.leaveHeight = +node.leave_height
        this.IPAddress = node.ip_address
        this.version = node.version
        this.slashPoints = +node.slash_points
        this.jail = {
            address: node.jail.node_address,
            releaseHeight: +node.jail.release_height,
            reason: node.jail.reason,
        }
        this.currentAward = thorToFloat(node.current_award)

        this.observeChains = {}
        if (node.observe_chains) {
            for (let {chain, height} of node.observe_chains) {
                this.observeChains[chain] = +height
            }
        }

        this.preflightStatus = {
            status: node.preflight_status.status,
            reason: node.preflight_status.reason,
            code: +node.preflight_status.code
        }

        this.bondProviders = {
            address: node.bond_providers.node_address,
            fee: (+node.bond_providers.node_operator_fee) / 10000.0,
            providers: []
        }

        if (node.bond_providers.providers) {
            for (let {bond_address, bond} of node.bond_providers.providers) {
                this.bondProviders.providers.push({
                    bond_address,
                    bond: thorToFloat(bond)
                })
            }
        }

        // post init
        this.ageSeconds = SEC_PER_BLOCK * this.statusSince
        this.shortAddress = this.address ? this.address.substring(this.address.length - 4) : '?'

        this.IPInfo = {
            flag: '🏳️'
        }
    }
}
