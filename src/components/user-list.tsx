import { $playerState, $userInfo, $userStatus } from "@/store/player"
import { useStore } from '@nanostores/react'
import { useEffect } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { socket } from "./socket"
import { ClientMessage, ServerMessage } from "@/lib/types/message"

export const UserList = ({ roomName }: { roomName: string }) => {
    const userStatus = useStore($userStatus)
    const userInfo = useStore($userInfo)
    const playerState = useStore($playerState)
    useEffect(() => {
        const interval = setInterval(() => {
            socket.emit("getRoomInfo", JSON.stringify({
                username: userInfo?.username,
                room: roomName
            } as ClientMessage))
        }, 1000)

        function onRoomInfo(d: any) {
            console.log('get room info response', JSON.parse(d) as ServerMessage);
            const msg = JSON.parse(d) as ServerMessage
            if (!msg.userStatus) {
                return
            }
            $userStatus.set([
                ...msg.userStatus
            ])
            $playerState.set({
                url: msg.url
            })
        }
        playerState.length == 0 && socket.on('roomInfo', onRoomInfo)
        return () => {
            clearInterval(interval)
            socket.off('roomInfo', onRoomInfo)
        }
    }, [])

    return (
        <Table key={userStatus.length}>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[72px]">用户名</TableHead>
                    <TableHead className="text-center">时间</TableHead>
                    <TableHead className="text-center">状态</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {userStatus.map((user) => (
                    <TableRow key={user.userID}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell className="text-center">{user.time}sec</TableCell>
                        <TableCell className="text-center">{user.playing == true ? '播放中' : '暂停中'}</TableCell>
                    </TableRow>
                ))}
                {userStatus.length == 0 && <><TableRow>
                    <TableCell className="text-center h-full align-middle" colSpan={3}>该房间暂无用户</TableCell>
                </TableRow></>}
            </TableBody>
            <TableFooter>
            </TableFooter>
        </Table>
    )
}