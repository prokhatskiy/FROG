import * as React from 'react';
import { type LearningItemT, HTML, withVisibility } from 'frog-utils';
import { Button } from '@material-ui/core';
import Play from '@material-ui/icons/PlayCircleFilled';
import Stop from '@material-ui/icons/Stop';
import ReactSound from 'react-sound';

const ThumbViewer = ({ data }) => (
  <React.Fragment>
    <img alt="rss logo" src="/file?name=op/op-rss/rss-logo.png" />
    <b>
      {data.title} <i>(from {data.blogtitle})</i>
    </b>
  </React.Fragment>
);

const Viewer = withVisibility(({ data, visible, toggleVisibility }) => (
  <React.Fragment>
    <img alt="rss logo" src="/file?name=op/op-rss/rss-logo.png" />
    <h4>{data.title} </h4>
    {data.enclosure && (
      <>
        <Button
          onClick={toggleVisibility}
          variant="fab"
          color="primary"
          aria-label={visible ? 'stop' : 'play'}
        >
          {visible ? <Stop /> : <Play />}
        </Button>
        <ReactSound
          url={data.enclosure}
          playStatus={
            visible ? ReactSound.status.PLAYING : ReactSound.status.STOPPED
          }
        />
      </>
    )}
    <br />
    <i>
      (from {data.blogtitle}
      {data.date && `, ${new Date(data.date).toLocaleDateString()} - `}
      {data.author && `by ${data.author})`})
    </i>
    <br />
    <br />
    <HTML html={data.content} />
  </React.Fragment>
));

export default ({
  name: 'RSS',
  id: 'li-rss',
  dataStructure: { title: '', content: '' },
  ThumbViewer,
  Viewer
}: LearningItemT<{ title: string, content: string }>);
