import { CommonProfileLikeType } from '@/Type/Application/Users/UsersProfile';
import IconList from './IconList';
import { List } from 'reactstrap';

const CommonProfileLike:React.FC<CommonProfileLikeType> = ({commentsNumber,likeNumber}) => {
  return (
    <div className="like-comment">
      <List type="inline">
        <IconList endNumber={likeNumber} like />
        <IconList endNumber={commentsNumber}  />
      </List>
    </div>
  )
}

export default CommonProfileLike