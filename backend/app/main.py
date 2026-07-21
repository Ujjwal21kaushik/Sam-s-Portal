from datetime import datetime, date, timedelta, timezone
import os
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError 
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, ConfigDict
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import create_engine, String, Integer, Boolean, Date, DateTime, Text, Float, ForeignKey, or_, text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker, Session

class Settings(BaseSettings):
    database_url: str = 'sqlite:///./college.db'
    secret_key: str = 'college-local-development-secret'
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')
settings=Settings()
if settings.database_url.startswith('postgresql://'):
    settings.database_url=settings.database_url.replace('postgresql://','postgresql+psycopg://',1)
engine=create_engine(settings.database_url,connect_args={'check_same_thread':False} if settings.database_url.startswith('sqlite') else {})
SessionLocal=sessionmaker(bind=engine,autoflush=False)

allowed_origins=[origin.strip() for origin in os.getenv('ALLOWED_ORIGINS','http://localhost:5173').split(',') if origin.strip()]

class Base(DeclarativeBase): pass
class User(Base):
    __tablename__='users'; id:Mapped[int]=mapped_column(primary_key=True); name:Mapped[str]=mapped_column(String(120)); email:Mapped[str]=mapped_column(String(150),unique=True); password_hash:Mapped[str]=mapped_column(String(255)); role:Mapped[str]=mapped_column(String(20)); is_active:Mapped[bool]=mapped_column(Boolean,default=True)
class Department(Base):
    __tablename__='departments'; id:Mapped[int]=mapped_column(primary_key=True); name:Mapped[str]=mapped_column(String(120),unique=True); code:Mapped[str]=mapped_column(String(12),unique=True); hod:Mapped[Optional[str]]=mapped_column(String(120),nullable=True); description:Mapped[Optional[str]]=mapped_column(Text,nullable=True)
class Student(Base):
    __tablename__='students'; id:Mapped[int]=mapped_column(primary_key=True); roll_number:Mapped[str]=mapped_column(String(30),unique=True); name:Mapped[str]=mapped_column(String(120)); email:Mapped[str]=mapped_column(String(150),unique=True); phone:Mapped[Optional[str]]=mapped_column(String(25),nullable=True); gender:Mapped[Optional[str]]=mapped_column(String(20),nullable=True); semester:Mapped[int]=mapped_column(Integer,default=1); year:Mapped[int]=mapped_column(Integer,default=1); attendance_percent:Mapped[float]=mapped_column(Float,default=85); department_id:Mapped[Optional[int]]=mapped_column(ForeignKey('departments.id'),nullable=True); admission_date:Mapped[date]=mapped_column(Date,default=date.today)
class Faculty(Base):
    __tablename__='faculty'; id:Mapped[int]=mapped_column(primary_key=True); name:Mapped[str]=mapped_column(String(120)); email:Mapped[str]=mapped_column(String(150),unique=True); phone:Mapped[Optional[str]]=mapped_column(String(25),nullable=True); designation:Mapped[str]=mapped_column(String(80),default='Assistant Professor'); department_id:Mapped[Optional[int]]=mapped_column(ForeignKey('departments.id'),nullable=True)
class Course(Base):
    __tablename__='courses'; id:Mapped[int]=mapped_column(primary_key=True); name:Mapped[str]=mapped_column(String(120)); duration:Mapped[str]=mapped_column(String(40),default='4 Years'); credits:Mapped[int]=mapped_column(Integer,default=160); department_id:Mapped[Optional[int]]=mapped_column(ForeignKey('departments.id'),nullable=True)
class Subject(Base):
    __tablename__='subjects'; id:Mapped[int]=mapped_column(primary_key=True); name:Mapped[str]=mapped_column(String(120)); code:Mapped[str]=mapped_column(String(20),unique=True); credits:Mapped[int]=mapped_column(Integer,default=4); semester:Mapped[int]=mapped_column(Integer,default=1); department_id:Mapped[Optional[int]]=mapped_column(ForeignKey('departments.id'),nullable=True)
class Notice(Base):
    __tablename__='notices'; id:Mapped[int]=mapped_column(primary_key=True); title:Mapped[str]=mapped_column(String(200)); content:Mapped[str]=mapped_column(Text); pinned:Mapped[bool]=mapped_column(Boolean,default=False); created_at:Mapped[datetime]=mapped_column(DateTime,default=datetime.utcnow)
class Event(Base):
    __tablename__='events'; id:Mapped[int]=mapped_column(primary_key=True); title:Mapped[str]=mapped_column(String(200)); description:Mapped[Optional[str]]=mapped_column(Text,nullable=True); event_date:Mapped[date]=mapped_column(Date); venue:Mapped[Optional[str]]=mapped_column(String(160),nullable=True)
class Company(Base):
    __tablename__='companies'; id:Mapped[int]=mapped_column(primary_key=True); name:Mapped[str]=mapped_column(String(120),unique=True); industry:Mapped[Optional[str]]=mapped_column(String(120),nullable=True)
class Placement(Base):
    __tablename__='placements'; id:Mapped[int]=mapped_column(primary_key=True); company_id:Mapped[Optional[int]]=mapped_column(ForeignKey('companies.id'),nullable=True); role:Mapped[str]=mapped_column(String(120)); package_lpa:Mapped[float]=mapped_column(Float); eligibility:Mapped[Optional[str]]=mapped_column(String(200),nullable=True)
class Attendance(Base):
    __tablename__='attendance'; id:Mapped[int]=mapped_column(primary_key=True); student_id:Mapped[int]=mapped_column(ForeignKey('students.id')); faculty_id:Mapped[Optional[int]]=mapped_column(ForeignKey('faculty.id'),nullable=True); subject:Mapped[str]=mapped_column(String(120)); attendance_date:Mapped[date]=mapped_column(Date,default=date.today); status:Mapped[str]=mapped_column(String(12),default='Present')
class Mark(Base):
    __tablename__='marks'; id:Mapped[int]=mapped_column(primary_key=True); student_id:Mapped[int]=mapped_column(ForeignKey('students.id')); subject:Mapped[str]=mapped_column(String(120)); semester:Mapped[int]=mapped_column(Integer); internal:Mapped[float]=mapped_column(Float,default=0); practical:Mapped[float]=mapped_column(Float,default=0); external:Mapped[float]=mapped_column(Float,default=0)
class LeaveRequest(Base):
    __tablename__='leave_requests'; id:Mapped[int]=mapped_column(primary_key=True); student_id:Mapped[int]=mapped_column(ForeignKey('students.id')); reason:Mapped[str]=mapped_column(Text); from_date:Mapped[date]=mapped_column(Date); to_date:Mapped[date]=mapped_column(Date); status:Mapped[str]=mapped_column(String(20),default='Pending'); created_at:Mapped[datetime]=mapped_column(DateTime,default=datetime.utcnow)

class Login(BaseModel): email:EmailStr; password:str
class ChangePassword(BaseModel): current_password:str; new_password:str
class DepartmentData(BaseModel): name:str; code:str; hod:Optional[str]=None; description:Optional[str]=None
class StudentData(BaseModel): roll_number:str; name:str; email:EmailStr; phone:Optional[str]=None; gender:Optional[str]=None; semester:int=1; year:int=1; attendance_percent:float=85; department_id:Optional[int]=None; admission_date:Optional[date]=None
class FacultyData(BaseModel): name:str; email:EmailStr; phone:Optional[str]=None; designation:str='Assistant Professor'; department_id:Optional[int]=None
class CourseData(BaseModel): name:str; duration:str='4 Years'; credits:int=160; department_id:Optional[int]=None
class SubjectData(BaseModel): name:str; code:str; credits:int=4; semester:int=1; department_id:Optional[int]=None
class NoticeData(BaseModel): title:str; content:str; pinned:bool=False
class EventData(BaseModel): title:str; description:Optional[str]=None; event_date:date; venue:Optional[str]=None
class CompanyData(BaseModel): name:str; industry:Optional[str]=None
class PlacementData(BaseModel): company_id:Optional[int]=None; role:str; package_lpa:float; eligibility:Optional[str]=None
class AttendanceData(BaseModel): student_id:int; subject:str; attendance_date:date; status:str='Present'
class MarkData(BaseModel): student_id:int; subject:str; semester:int; internal:float=0; practical:float=0; external:float=0
class LeaveData(BaseModel): reason:str; from_date:date; to_date:date

pwd=CryptContext(schemes=['bcrypt'],deprecated='auto'); oauth=OAuth2PasswordBearer(tokenUrl='api/auth/login')
def db_session():
    db=SessionLocal()
    try: yield db
    finally: db.close()
def current(token:str=Depends(oauth),db:Session=Depends(db_session)):
    try: uid=int(jwt.decode(token,settings.secret_key,algorithms=['HS256'])['sub'])
    except (JWTError,KeyError,ValueError): raise HTTPException(401,'Invalid authentication token')
    user=db.get(User,uid)
    if not user: raise HTTPException(401,'Account not found')
    return user
def admin(user:User=Depends(current)):
    if user.role!='admin': raise HTTPException(403,'Administrator access required')
    return user
app=FastAPI(title='College Management Portal API')
app.add_middleware(CORSMiddleware,allow_origins=allowed_origins,allow_methods=['*'],allow_headers=['*'],allow_credentials=True)
@app.on_event('startup')
def startup():
    Base.metadata.create_all(engine)
    if settings.database_url.startswith('sqlite'):
        with engine.begin() as conn:
            cols=[row[1] for row in conn.execute(text('PRAGMA table_info(students)'))]
            if 'attendance_percent' not in cols: conn.execute(text('ALTER TABLE students ADD COLUMN attendance_percent FLOAT DEFAULT 85'))
    db=SessionLocal()
    if not db.query(User).first():
        db.add_all([User(name='System Administrator',email='admin@campus.edu',password_hash=pwd.hash('Admin@123'),role='admin'),User(name='Dr. Priya Sharma',email='faculty@campus.edu',password_hash=pwd.hash('Faculty@123'),role='faculty'),User(name='Aarav Mehta',email='student@campus.edu',password_hash=pwd.hash('Student@123'),role='student')])
        ds=[Department(name=n,code=f'D{i:02}',hod=f'Dr. {n} Head',description=f'Academic department of {n}') for i,n in enumerate(['Computer Science','Information Technology','Electronics','Mechanical','Civil','Business','Mathematics','Humanities'],1)];db.add_all(ds);db.flush()
        db.add_all([Course(name=f'B.Tech {d.name}',department_id=d.id) for d in ds]);db.add_all([Faculty(name=f'Dr. Faculty {i}',email=f'faculty{i}@campus.edu',department_id=ds[i%8].id) for i in range(1,16)])
        db.add_all([Student(roll_number=f'2026{1000+i}',name=f'Student {i}',email=f'student{i}@campus.edu',gender='Female' if i%2 else 'Male',semester=i%8+1,year=i%4+1,attendance_percent=55+(i*7)%45,department_id=ds[i%8].id) for i in range(1,101)])
        db.add_all([Subject(name=f'Core Subject {i}',code=f'SUB{i:03}',semester=i%8+1,department_id=ds[i%8].id) for i in range(1,21)])
        db.add_all([Notice(title=f'Campus Notice {i}',content='Please see the academic portal for complete information.',pinned=i<4) for i in range(1,21)])
        db.add_all([Event(title=f'College Event {i}',description='An engaging campus event.',event_date=date.today()+timedelta(days=i*5),venue='Main Auditorium') for i in range(1,11)])
        cs=[Company(name=n,industry='Technology') for n in ['Infosys','TCS','Wipro','Accenture','Microsoft','Google','Deloitte','IBM','Amazon','Capgemini']];db.add_all(cs);db.flush();db.add_all([Placement(company_id=c.id,role='Graduate Engineer',package_lpa=5.5+i*.6,eligibility='CGPA 6.5+') for i,c in enumerate(cs)]);db.commit()
    # Always add individual demo portal accounts, including when the database already exists.
    for i in range(1,16):
        email=f'faculty{i}@campus.edu'
        if not db.query(User).filter(User.email==email).first(): db.add(User(name=f'Dr. Faculty {i}',email=email,password_hash=pwd.hash(f'Faculty{i}@123'),role='faculty'))
    for i in range(1,11):
        email=f'student{i}@campus.edu'
        if not db.query(User).filter(User.email==email).first(): db.add(User(name=f'Student {i}',email=email,password_hash=pwd.hash(f'Student{i}@123'),role='student'))
    db.commit()
    subject_names=['Data Structures','Database Systems','Operating Systems','Computer Networks','Software Engineering']
    students=db.query(Student).all(); faculties=db.query(Faculty).all()
    for i,student in enumerate(students):
        if student.attendance_percent is None: student.attendance_percent=55+(i*7)%45
        for j,subject in enumerate(subject_names):
            exists=db.query(Mark).filter(Mark.student_id==student.id,Mark.subject==subject).first()
            if not exists: db.add(Mark(student_id=student.id,subject=subject,semester=student.semester,internal=18+(i+j)%7,practical=16+(i+j)%5,external=45+(i+j)%18))
        exists_att=db.query(Attendance).filter(Attendance.student_id==student.id,Attendance.attendance_date==date.today()).first()
        if faculties and not exists_att: db.add(Attendance(student_id=student.id,faculty_id=faculties[(student.id-1)%len(faculties)].id,subject='Data Structures',attendance_date=date.today(),status='Present'))
    db.commit()
    db.close()
@app.get('/health')
def health(): return {'status':'ok'}
@app.post('/api/auth/login')
def login(data:Login,db:Session=Depends(db_session)):
    user=db.query(User).filter(User.email==data.email).first()
    if not user or not pwd.verify(data.password,user.password_hash): raise HTTPException(401,'Incorrect email or password')
    return {'access_token':jwt.encode({'sub':str(user.id),'exp':datetime.now(timezone.utc)+timedelta(hours=8)},settings.secret_key,algorithm='HS256'),'token_type':'bearer'}
@app.get('/api/auth/me')
def me(user:User=Depends(current)): return {'id':user.id,'name':user.name,'email':user.email,'role':user.role}
@app.post('/api/auth/change-password')
def change(data:ChangePassword,user:User=Depends(current),db:Session=Depends(db_session)):
    if not pwd.verify(data.current_password,user.password_hash): raise HTTPException(400,'Current password is incorrect')
    user.password_hash=pwd.hash(data.new_password);db.commit();return {'message':'Password updated'}
@app.get('/api/dashboard/stats')
def stats(db:Session=Depends(db_session),_:User=Depends(current)): return {'students':db.query(Student).count(),'faculty':db.query(Faculty).count(),'departments':db.query(Department).count(),'courses':db.query(Course).count(),'placements':db.query(Placement).count(),'attendance':91,'revenue':2450000,'notices':db.query(Notice).count(),'events':db.query(Event).count()}
def student_for(user,db):
    student=db.query(Student).filter(Student.email==user.email).first()
    if not student: raise HTTPException(404,'Student profile not found')
    return student
@app.get('/api/portal/student')
def student_portal(user:User=Depends(current),db:Session=Depends(db_session)):
    if user.role!='student': raise HTTPException(403,'Student access required')
    s=student_for(user,db); adviser=db.query(Faculty).offset((s.id-1)%max(db.query(Faculty).count(),1)).first()
    return {'student':{'id':s.id,'name':s.name,'roll_number':s.roll_number,'semester':s.semester,'year':s.year,'attendance_percent':s.attendance_percent},'adviser':adviser.name if adviser else 'Not assigned','timetable':weekly_timetable(s.semester),'marks':mark_rows(db,s.id),'attendance':attendance_rows(db,s.id),'leaves':leave_rows(db,s.id)}
@app.get('/api/portal/faculty')
def faculty_portal(user:User=Depends(current),db:Session=Depends(db_session)):
    if user.role!='faculty': raise HTTPException(403,'Faculty access required')
    faculty=db.query(Faculty).filter(Faculty.email==user.email).first()
    if not faculty: raise HTTPException(404,'Faculty profile not found')
    students=db.query(Student).filter((Student.id-1)%15==faculty.id-1).all()
    today=date.today()
    rows=[]
    for s in students:
        latest=db.query(Attendance).filter(Attendance.student_id==s.id,Attendance.faculty_id==faculty.id,Attendance.attendance_date==today).order_by(Attendance.id.desc()).first()
        rows.append({'id':s.id,'name':s.name,'roll_number':s.roll_number,'semester':s.semester,'attendance_percent':s.attendance_percent,'today_status':latest.status if latest else 'Not marked'})
    return {'faculty':{'id':faculty.id,'name':faculty.name,'designation':faculty.designation},'adviser_class':f'Year {(faculty.id-1)%4+1}, Semester {(faculty.id-1)%8+1}','students':rows,'timetable':weekly_timetable((faculty.id-1)%8+1)}
def weekly_timetable(semester):
    days=['Monday','Tuesday','Wednesday','Thursday','Friday']; times=['09:00–10:00','10:15–11:15','11:30–12:30','02:00–03:00']
    return [{'day':d,'classes':[{'time':t,'subject':f'Core Subject {semester}','room':f'B-{101+i}'} for i,t in enumerate(times[:3])] } for d in days]
def weekly_timetable(semester):
    days=['Monday','Tuesday','Wednesday','Thursday','Friday']; times=['09:00-10:00','10:15-11:15','11:30-12:30','02:00-03:00']; subjects=['Data Structures','Database Systems','Operating Systems','Computer Networks','Software Engineering']
    monday=date.today()-timedelta(days=date.today().weekday())
    return [{'day':d,'date':str(monday+timedelta(days=day_index)),'classes':[{'time':t,'subject':subjects[(semester+day_index+i)%len(subjects)],'room':f'B-{101+day_index*4+i}'} for i,t in enumerate(times)]} for day_index,d in enumerate(days)]
def mark_rows(db,student_id):
    return [{'id':m.id,'subject':m.subject,'semester':m.semester,'internal':m.internal,'practical':m.practical,'external':m.external,'total':m.internal+m.practical+m.external,'grade':'A' if m.internal+m.practical+m.external>=75 else 'B'} for m in db.query(Mark).filter(Mark.student_id==student_id).all()]
def attendance_rows(db,student_id):
    student=db.get(Student,student_id)
    return [{'id':a.id,'day':a.attendance_date.strftime('%A'),'date':str(a.attendance_date),'subject':a.subject,'status':a.status,'percentage':f'{student.attendance_percent:g}%' if student else '-'} for a in db.query(Attendance).filter(Attendance.student_id==student_id).order_by(Attendance.attendance_date.desc(),Attendance.id.desc()).all()]
def refresh_attendance_percent(db,student_id):
    rows=db.query(Attendance).filter(Attendance.student_id==student_id).all();student=db.get(Student,student_id)
    if student and rows: student.attendance_percent=round(sum(1 for r in rows if r.status=='Present')*100/len(rows),1)
def leave_rows(db,student_id): return [{'id':x.id,'reason':x.reason,'from_date':str(x.from_date),'to_date':str(x.to_date),'status':x.status} for x in db.query(LeaveRequest).filter(LeaveRequest.student_id==student_id).order_by(LeaveRequest.id.desc()).all()]
@app.post('/api/leaves',status_code=201)
def submit_leave(data:LeaveData,user:User=Depends(current),db:Session=Depends(db_session)):
    if user.role!='student': raise HTTPException(403,'Only students can submit leave')
    leave=LeaveRequest(student_id=student_for(user,db).id,**data.model_dump());db.add(leave);db.commit();db.refresh(leave);return leave
@app.get('/api/leaves')
def list_leaves(user:User=Depends(current),db:Session=Depends(db_session)):
    if user.role!='admin': raise HTTPException(403,'Administrator access required')
    return [{'id':x.id,'student':db.get(Student,x.student_id).name,'reason':x.reason,'from_date':str(x.from_date),'to_date':str(x.to_date),'status':x.status} for x in db.query(LeaveRequest).order_by(LeaveRequest.id.desc()).all()]
@app.put('/api/leaves/{leave_id}/approve')
def approve_leave(leave_id:int,user:User=Depends(admin),db:Session=Depends(db_session)):
    leave=db.get(LeaveRequest,leave_id)
    if not leave: raise HTTPException(404,'Leave request not found')
    leave.status='Approved';db.commit();return {'message':'Leave approved'}
@app.get('/api/marks')
def get_marks(user:User=Depends(current),db:Session=Depends(db_session)):
    if user.role=='student': return mark_rows(db,student_for(user,db).id)
    if user.role!='admin': raise HTTPException(403,'Administrator access required')
    return [{'id':m.id,'student_id':m.student_id,'student':db.get(Student,m.student_id).name,'subject':m.subject,'semester':m.semester,'internal':m.internal,'practical':m.practical,'external':m.external} for m in db.query(Mark).order_by(Mark.student_id.asc(),Mark.semester.asc(),Mark.subject.asc()).all()]
@app.post('/api/marks',status_code=201)
def add_mark(data:MarkData,user:User=Depends(admin),db:Session=Depends(db_session)):
    m=Mark(**data.model_dump());db.add(m);db.commit();db.refresh(m);return m
@app.put('/api/marks/{mark_id}')
def update_mark(mark_id:int,data:MarkData,user:User=Depends(admin),db:Session=Depends(db_session)):
    m=db.get(Mark,mark_id)
    if not m: raise HTTPException(404,'Mark not found')
    for k,v in data.model_dump().items():setattr(m,k,v)
    db.commit();return m
@app.get('/api/attendance')
def get_attendance(user:User=Depends(current),db:Session=Depends(db_session)):
    if user.role=='student': return attendance_rows(db,student_for(user,db).id)
    if user.role=='faculty':
        f=db.query(Faculty).filter(Faculty.email==user.email).first();return [{'id':a.id,'student_id':a.student_id,'student':db.get(Student,a.student_id).name,'day':a.attendance_date.strftime('%A'),'subject':a.subject,'date':str(a.attendance_date),'status':a.status,'percentage':f'{db.get(Student,a.student_id).attendance_percent:g}%'} for a in db.query(Attendance).filter(Attendance.faculty_id==f.id).order_by(Attendance.student_id.asc(),Attendance.attendance_date.asc(),Attendance.subject.asc()).all()]
    return [{'id':a.id,'student_id':a.student_id,'student':db.get(Student,a.student_id).name,'day':a.attendance_date.strftime('%A'),'subject':a.subject,'date':str(a.attendance_date),'status':a.status,'percentage':f'{db.get(Student,a.student_id).attendance_percent:g}%'} for a in db.query(Attendance).order_by(Attendance.student_id.asc(),Attendance.attendance_date.asc(),Attendance.subject.asc()).all()]
@app.post('/api/attendance',status_code=201)
def mark_attendance(data:AttendanceData,user:User=Depends(current),db:Session=Depends(db_session)):
    if user.role not in ('admin','faculty'): raise HTTPException(403,'Faculty or administrator access required')
    faculty=db.query(Faculty).filter(Faculty.email==user.email).first() if user.role=='faculty' else None
    if faculty:
        if data.attendance_date!=date.today(): raise HTTPException(400,'Faculty can mark attendance for the current day only')
        student=db.get(Student,data.student_id)
        if not student or (student.id-1)%15!=faculty.id-1: raise HTTPException(403,'This student is not assigned under you')
    existing=db.query(Attendance).filter(Attendance.student_id==data.student_id,Attendance.subject==data.subject,Attendance.attendance_date==data.attendance_date,Attendance.faculty_id==(faculty.id if faculty else None)).first()
    if existing:
        existing.status=data.status;a=existing
    else:
        a=Attendance(**data.model_dump(),faculty_id=faculty.id if faculty else None);db.add(a)
    refresh_attendance_percent(db,data.student_id);db.commit();db.refresh(a);return a
@app.put('/api/attendance/{attendance_id}')
def update_attendance(attendance_id:int,data:AttendanceData,user:User=Depends(admin),db:Session=Depends(db_session)):
    a=db.get(Attendance,attendance_id)
    if not a: raise HTTPException(404,'Attendance record not found')
    for k,v in data.model_dump().items(): setattr(a,k,v)
    refresh_attendance_percent(db,data.student_id);db.commit();db.refresh(a);return a
def resources(path,model,schema,fields):
    @app.get('/api/'+path)
    def list_items(q:Optional[str]=Query(None),db:Session=Depends(db_session),_:User=Depends(current)):
        query=db.query(model)
        if q: query=query.filter(or_(*[getattr(model,f).ilike('%'+q+'%') for f in fields]))
        return query.order_by(model.id.asc()).all()
    @app.post('/api/'+path,status_code=201)
    def create_item(data:schema,db:Session=Depends(db_session),_:User=Depends(admin)):
        obj=model(**data.model_dump(exclude_none=True));db.add(obj)
        try: db.commit()
        except Exception: db.rollback();raise HTTPException(409,'A record with this unique value already exists')
        db.refresh(obj);return obj
    @app.put('/api/'+path+'/{record_id}')
    def update_item(record_id:int,data:schema,db:Session=Depends(db_session),_:User=Depends(admin)):
        obj=db.get(model,record_id)
        if not obj: raise HTTPException(404,'Record not found')
        for key,value in data.model_dump(exclude_none=True).items(): setattr(obj,key,value)
        db.commit();db.refresh(obj);return obj
    @app.delete('/api/'+path+'/{record_id}',status_code=204)
    def delete_item(record_id:int,db:Session=Depends(db_session),_:User=Depends(admin)):
        obj=db.get(model,record_id)
        if not obj: raise HTTPException(404,'Record not found')
        db.delete(obj);db.commit()
resources('departments',Department,DepartmentData,['name','code','hod']);resources('students',Student,StudentData,['name','email','roll_number']);resources('faculty',Faculty,FacultyData,['name','email','designation']);resources('courses',Course,CourseData,['name']);resources('subjects',Subject,SubjectData,['name','code']);resources('notices',Notice,NoticeData,['title','content']);resources('events',Event,EventData,['title','venue']);resources('companies',Company,CompanyData,['name','industry']);resources('placements',Placement,PlacementData,['role','eligibility'])
