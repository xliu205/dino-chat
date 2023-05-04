export default function Avatar({ userId, username, online}) {
    const colors = ['bg-red-200', 'bg-green-200',
    'bg-blue-200', 'bg-yellow-200',
     'bg-pink-200', 'bg-purple-200', 
     'bg-indigo-200', 'bg-gray-200'];
     const userIdBase10 = parseInt(userId, 16);
     const colorIndex = userIdBase10 % colors.length;
     const color = colors[colorIndex];
    return (
      <div
        className={
          "w-8 h-8 relative bg-red-200 rounded-full flex items-center" + color
        }>
        <div className="text-center w-full opacity-70">{username[0]}</div>
        {online && (
          // console.log("online:", online),
          <div className="absolute w-3 h-3 -right-0 bg-green-400 rounded-full border border-white bottom-0 right-2"></div>
        )}
      </div>
    );
}
