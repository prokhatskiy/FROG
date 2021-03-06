// @flow

import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import ReactTooltip from 'react-tooltip';
import { Graphs } from '/imports/api/graphs';
import Grid from '@material-ui/core/Grid';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import { removeActivity } from '/imports/api/remoteActivities';
import { removeGraph } from '/imports/api/remoteGraphs';
import { LibraryStates } from '/imports/api/cache';

import { connect } from './store';
import Graph from './Graph';
import { RenameBox } from './Rename';
import SidePanel from './SidePanel';
import HelpModal from './HelpModal';
import ChangelogModal from './ChangelogModal';
import ModalExport from './RemoteControllers/ModalExport';
import ModalImport from './RemoteControllers/ModalImport';
import ModalDelete from './RemoteControllers/ModalDelete';

import TopPanel from './TopPanel';
import Preview from '../Preview';
import OperatorPreview from '../Preview/OperatorPreview';
import TopBar from '../App/TopBar';

const styles = () => ({
  root: {
    marginTop: '48px',
    height: 'calc(100vh - 48px)',
    overflowX: 'auto'
  },
  editor: { height: 600 },
  editorWithPanMap: { height: 150 }
});

const EditorPanel = withStyles(styles)(({ classes }) => (
  <React.Fragment>
    <div className={classes.editor}>
      <ReactTooltip delayShow={500} />
      <Graph scaled hasTimescale isEditable />
    </div>
    <RenameBox />
    <div className={classes.editorWithPanMap}>
      <Graph hasPanMap />
    </div>
  </React.Fragment>
));

type StateT = {
  exportOpen: boolean,
  importOpen: boolean,
  deleteOpen: boolean,
  locallyChanged: boolean,
  idRemove: Object
};

@connect
class Editor extends React.Component<Object, StateT> {
  constructor(props) {
    super(props);
    this.state = {
      exportOpen: false,
      importOpen: false,
      deleteOpen: false,
      locallyChanged: false,
      idRemove: {}
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.props.store.ui.updateWindow);
    this.props.store.ui.updateWindow();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.props.store.ui.updateWindow);
  }

  render() {
    const { classes, store } = this.props;
    const show = this.props.store.ui.showPreview;
    if (show && show.activityTypeId) {
      return (
        <Preview
          modal
          activityTypeId={show.activityTypeId}
          config={show.config}
          dismiss={() => store.ui.setShowPreview(false)}
        />
      );
    }
    const setDelete = val => this.setState({ deleteOpen: val });
    const setIdRemove = val => this.setState({ idRemove: val });
    return (
      <div className={classes.root}>
        <TopBar />
        <Grid container>
          <Grid item xs={12}>
            <TopPanel
              openExport={() => this.setState({ exportOpen: true })}
              openImport={() => this.setState({ importOpen: true })}
              {...{
                setDelete,
                setIdRemove
              }}
            />
            <ModalExport
              exportType="graph"
              modalOpen={this.state.exportOpen}
              setModal={val => this.setState({ exportOpen: val })}
              graphId={store.graphId}
              graphName={store}
              metadatas={LibraryStates.graphList.find(
                x => x.uuid === Graphs.findOne(store.graphId).parentId
              )}
              madeChanges={() => this.setState({ locallyChanged: true })}
            />
            <ModalImport
              modalOpen={this.state.importOpen}
              setModal={val => this.setState({ importOpen: val })}
              locallyChanged={this.state.locallyChanged}
              changesLoaded={() => this.setState({ locallyChanged: true })}
            />
            <ModalDelete
              modalOpen={this.state.deleteOpen}
              setModal={setDelete}
              remove={() =>
                this.state.idRemove.type === 'graph'
                  ? removeGraph(this.state.idRemove.id)
                  : removeActivity(this.state.idRemove.id, () =>
                      this.forceUpdate()
                    )
              }
            />
          </Grid>
          <Grid item xs={12}>
            <Grid container id="graph-editor">
              <Grid item xs>
                <EditorPanel />
              </Grid>
              <SidePanel
                madeChanges={() => this.setState({ locallyChanged: true })}
                locallyChanged={this.state.locallyChanged}
                changesLoaded={() => this.setState({ locallyChanged: true })}
                {...{
                  setDelete,
                  setIdRemove
                }}
              />
            </Grid>
          </Grid>
        </Grid>
        <HelpModal
          show={store.ui.showHelpModal}
          hide={() => store.ui.setShowHelpModal(false)}
        />
        <ChangelogModal
          show={store.ui.showChangelogModal}
          hide={() => store.ui.setShowChangelogModal(false)}
        />
        {show && show.operatorTypeId && (
          <OperatorPreview
            operatorTypeId={show.operatorTypeId}
            config={show.config}
            dismiss={() => this.props.store.ui.setShowPreview(null)}
          />
        )}
      </div>
    );
  }
}

const StyledEditor = withStyles(styles)(Editor);

const SubscriptionWrapper = withTracker(({ graphId }) => {
  const subscription = Meteor.subscribe('teacher.graph', graphId);
  return { ready: subscription.ready() };
})(StyledEditor);

const RawGraph = ({ store }) => (
  <SubscriptionWrapper key={store.graphId} graphId={store.graphId} />
);

export default connect(RawGraph);
