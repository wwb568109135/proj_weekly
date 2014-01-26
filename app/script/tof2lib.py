# coding=utf-8
#!/usr/bin/env python

import os
import base64
import time
import httplib

UNICODE = "utf-8"

def escape(s):
    return s.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;').replace("'",'&apos;').replace('"','&quot;')

def today():
    return time.strftime("%Y-%m-%d")

TOF_TEMPALTE = u"""
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ten="http://schemas.datacontract.org/2004/07/Tencent.OA.Framework.Context" xmlns:tem="http://tempuri.org/" xmlns:ten1="http://schemas.datacontract.org/2004/07/Tencent.OA.Framework.Messages.DataContract">
    <soapenv:Header>
       <Application_Context>
          <ten:AppKey>%s</ten:AppKey>
       </Application_Context>
    </soapenv:Header>
    <soapenv:Body>%s</soapenv:Body>
</soapenv:Envelope>
"""

class MessageHelper:
    HOST = "ws.tof.oa.com"
    PORT = 80
    URL = "/MessageService.svc"
    METHOD = "POST"
    def __init__(self, appkey):
        """
        @param appkey: 申请的appkey
        @note: appkey一定要与本机ip对应
        """
        self.appkey = appkey
        
    def send(self, message):
        data = TOF_TEMPALTE%(self.appkey, message)
        # ========== soap request ==========
        headers = {'Host': self.HOST,
            'Content-Type': 'text/xml; charset="%s"'%UNICODE,
            'SOAPAction': message.SOAPAction,
            }
        
        if isinstance(data, unicode):
            data = data.encode(UNICODE)
        conn = httplib.HTTPConnection(self.HOST, self.PORT)
        conn.request(self.METHOD, self.URL, data, headers)
        conn.send(data)
        
        # ========== soap response ==========
        response = conn.getresponse()
        status = response.status
        reason = response.reason
        data = response.read()
        response.close()
        
        if status != 200:
            errmsg = "SOAP Response Error[%d]: %s\n %s"%(status, reason, data)
            raise Exception, errmsg
        else:
            print "SOAP Response Success"
    
    def send_rtx(self, sender, receiver, title, message, priority=None):
        rtx = TencentRTX()
        rtx.Receiver = receiver or rtx.Receiver
        rtx.Sender = sender or rtx.Sender
        rtx.Title = title or rtx.Title
        rtx.MsgInfo = message or rtx.MsgInfo
        rtx.Priority = priority or rtx.Priority
        self.send(rtx)
        
    def send_sms(self, sender, receiver, message, priority=None):
        sms = TencentSMS()
        sms.Sender = sender or sms.Sender
        sms.Receiver = receiver or sms.Receiver
        sms.MsgInfo = message or sms.MsgInfo
        sms.Priority = priority or sms.Priority
        self.send(sms)
        
    def send_mail(self, sender, receiver, title, message, bcc=None, cc=None, type=None,
                    priority=None, format=None, attachments=None, organizer=None, status=None,
                    location=None, start_time=None, end_time=None):
        mail = TencentMail()
        mail.From = sender or mail.From
        mail.To = receiver or mail.To
        mail.Title = title or mail.Title
        mail.Content = message or mail.Content
        mail.Bcc = bcc or mail.Bcc
        mail.CC = cc or mail.Bcc
        mail.EmailType = type or mail.EmailType
        mail.Priority = priority or mail.Priority
        mail.BodyFormat = format or mail.BodyFormat
        mail.Organizer = organizer or mail.Organizer
        mail.MessageStatus = status or mail.MessageStatus
        mail.Location = location or mail.Location
        mail.StartTime = start_time or mail.StartTime
        mail.EndTime = end_time or mail.EndTime
        if attachments:
            if isinstance(attachments, (str, unicode)):
                attachments = [attachments]
            for attachment in attachments:
                mail.Attachments.append(TencentMailAttachment(attachment))
        self.send(mail)
        
                
class BaseMessage(object):
    PRIORITY_LOW = "Low"
    PRIORITY_NORMAL = "Normal"
    PRIORITY_HEIGHT = "Height"
    def __init__(self):
        self.Priority = self.PRIORITY_NORMAL
        
    def __str__(self):
        raise ValueError, "Need Implemenet"
    
    
MAIL_TEMPLATE = """
<tem:SendMail>
   <tem:mail>
      <ten1:Attachments>
         %(Attachments)s
      </ten1:Attachments>
      <ten1:Bcc>%(Bcc)s</ten1:Bcc>
      <ten1:BodyFormat>%(BodyFormat)s</ten1:BodyFormat>
      <ten1:CC>%(CC)s</ten1:CC>
      <ten1:Content>%(Content)s</ten1:Content>
      <ten1:EmailType>%(EmailType)s</ten1:EmailType>
      <ten1:EndTime>%(EndTime)s</ten1:EndTime>
      <ten1:From>%(From)s</ten1:From>
      <ten1:Location>%(Location)s</ten1:Location>
      <ten1:MessageStatus>%(MessageStatus)s</ten1:MessageStatus>
      <ten1:Organizer>%(Organizer)s</ten1:Organizer>
      <ten1:Priority>%(Priority)s</ten1:Priority>
      <ten1:StartTime>%(StartTime)s</ten1:StartTime>
      <ten1:Title>%(Title)s</ten1:Title>
      <ten1:To>%(To)s</ten1:To>
   </tem:mail>
</tem:SendMail>
"""
class TencentMail(BaseMessage):
    SOAPAction = "http://tempuri.org/IMessageService/SendMail"
    
    FORMAT_HTML = "Html"
    FORMAT_PLAIN_TEXT = "Text"
    
    TYPE_TO_EXCHANGE = "SEND_TO_ENCHANGE"
    TYPE_TO_INTERNET = "SEND_TO_INTERNET"
    TYPE_TO_MEETING = "SEND_TO_MEETING"
    
    STATUS_PICKUP = "Pickup" #等待发送
    STATUS_POST = "Post" #已发送
    STATUS_QUEUE = "Queue" #发送失败后处于重发队列
    def __init__(self):
        """ 调用WEBSERVICE服务发送邮件的接口.
        @var Title: 邮件标题
        @var Content: 邮件内容
        @var From: 邮件发件人
        @var To: 邮件接受人, 多个接收人用;相隔
        @var CC: 邮件抄送人, 多个接收人用;相隔
        @var Bcc: 密件抄送人 , 多个接收人用;相隔
        @var MailType: 邮件类型
        @var Priority: 优先级
        @var BodyFormat: 邮件格式, 设置为FORMAT_HTML,FORMAT_PLAIN_TEXT
        @var Attachments: 附件
        @var Organizer: 会议组织者
        @var Location: 会议地点
        @var MessageStatus: 信息状态, 设置为STATUS_PICKUP,STATUS_POST,STATUS_QUEUE
        @var StartTime: 会议开始时间, 暂时只知道支持'yyyy-mm-dd'格式
        @var EndTime: 会议结束时间, 暂时只知道支持'yyyy-mm-dd'格式
        """
        BaseMessage.__init__(self)
        self.BodyFormat = self.FORMAT_PLAIN_TEXT
        self.EmailType = self.TYPE_TO_EXCHANGE
        self.From = ''
        self.To = ''
        self.Bcc = ''
        self.CC = ''
        self.Title = ''
        self.Content = ''
        self.Attachments = []
        self.Organizer = ''
        self.Location = ''
        self.MessageStatus = self.STATUS_QUEUE
        self.StartTime = today()
        self.EndTime = today()
        
    def __str__(self):
        args = vars(self).copy()
        args['Content'] = escape(args['Content'])
        args['Title'] = escape(args['Title'])
        args['Attachments'] = u"".join([unicode(att) for att in self.Attachments])
        return MAIL_TEMPLATE%args
    
MAIL_ACCACHMENT_TEMPLATE = """
<ten1:TencentMailAttachment>
    <ten1:FileContent>%(FileContent)s</ten1:FileContent>
    <ten1:FileName>%(FileName)s</ten1:FileName>
 </ten1:TencentMailAttachment>
"""
class TencentMailAttachment(object):
    def __init__(self, fpath, filename=None):
        """ 
        @param fpath: 附件文件的路径
        @param filename: 附件的文件名, 默认为原文件名
        """
        self.fpath = fpath
        if not os.path.isfile(fpath):
            raise IOError, u"该文件不存在"
        self.FileName = filename or os.path.split(fpath)[1]
        self.FileContent = base64.b64encode(open(fpath, "rb").read())
        self.FileContent = escape(self.FileContent)

    def __str__(self):
        return MAIL_ACCACHMENT_TEMPLATE%vars(self)

   
RTX_TEMPLATE = """
<tem:SendRTX>
   <!--Optional:-->
   <tem:message>
      <ten1:MsgInfo>%(MsgInfo)s</ten1:MsgInfo>
      <ten1:Priority>%(Priority)s</ten1:Priority>
      <ten1:Receiver>%(Receiver)s</ten1:Receiver>
      <ten1:Sender>%(Sender)s</ten1:Sender>
      <ten1:Title>%(Title)s</ten1:Title>
   </tem:message>
</tem:SendRTX>
""" 
class TencentRTX(BaseMessage):
    SOAPAction = "http://tempuri.org/IMessageService/SendRTX"
    def __init__(self):
        """ 调用WEBSERVICE服务发送RTX消息的接口.
        @var Sender:发送人,需要是有效的rtx用户,系统发送为"900",也可以是英文昵称如"mavisluo".
        @var Receiver:接收者.需要是有效的rtx用户,发送手机短信可以是用分号";"分割的多个用户,也可以是分号分割的多个手机号如"13422885961;13728695069".
        @var Title:标题
        @var MsgInfo:是发送的具体信息内容
        @var Priority:优先级
        """
        BaseMessage.__init__(self)
        self.Sender = '900'
        self.Receiver = ''
        self.Title = ''
        self.MsgInfo = ''
        
    def __str__(self):
        args = vars(self).copy()
        args['MsgInfo'] = escape(args['MsgInfo'])
        args['Title'] = escape(args['Title'])
        return RTX_TEMPLATE%args

        
SMS_TEMPLATE = """
<tem:SendSMS>
    <!--Optional:-->
    <tem:message>
       <ten1:MsgInfo>%(MsgInfo)s</ten1:MsgInfo>
       <ten1:Priority>%(Priority)s</ten1:Priority>
       <ten1:Receiver>%(Receiver)s</ten1:Receiver>
       <ten1:Sender>%(Sender)s</ten1:Sender>
    </tem:message>
</tem:SendSMS>
"""
class TencentSMS(BaseMessage):
    SOAPAction = "http://tempuri.org/IMessageService/SendSMS"
    def __init__(self):
        """ 调用WEBSERVICE服务发送短信的接口
        @var Sender: 短信发件人,系统发送为900
        @var Receiver: 短信接受人,多个接收人用;相隔
        @var MsgInfo: 短信内容
        @var Priority: 优先级
        """
        BaseMessage.__init__(self)
        self.Sender = '900'
        self.Receiver = ''
        self.MsgInfo = ''
        
    def __str__(self):
        args = vars(self).copy()
        args['MsgInfo'] = escape(args['MsgInfo'])
        return SMS_TEMPLATE%args

def send_email_msg(email_receiver, email_title, email_content):
    mail = TencentMail()
    mail.From = 'nelsonli@tencent.com'  
    mail.To =  email_receiver   
    mail.Title = email_title
    mail.Content = email_content           
    msghelper = MessageHelper("d5bbf8c146b944d49452b1003776b2e4")
    msghelper.send(mail)


def send_sms_msg(sms_receiver, sms_msg):
    sms = TencentSMS()
    sms.Sender = '9000'
    sms.Receiver = sms_receiver
    sms.MsgInfo = sms_msg
    msghelper = MessageHelper("d5bbf8c146b944d49452b1003776b2e4")
    msghelper.send(sms)


def send_rtx_msg(rtx_receiver, rtx_title, rtx_content):
    rtx = TencentRTX()
    rtx.Sender = '900' 
    rtx.Receiver = rtx_receiver
    rtx.Title = rtx_title
    rtx.MsgInfo = rtx_content
    msghelper = MessageHelper("d5bbf8c146b944d49452b1003776b2e4") 
    msghelper.send(rtx)


if __name__ == '__main__':
    send_email_msg('nelsonli@tencent.com','a test fot the title','a test for the content')
    send_sms_msg('18682150157','just a test.')
    send_rtx_msg('nelsonli','a test for the title','a test for the content')

