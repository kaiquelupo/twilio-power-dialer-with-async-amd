import React, { Fragment } from 'react';
import sharedTheme from '../../styling/theme';
import { withStyles } from '@material-ui/core/styles';
import CSVReader from 'react-csv-reader'
import Button from '@material-ui/core/Button';
import { Icon } from '@twilio/flex-ui';
import { request } from '../../helpers/request';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { getAttributes } from '../../helpers/configuration';
import Tooltip from '@material-ui/core/Tooltip';
import PowerDialerModal from '../PowerDialerModal';

const styles = theme => (sharedTheme(theme));

class PreviewDialer extends React.Component {

    state = { 
        contacts: [],
        campaign: { name: "Default"},
        openModal: false,
        schedule: null,
        modalMessage: "",
        loading: false
    };

    handleFile = data => {
        if(data) {
            this.setState({ 
                contacts: data 
            });
        }
    }

    handleCall = () => {

        this.setState({ loading: true });

        request("plugin/create-tasks", this.props.manager, { 
            contacts: JSON.stringify(this.state.contacts),
            campaign: this.state.campaign.name 
        }).then(() => {

            this.setState({ openModal: true, modalMessage: "All contacts were sent successfully to the Power Dialer" })

        }).catch((err) => {

            this.setState({ openModal: true, modalMessage: `Something is not right when sending the contacts to the Power Dialer. Error: ${err}` })

        }).finally(() => {

            this.setState({ loading: false });

        });
    }

    handleChange = event => {
        const campaignName = event.target.value;
        const { campaigns } = getAttributes(this.props.manager); 

        const campaign = campaigns.find(({ name }) => campaignName === name ) || {};

        this.setState({ schedule: campaign.schedule });
        this.setState({ campaign });
    }

    render() {
        const { classes, manager } = this.props;
        const disabled = this.state.contacts.length === 0;
        const numberOfContacts = this.state.contacts.length;

        const { campaigns } = getAttributes(manager); 

        return (
            <div className={classes.boxDialpad}>

                <div className={classes.titleAgentDialpad}>Power Dialer</div>

                <FormControl className={classes.formControl}>
                    
                    <div className={classes.labelBox}>
                        <div className={classes.csvLabel}>Campaign</div>
                        <Select
                            value={this.state.campaign.name}
                            onChange={this.handleChange}
                            style={{
                                width: '100%'
                            }}
                        >
                             <MenuItem value="" key="label" disabled>
                                Select a campaign (optional)
                            </MenuItem>

                            {
                                campaigns && campaigns.map(({ name }) => (
                                    <MenuItem value={name} key={`select_${name}`}>
                                        {name}
                                    </MenuItem>
                                ))
                            }
                                    
                        </Select>
                    </div>

                    <div className={classes.labelBox}>
                        <div className={classes.csvLabel}>Select CSV file</div>
                        <CSVReader 
                            onFileLoaded={this.handleFile} 
                            parserOptions={{
                                header: true,
                                skipEmptyLines: true
                            }}
                        />
                        {!disabled && <div className={classes.contactListInfo}>There {numberOfContacts === 1 ? `is ${numberOfContacts} contact` : `are ${numberOfContacts} contacts`} in this list</div>}
                        <div className={classes.buttonBoxPreviewDialer}>

                            <Tooltip title="Call now">
                                <div>
                                    {!this.state.loading ? 
                                        <Button 
                                            variant="contained" 
                                            color="primary" 
                                            disabled={disabled}
                                            onClick={this.handleCall}
                                            className={classes.previewDialerBtn}
                                        >
                                            <Icon icon="Call"/>
                                        </Button>
                                        :
                                        <div>Loading...</div>
                                    }
                                </div>
                            </Tooltip>
                        
                        </div>
                    </div>
   
                </FormControl>

                <PowerDialerModal 
                    open={this.state.openModal} 
                    message={this.state.modalMessage}
                    onClose={() => this.setState({ openModal: false })}
               />
            
            </div>
        )   
    }
}

export default withStyles(styles)(PreviewDialer);