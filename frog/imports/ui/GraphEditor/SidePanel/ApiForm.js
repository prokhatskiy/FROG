// @flow

import React, { Component } from 'react';
import { hideConditional } from 'frog-utils';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';

import { activityTypesObj } from '/imports/activityTypes';
import validateConfig from '/imports/api/validateConfig';
import { ShowErrorsRaw, ValidButtonRaw } from '../Validator';
import ConfigForm from './ConfigForm';
import { ChooseActivityType } from './ActivityPanel/ChooseActivity';

class Config extends Component {
  state: { formData: Object };
  aT: any;

  constructor(props: { activity: Object, setValid: Function }) {
    super(props);
    this.state = {
      formData: this.props.config || {}
    };
    this.aT = activityTypesObj[this.props.activity.activityType];
  }

  componentDidMount() {
    this.check();
  }

  check = () => {
    const valid = validateConfig(
      'activity',
      '1',
      hideConditional(this.state.formData, this.aT.config, this.aT.configUI),
      this.aT.config,
      this.aT.validateConfig,
      this.aT.configUI
    );
    this.props.setValid(valid);
  };
  render() {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div>
          <ConfigForm
            node={this.props.activity}
            onChange={e => {
              this.setState({ formData: e.formData });
              this.check();
            }}
            nodeType={this.aT}
            valid={{ social: [] }}
          />
        </div>
      </div>
    );
  }
}

type PropsT = { activityType?: string, config?: Object };

class State {
  @observable showErrors: boolean = false;
  @observable valid: Object[] = [];
  setShow = action(e => {
    this.showErrors = e;
  });
  setValid = action(e => (this.valid = e));
}

const state = new State();

@observer
class ApiForm extends Component {
  props: PropsT;

  state: {
    activity: {
      id: string,
      activityType?: string
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      activity: {
        id: '1',
        activityType: this.props.activityType,
        data: this.props.config || {}
      }
    };
  }

  render() {
    return (
      <div style={{ transform: 'translateY(50px)', margin: '10px' }}>
        {this.state.activity.activityType ? (
          <div>
            <Valid />
            <Config activity={this.state.activity} setValid={state.setValid} />
          </div>
        ) : (
          <ChooseActivityType
            activity={this.state.activity}
            onSelect={e =>
              this.setState({
                activity: { id: '1', activityType: e.id, config: {} }
              })
            }
          />
        )};
      </div>
    );
  }
}

@observer
class Valid extends Component {
  render() {
    return (
      <ValidButtonRaw
        setShowErrors={state.setShow}
        errorColor={state.valid.length > 0 ? 'red' : 'green'}
      />
    );
  }
}

@observer
class Errors extends Component {
  render() {
    if (state.showErrors) {
      return (
        <div style={{ position: 'absolute', top: 20, left: -40 }}>
          <ShowErrorsRaw errors={state.valid} />
        </div>
      );
    } else {
      return null;
    }
  }
}

const Container = (props: PropsT) => (
  <div>
    <Errors />
    <ApiForm {...props} />
  </div>
);

export default Container;
